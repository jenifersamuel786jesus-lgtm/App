import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Camera, CameraOff, Volume2, VolumeX, User, AlertCircle } from 'lucide-react';
import { getPatientByProfileId, getKnownFaces, createKnownFace, updateKnownFace, createUnknownEncounter } from '@/db/api';
import type { Patient, KnownFace } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import * as faceapi from 'face-api.js';

export default function PatientFaceRecognitionPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [knownFaces, setKnownFaces] = useState<KnownFace[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentDetection, setCurrentDetection] = useState<{
    isKnown: boolean;
    name?: string;
    confidence?: number;
    faceId?: string;
    aiAnalysis?: string;
  } | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [noFaceDetectedCount, setNoFaceDetectedCount] = useState(0);
  
  // Form state for saving new face
  const [newFaceName, setNewFaceName] = useState('');
  const [newFaceRelationship, setNewFaceRelationship] = useState('');
  const [newFaceNotes, setNewFaceNotes] = useState('');
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastWhisperRef = useRef<string>('');
  const lastWhisperTimeRef = useRef<number>(0);

  useEffect(() => {
    loadData();
    loadModels();
    
    return () => {
      stopCamera();
    };
  }, []);

  const loadData = async () => {
    console.log('📥 loadData called');
    if (!profile) {
      console.log('❌ No profile, skipping loadData');
      return;
    }
    
    console.log('Loading patient data for profile:', profile.id);
    const patientData = await getPatientByProfileId(profile.id);
    if (patientData) {
      console.log('✅ Patient data loaded:', patientData.id, patientData.full_name);
      setPatient(patientData);
      
      console.log('Loading known faces for patient:', patientData.id);
      const faces = await getKnownFaces(patientData.id);
      console.log(`✅ Loaded ${faces.length} known faces:`, faces.map(f => ({
        id: f.id,
        name: f.person_name,
        hasEncoding: !!f.face_encoding,
        encodingLength: f.face_encoding?.length || 0,
      })));
      setKnownFaces(faces);
    } else {
      console.log('❌ No patient data found');
    }
  };

  const loadModels = async () => {
    try {
      setModelsLoading(true);
      setLoadingProgress('Initializing...');
      console.log('Starting to load face recognition models...');
      console.log('User agent:', navigator.userAgent);
      console.log('Platform:', navigator.platform);
      
      // Try multiple model URLs for better reliability
      const MODEL_URLS = [
        window.location.origin + '/models', // Primary: Same origin
        '/models', // Fallback 1: Relative path
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model', // Fallback 2: CDN
      ];
      
      let modelsLoadedSuccessfully = false;
      let lastError: Error | null = null;
      
      // Try each URL until one works
      for (let i = 0; i < MODEL_URLS.length && !modelsLoadedSuccessfully; i++) {
        const MODEL_URL = MODEL_URLS[i];
        console.log(`Attempt ${i + 1}/${MODEL_URLS.length}: Trying model URL:`, MODEL_URL);
        setLoadingProgress(`Attempt ${i + 1}/${MODEL_URLS.length}: Loading models...`);
        
        try {
          // Add timeout wrapper for each model load
          const loadWithTimeout = async (loadFn: () => Promise<void>, name: string, timeoutMs = 30000) => {
            console.log(`Loading ${name}...`);
            setLoadingProgress(`Attempt ${i + 1}: Loading ${name}...`);
            const startTime = Date.now();
            
            return Promise.race([
              loadFn(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Timeout loading ${name} after ${timeoutMs}ms`)), timeoutMs)
              )
            ]).then(() => {
              const duration = Date.now() - startTime;
              console.log(`✅ ${name} loaded successfully in ${duration}ms`);
            }).catch((error) => {
              console.error(`❌ Failed to load ${name}:`, error);
              throw error;
            });
          };
          
          // Load models with timeout
          await loadWithTimeout(
            () => faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            'Tiny Face Detector',
            30000
          );
          
          await loadWithTimeout(
            () => faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            'Face Landmark 68',
            30000
          );
          
          await loadWithTimeout(
            () => faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            'Face Recognition Net',
            30000
          );
          
          await loadWithTimeout(
            () => faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            'Face Expression Net',
            30000
          );
          
          console.log(`✅ All models loaded successfully from: ${MODEL_URL}`);
          modelsLoadedSuccessfully = true;
          break; // Exit loop on success
          
        } catch (error) {
          console.error(`❌ Failed to load models from ${MODEL_URL}:`, error);
          lastError = error instanceof Error ? error : new Error('Unknown error');
          
          // Continue to next URL if available
          if (i < MODEL_URLS.length - 1) {
            console.log(`Trying next URL...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          }
        }
      }
      
      if (!modelsLoadedSuccessfully) {
        throw lastError || new Error('Failed to load models from all sources');
      }
      
      setModelsLoaded(true);
      setModelsLoading(false);
      setLoadingProgress('');
      toast({
        title: 'Face Recognition Ready',
        description: 'Camera system is ready to use',
      });
      
      // Proactive guidance
      setTimeout(() => {
        whisper(`Face recognition is ready. Tap the start camera button to begin recognizing people. I will whisper their names to you when I see them.`);
      }, 2000);
    } catch (error) {
      console.error('❌ Error loading face detection models:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });
      
      // Provide specific error message based on error type
      let errorMessage = 'Face recognition cannot work without models. ';
      
      if (error instanceof Error) {
        if (error.message.includes('Timeout')) {
          errorMessage += 'Models are taking too long to load. Please check your internet connection and try again.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage += 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('404')) {
          errorMessage += 'Model files not found. Please contact support.';
        } else {
          errorMessage += 'Please refresh the page and try again.';
        }
      }
      
      toast({
        title: 'Model Loading Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setModelsLoading(false);
      setLoadingProgress('');
      // DO NOT set modelsLoaded to true if models failed to load!
      setModelsLoaded(false);
    }
  };

  const startCamera = async () => {
    console.log('startCamera called, modelsLoaded:', modelsLoaded);
    
    if (!modelsLoaded) {
      toast({
        title: 'Please Wait',
        description: 'Face recognition models are still loading...',
      });
      return;
    }

    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment', // Use back camera to detect other people
        },
        audio: false,
      });

      console.log('Camera access granted, stream:', stream);
      console.log('Stream active:', stream.active);
      console.log('Stream tracks:', stream.getTracks());

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        console.log('Video element configured');
        console.log('Video readyState:', videoRef.current.readyState);
        
        // Set camera active immediately
        setCameraActive(true);
        
        // Ensure video plays
        try {
          await videoRef.current.play();
          console.log('Video play() called successfully');
        } catch (playError) {
          console.error('Error calling play():', playError);
        }
        
        // Start face detection immediately and on multiple events
        console.log('Starting face detection immediately...');
        startFaceDetection();
        
        // Also start on metadata loaded
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          videoRef.current?.play().then(() => {
            console.log('Video playing after metadata loaded');
            console.log('Restarting face detection to ensure it runs...');
            startFaceDetection();
          }).catch(err => {
            console.error('Error playing video after metadata:', err);
          });
        };
        
        // Also start on canplay event
        videoRef.current.oncanplay = () => {
          console.log('Video can play event fired');
          console.log('Ensuring face detection is running...');
          startFaceDetection();
        };

        whisper('Camera activated. I will help you recognize people.');
        
        // Proactive guidance after 10 seconds if no face detected
        setTimeout(() => {
          if (cameraActive && !currentDetection) {
            whisper('Point your camera at someone\'s face. Make sure there is good lighting and the face is clearly visible.');
          }
        }, 10000);
        
        toast({
          title: 'Camera Started',
          description: 'Point the back camera at people to recognize them.',
        });
      } else {
        console.error('Video ref is null!');
        console.error('This should not happen. Video element should always be rendered.');
        toast({
          title: 'Video Element Error',
          description: 'Camera setup failed. Please refresh the page and try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Please allow camera access to use face recognition.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please ensure your device has a camera.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is in use by another application. Please close other apps using the camera.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints not supported. Trying with default settings...';
        // Try again with simpler constraints
        trySimpleCamera();
        return;
      }
      
      toast({
        title: 'Camera Access Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const trySimpleCamera = async () => {
    console.log('Trying simple camera configuration...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      console.log('Simple camera access granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        
        await videoRef.current.play();
        
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded (simple mode)');
          startFaceDetection();
        };

        toast({
          title: 'Camera Started',
          description: 'Using default camera settings.',
        });
      }
    } catch (error) {
      console.error('Simple camera also failed:', error);
      toast({
        title: 'Camera Failed',
        description: 'Unable to access camera. Please check your device settings.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
    setCurrentDetection(null);
    whisper('Camera deactivated.');
  };

  const startFaceDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Run detection every 2 seconds
    detectionIntervalRef.current = setInterval(async () => {
      await detectFaces();
    }, 2000);
  };

  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) {
      console.log('Detection skipped:', {
        hasVideo: !!videoRef.current,
        hasCanvas: !!canvasRef.current,
        modelsLoaded,
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video dimensions not ready yet:', video.videoWidth, 'x', video.videoHeight);
      return;
    }

    // Check if video is ready (less strict - allow HAVE_CURRENT_DATA or better)
    if (video.readyState < video.HAVE_CURRENT_DATA) {
      console.log('Video not ready yet, readyState:', video.readyState, '(need at least', video.HAVE_CURRENT_DATA, ')');
      return;
    }

    console.log('Running face detection...', {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      readyState: video.readyState,
    });

    let detections;
    try {
      // Detect faces
      console.log('Calling faceapi.detectAllFaces...');
      detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      console.log('Detection complete:', {
        facesFound: detections.length,
        detections: detections.map(d => ({
          box: d.detection.box,
          score: d.detection.score,
        })),
      });

      if (detections.length === 0) {
        console.log('No faces detected in this frame');
        setCurrentDetection(null);
        
        // Increment no face counter
        setNoFaceDetectedCount(prev => {
          const newCount = prev + 1;
          
          // After 3 consecutive detections with no face (6 seconds), announce it
          if (newCount === 3) {
            whisper('No face detected. Please point the camera at someone.');
            console.log('🔍 No face detected after 6 seconds');
          }
          
          return newCount;
        });
        
        return;
      }
      
      console.log('✅ Face(s) detected! Processing first face...');
      // Reset no face counter when face is detected
      setNoFaceDetectedCount(0);
    } catch (error) {
      console.error('❌ Error during face detection:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
      return;
    }

    // Get the first detected face
    const detection = detections[0];
    const descriptor = detection.descriptor;

    // Draw detection on canvas
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }

    // Match against known faces
    const match = await matchFace(descriptor);

    // Capture snapshot for AI analysis
    const snapshotCanvas = document.createElement('canvas');
    snapshotCanvas.width = video.videoWidth;
    snapshotCanvas.height = video.videoHeight;
    const snapshotCtx = snapshotCanvas.getContext('2d');
    let snapshotImage = '';
    if (snapshotCtx) {
      snapshotCtx.drawImage(video, 0, 0);
      snapshotImage = snapshotCanvas.toDataURL('image/jpeg', 0.8);
    }

    if (match.isKnown && match.name) {
      // Known face detected
      console.log(`✅ Known face detected: ${match.name}`);
      
      setCurrentDetection({
        isKnown: true,
        name: match.name,
        confidence: match.confidence,
        faceId: match.faceId,
      });
      
      // Get AI analysis for known person with activity description
      let fullMessage = `This is ${match.name}.`;
      
      if (snapshotImage) {
        const aiAnalysis = await analyzeWithAI(snapshotImage, true, match.name);
        if (aiAnalysis) {
          setCurrentDetection(prev => prev ? { ...prev, aiAnalysis } : null);
          // Combine name and activity into one message
          fullMessage = `This is ${match.name}. ${aiAnalysis}`;
          console.log('Combined message:', fullMessage);
        }
      }
      
      // Single whisper with combined message
      whisper(fullMessage);
      
      // Update last_seen for this face
      if (match.faceId) {
        await updateKnownFace(match.faceId, {
          last_seen: new Date().toISOString(),
        });
      }
    } else {
      // Unknown face detected
      console.log('🆕 Unknown face detected!');
      
      // Capture image for saving
      captureSnapshot(descriptor);
      
      // Get AI analysis for unknown person with activity description
      let fullMessage = 'You are meeting someone new.';
      
      if (snapshotImage) {
        const aiAnalysis = await analyzeWithAI(snapshotImage, false);
        if (aiAnalysis) {
          setCurrentDetection({
            isKnown: false,
            confidence: 0,
            aiAnalysis,
          });
          // Combine unknown message and activity into one message
          fullMessage = `You are meeting someone new. ${aiAnalysis}`;
          console.log('Combined message:', fullMessage);
          console.log('✅ Unknown person detection complete with AI analysis');
        } else {
          setCurrentDetection({
            isKnown: false,
            confidence: 0,
          });
          console.log('✅ Unknown person detection complete (no AI analysis)');
        }
      } else {
        setCurrentDetection({
          isKnown: false,
          confidence: 0,
        });
        console.log('✅ Unknown person detection complete (no snapshot)');
      }
      
      // Single whisper with combined message
      whisper(fullMessage);
      
      // Log unknown encounter
      if (patient) {
        await createUnknownEncounter({
          patient_id: patient.id,
          encounter_time: new Date().toISOString(),
          patient_action: 'detected',
        });
        console.log('📝 Unknown encounter logged to database');
      }
      
      // Proactive prompt to save after 3 seconds
      setTimeout(() => {
        if (!showSaveDialog && currentDetection && !currentDetection.isKnown) {
          whisper('Would you like to save this person? Tap the Save This Person button.');
          console.log('💬 Prompted user to save unknown person');
        }
      }, 3000);
    }
  };

  const matchFace = async (descriptor: Float32Array): Promise<{
    isKnown: boolean;
    name?: string;
    confidence?: number;
    faceId?: string;
  }> => {
    console.log('🔍 matchFace called');
    console.log('Known faces count:', knownFaces.length);
    console.log('Descriptor length:', descriptor.length);
    
    if (knownFaces.length === 0) {
      console.log('❌ No known faces to match against');
      return { isKnown: false };
    }

    const threshold = 0.6; // Similarity threshold (lower = more strict)
    let bestMatch: { name: string; distance: number; faceId: string } | null = null;

    console.log(`Matching against ${knownFaces.length} known faces...`);
    
    for (const face of knownFaces) {
      console.log(`Checking face: ${face.person_name} (ID: ${face.id})`);
      console.log('Face encoding present:', !!face.face_encoding);
      console.log('Face encoding length:', face.face_encoding?.length || 0);
      
      if (!face.face_encoding) {
        console.log(`⚠️ Skipping ${face.person_name} - no face encoding`);
        continue;
      }

      try {
        // Parse stored face encoding
        console.log(`Parsing face encoding for ${face.person_name}...`);
        const storedDescriptor = new Float32Array(JSON.parse(face.face_encoding));
        console.log('Stored descriptor length:', storedDescriptor.length);
        console.log('Stored descriptor sample:', Array.from(storedDescriptor.slice(0, 5)));
        
        // Calculate Euclidean distance
        const distance = faceapi.euclideanDistance(descriptor, storedDescriptor);
        console.log(`Distance to ${face.person_name}: ${distance.toFixed(4)} (threshold: ${threshold})`);

        if (distance < threshold) {
          console.log(`✅ ${face.person_name} is a potential match! (distance: ${distance.toFixed(4)})`);
          if (!bestMatch || distance < bestMatch.distance) {
            console.log(`🏆 ${face.person_name} is now the best match!`);
            bestMatch = {
              name: face.person_name,
              distance,
              faceId: face.id,
            };
          }
        } else {
          console.log(`❌ ${face.person_name} not a match (distance ${distance.toFixed(4)} > threshold ${threshold})`);
        }
      } catch (error) {
        console.error(`❌ Error matching face ${face.person_name}:`, error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          faceEncoding: face.face_encoding?.substring(0, 100) + '...',
        });
      }
    }

    if (bestMatch) {
      const confidence = Math.round((1 - bestMatch.distance) * 100);
      console.log(`✅ MATCH FOUND: ${bestMatch.name} (distance: ${bestMatch.distance.toFixed(4)}, confidence: ${confidence}%)`);
      return {
        isKnown: true,
        name: bestMatch.name,
        confidence,
        faceId: bestMatch.faceId,
      };
    }

    console.log('❌ No match found - this is an unknown person');
    return { isKnown: false };
  };

  const analyzeWithAI = async (imageBase64: string, isKnown: boolean, personName?: string): Promise<string> => {
    try {
      setAiAnalyzing(true);
      
      const APP_ID = import.meta.env.VITE_APP_ID;
      
      // Remove data:image/jpeg;base64, prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      
      const prompt = isKnown 
        ? `You are assisting an Alzheimer's patient. This is ${personName}, someone they know. Describe what ${personName} is doing right now (sitting, standing, walking, etc.) and what they're wearing. Keep it to 1-2 short sentences. Be warm and reassuring. Example: "${personName} is sitting down wearing a blue shirt." or "${personName} is standing and appears to be smiling."`
        : `You are assisting an Alzheimer's patient. They are meeting someone new. Describe what this person is doing (sitting, standing, walking, etc.) and their appearance (clothing, hair, distinctive features). Keep it to 1-2 short sentences. Be warm and reassuring. Example: "This person is standing and wearing a red jacket with short brown hair." or "This person is sitting down with glasses and a friendly smile."`;

      const response = await fetch(
        'https://api-integrations.appmedo.com/app-8g7cyjjxisxt/api-rLob8RdzAOl9/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-App-Id': APP_ID,
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: 'image/jpeg',
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.slice(6));
                if (jsonData.candidates?.[0]?.content?.parts?.[0]?.text) {
                  fullText += jsonData.candidates[0].content.parts[0].text;
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      return fullText.trim() || 'AI analysis unavailable';
    } catch (error) {
      console.error('Error analyzing with AI:', error);
      return '';
    } finally {
      setAiAnalyzing(false);
    }
  };

  const captureSnapshot = (descriptor: Float32Array) => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      setFaceDescriptor(descriptor);
      console.log('Face snapshot captured:', imageData.substring(0, 50) + '...');
    }
  };

  const manualCapturePhoto = async () => {
    if (!videoRef.current || !modelsLoaded) {
      toast({
        title: 'Camera Not Ready',
        description: 'Please start the camera first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Detect face to get descriptor
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        toast({
          title: 'No Face Detected',
          description: 'Please ensure a face is clearly visible in the camera.',
          variant: 'destructive',
        });
        return;
      }

      // Capture the photo
      captureSnapshot(detections.descriptor);
      
      toast({
        title: 'Photo Captured',
        description: 'Face photo captured successfully.',
      });
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast({
        title: 'Capture Failed',
        description: 'Could not capture photo. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const whisper = (text: string) => {
    console.log('🔊 whisper called with text:', text);
    console.log('Audio enabled:', audioEnabled);
    
    if (!audioEnabled) {
      console.log('❌ Audio disabled, skipping whisper');
      return;
    }

    // Prevent duplicate whispers within 5 seconds
    const now = Date.now();
    const timeSinceLastWhisper = now - lastWhisperTimeRef.current;
    console.log('Last whisper:', lastWhisperRef.current);
    console.log('Time since last whisper:', timeSinceLastWhisper, 'ms');
    
    if (lastWhisperRef.current === text && timeSinceLastWhisper < 5000) {
      console.log('❌ Duplicate whisper within 5 seconds, skipping');
      return;
    }

    lastWhisperRef.current = text;
    lastWhisperTimeRef.current = now;
    
    console.log('✅ Speaking:', text);

    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech to prevent overlap
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 0.8; // Softer volume for "whisper" effect
      
      // Try to use a calm, friendly voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || voice.name.includes('Samantha')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => {
        console.log('🔊 Speech started:', text);
      };
      
      utterance.onend = () => {
        console.log('✅ Speech ended:', text);
      };
      
      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event);
      };

      speechSynthesis.speak(utterance);
    } else {
      console.log('❌ speechSynthesis not available');
    }
  };

  const handleSaveNewFace = async () => {
    console.log('💾 handleSaveNewFace called');
    console.log('Name:', newFaceName);
    console.log('Patient:', patient?.id);
    console.log('Face descriptor:', faceDescriptor ? 'Present' : 'Missing');
    console.log('Face descriptor length:', faceDescriptor?.length);
    console.log('Captured image:', capturedImage ? 'Present' : 'Missing');
    
    if (!newFaceName.trim()) {
      console.error('❌ Name is missing');
      toast({
        title: 'Missing Information',
        description: 'Please enter a name for this person.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!patient) {
      console.error('❌ Patient is missing');
      toast({
        title: 'Error',
        description: 'Patient information not found. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!faceDescriptor || faceDescriptor.length === 0) {
      console.error('❌ Face descriptor is missing or empty');
      toast({
        title: 'Face Data Missing',
        description: 'Could not capture face data. Please try capturing the photo again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('📝 Saving face to database...');
      // Save face encoding as JSON string
      const encodingArray = Array.from(faceDescriptor);
      console.log('Face encoding array length:', encodingArray.length);
      console.log('Face encoding sample:', encodingArray.slice(0, 5));
      const encodingString = JSON.stringify(encodingArray);
      console.log('Face encoding string length:', encodingString.length);

      const newFace = await createKnownFace({
        patient_id: patient.id,
        person_name: newFaceName,
        relationship: newFaceRelationship || null,
        notes: newFaceNotes || null,
        face_encoding: encodingString,
        photo_url: capturedImage,
        added_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      });

      if (newFace) {
        console.log('✅ Face saved successfully:', newFace.id);
        console.log('Saved face encoding status:', newFace.face_encoding ? 'Present' : 'NULL');
        toast({
          title: 'Contact Saved',
          description: `${newFaceName} has been added to your contacts.`,
        });

        whisper(`I will remember ${newFaceName} from now on.`);

        // Reload known faces
        console.log('🔄 Reloading known faces...');
        await loadData();
        console.log('✅ Known faces reloaded');

        // Reset form
        setShowSaveDialog(false);
        setNewFaceName('');
        setNewFaceRelationship('');
        setNewFaceNotes('');
        setCapturedImage(null);
        setFaceDescriptor(null);
        console.log('🧹 Form reset complete');
      } else {
        console.error('❌ createKnownFace returned null');
        toast({
          title: 'Save Failed',
          description: 'Database operation failed. Please check permissions and try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Error saving face:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      toast({
        title: 'Save Failed',
        description: 'Could not save this person. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/patient/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Face Recognition</h1>
              <p className="text-sm text-muted-foreground">I'll help you recognize people</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAudioEnabled(!audioEnabled)}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Camera Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Camera</CardTitle>
            <CardDescription>
              {modelsLoading
                ? 'Loading face recognition models...'
                : modelsLoaded 
                  ? 'Face recognition is ready. Start the camera to begin. Point the back camera at people to recognize them.' 
                  : 'Model loading failed. Please refresh the page.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {modelsLoading && (
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <p className="text-sm font-medium text-primary">
                    {loadingProgress || 'Loading AI models...'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This may take 10-30 seconds on mobile devices. Please wait...
                </p>
              </div>
            )}
            
            {!modelsLoaded && !modelsLoading && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <p className="text-sm font-medium text-destructive">
                  Failed to load face recognition models
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Please check your internet connection and refresh the page.
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              {!cameraActive ? (
                <Button
                  onClick={startCamera}
                  disabled={!modelsLoaded || modelsLoading}
                  size="lg"
                  className="flex-1 h-16 text-lg"
                >
                  <Camera className="w-6 h-6 mr-2" />
                  {modelsLoading ? (loadingProgress || 'Loading Models...') : (modelsLoaded ? 'Start Camera' : 'Models Failed')}
                </Button>
              ) : (
                <Button
                  onClick={stopCamera}
                  variant="destructive"
                  size="lg"
                  className="flex-1 h-16 text-lg"
                >
                  <CameraOff className="w-6 h-6 mr-2" />
                  Stop Camera
                </Button>
              )}
            </div>

            {/* Camera Feed */}
            <div className={`relative bg-black rounded-lg overflow-hidden ${!cameraActive ? 'hidden' : ''}`}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-auto"
                style={{ minHeight: '300px' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
              {/* Camera Status Indicator */}
              {cameraActive && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Camera Active
                </div>
              )}
            </div>
            
            {/* Manual Add Person Button */}
            {cameraActive && (
              <Button
                onClick={() => setShowSaveDialog(true)}
                variant="outline"
                size="lg"
                className="w-full h-14 text-base gap-2"
              >
                <User className="w-5 h-5" />
                Add Person Manually
              </Button>
            )}
            
            {/* Debug Info */}
            {cameraActive && (
              <div className="text-xs text-muted-foreground text-center">
                Camera is running. If you don't see video, check the browser console (F12) for errors.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Detection */}
        {/* Detection Status */}
        {cameraActive && !currentDetection && (
          <Card className={noFaceDetectedCount >= 3 ? "border-warning" : "border-muted"}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  noFaceDetectedCount >= 3 ? 'bg-warning/10' : 'bg-muted'
                }`}>
                  {noFaceDetectedCount >= 3 ? (
                    <AlertCircle className="w-6 h-6 text-warning" />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-foreground animate-pulse" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {noFaceDetectedCount >= 3 ? 'No Face Detected' : 'Scanning for Faces...'}
                  </CardTitle>
                  <CardDescription>
                    {noFaceDetectedCount >= 3 
                      ? 'No one is visible in the camera. Please point the camera at someone.'
                      : 'Point the camera at someone\'s face. Make sure there is good lighting.'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Tips for best results:</strong>
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                  <li>Ensure good lighting (avoid backlighting)</li>
                  <li>Keep face centered and 1-3 feet from camera</li>
                  <li>Face the camera directly (not profile view)</li>
                  <li>Remove sunglasses or masks if possible</li>
                  <li>Hold steady for 2-3 seconds</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {currentDetection && cameraActive && (
          <Card className={currentDetection.isKnown ? 'border-success' : 'border-warning'}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentDetection.isKnown ? 'bg-success/10' : 'bg-warning/10'
                }`}>
                  {currentDetection.isKnown ? (
                    <User className="w-6 h-6 text-success" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-warning" />
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">
                    {currentDetection.isKnown ? currentDetection.name : 'Unknown Person'}
                  </CardTitle>
                  <CardDescription>
                    {currentDetection.isKnown 
                      ? `Recognized with ${currentDetection.confidence}% confidence`
                      : 'This person is not in your contacts'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Analysis */}
              {aiAnalyzing && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>AI is analyzing...</span>
                  </div>
                </div>
              )}
              
              {currentDetection.aiAnalysis && !aiAnalyzing && (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">AI</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base leading-relaxed">{currentDetection.aiAnalysis}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {!currentDetection.isKnown && (
                <div className="space-y-3">
                  <div className="bg-warning/10 border border-warning/30 p-4 rounded-lg">
                    <p className="text-sm font-medium text-black">
                      👤 This is someone new! Would you like to save them so I can remember them next time?
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      console.log('💾 Save button clicked');
                      console.log('Captured image:', capturedImage ? 'Available' : 'Missing');
                      console.log('Face descriptor:', faceDescriptor ? 'Available' : 'Missing');
                      setShowSaveDialog(true);
                    }}
                    size="lg"
                    className="w-full h-16 text-lg"
                  >
                    Save This Person
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Known Contacts Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your Contacts</CardTitle>
            <CardDescription>
              {knownFaces.length} people saved
            </CardDescription>
          </CardHeader>
          <CardContent>
            {knownFaces.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No contacts saved yet. Start the camera to add people.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {knownFaces.slice(0, 6).map((face) => (
                  <div key={face.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {face.person_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{face.person_name}</p>
                      {face.relationship && (
                        <Badge variant="secondary" className="mt-1">
                          {face.relationship}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {knownFaces.length > 6 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate('/patient/contacts')}
              >
                View All Contacts
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-base">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <p>Start the camera and point the back camera at someone's face</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <p>If I recognize them, I'll whisper their name to you</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <p>If they're new, I'll let you know and you can save them</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-primary">4</span>
              </div>
              <p>Make sure you're wearing your Bluetooth earphones to hear me</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-primary">5</span>
              </div>
              <p>Hold your device steady and ensure good lighting for best results</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save New Face Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Save New Person</DialogTitle>
            <DialogDescription className="text-base">
              Add this person to your contacts so I can recognize them next time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Photo Preview and Capture */}
            <div className="space-y-3">
              <Label className="text-base">Photo</Label>
              <div className="flex flex-col items-center gap-3">
                {capturedImage ? (
                  <div className="relative">
                    <img 
                      src={capturedImage} 
                      alt="Captured face" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-muted border-4 border-dashed border-border flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                
                <Button
                  type="button"
                  variant={capturedImage ? "outline" : "default"}
                  size="sm"
                  onClick={manualCapturePhoto}
                  disabled={!cameraActive}
                  className="gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {capturedImage ? 'Retake Photo' : 'Capture Photo'}
                </Button>
                
                {!cameraActive && (
                  <p className="text-xs text-muted-foreground text-center">
                    Camera must be active to capture photo
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Name *</Label>
              <Input
                id="name"
                value={newFaceName}
                onChange={(e) => setNewFaceName(e.target.value)}
                placeholder="Enter their name"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship" className="text-base">Relationship</Label>
              <Input
                id="relationship"
                value={newFaceRelationship}
                onChange={(e) => setNewFaceRelationship(e.target.value)}
                placeholder="e.g., Friend, Doctor, Neighbor"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newFaceNotes}
                onChange={(e) => setNewFaceNotes(e.target.value)}
                placeholder="Any details to remember..."
                className="min-h-20 text-base"
              />
            </div>
            
            {/* AI Suggestion Hint */}
            {currentDetection?.aiAnalysis && (
              <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">AI</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">AI Tip:</span> {currentDetection.aiAnalysis}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              className="flex-1 h-12 text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNewFace}
              disabled={!newFaceName.trim() || !faceDescriptor}
              className="flex-1 h-12 text-base"
            >
              Save Person
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
