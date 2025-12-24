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
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentDetection, setCurrentDetection] = useState<{
    isKnown: boolean;
    name?: string;
    confidence?: number;
    faceId?: string;
  } | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  
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
    if (!profile) return;
    
    const patientData = await getPatientByProfileId(profile.id);
    if (patientData) {
      setPatient(patientData);
      const faces = await getKnownFaces(patientData.id);
      setKnownFaces(faces);
    }
  };

  const loadModels = async () => {
    try {
      const MODEL_URL = '/models'; // Models should be in public/models folder
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      
      setModelsLoaded(true);
      toast({
        title: 'Face Recognition Ready',
        description: 'Camera system is ready to use',
      });
    } catch (error) {
      console.error('Error loading face detection models:', error);
      toast({
        title: 'Model Loading Failed',
        description: 'Face recognition may not work properly. Please refresh the page.',
        variant: 'destructive',
      });
    }
  };

  const startCamera = async () => {
    if (!modelsLoaded) {
      toast({
        title: 'Please Wait',
        description: 'Face recognition models are still loading...',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment', // Use back camera
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        
        // Start face detection after video is playing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startFaceDetection();
        };

        whisper('Camera activated. I will help you recognize people.');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Access Denied',
        description: 'Please allow camera access to use face recognition.',
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
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Detect faces
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length === 0) {
      setCurrentDetection(null);
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

    if (match.isKnown && match.name) {
      // Known face detected
      setCurrentDetection({
        isKnown: true,
        name: match.name,
        confidence: match.confidence,
        faceId: match.faceId,
      });
      
      whisper(`Hello, this is ${match.name}`);
      
      // Update last_seen for this face
      if (match.faceId) {
        await updateKnownFace(match.faceId, {
          last_seen: new Date().toISOString(),
        });
      }
    } else {
      // Unknown face detected
      setCurrentDetection({
        isKnown: false,
        confidence: 0,
      });
      
      whisper('You are meeting someone new. Would you like to save this person?');
      
      // Capture image for saving
      captureSnapshot(descriptor);
      
      // Log unknown encounter
      if (patient) {
        await createUnknownEncounter({
          patient_id: patient.id,
          encounter_time: new Date().toISOString(),
          patient_action: 'detected',
        });
      }
    }
  };

  const matchFace = async (descriptor: Float32Array): Promise<{
    isKnown: boolean;
    name?: string;
    confidence?: number;
    faceId?: string;
  }> => {
    if (knownFaces.length === 0) {
      return { isKnown: false };
    }

    const threshold = 0.6; // Similarity threshold (lower = more strict)
    let bestMatch: { name: string; distance: number; faceId: string } | null = null;

    for (const face of knownFaces) {
      if (!face.face_encoding) continue;

      try {
        // Parse stored face encoding
        const storedDescriptor = new Float32Array(JSON.parse(face.face_encoding));
        
        // Calculate Euclidean distance
        const distance = faceapi.euclideanDistance(descriptor, storedDescriptor);

        if (distance < threshold) {
          if (!bestMatch || distance < bestMatch.distance) {
            bestMatch = {
              name: face.person_name,
              distance,
              faceId: face.id,
            };
          }
        }
      } catch (error) {
        console.error('Error matching face:', error);
      }
    }

    if (bestMatch) {
      return {
        isKnown: true,
        name: bestMatch.name,
        confidence: Math.round((1 - bestMatch.distance) * 100),
        faceId: bestMatch.faceId,
      };
    }

    return { isKnown: false };
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
    }
  };

  const whisper = (text: string) => {
    if (!audioEnabled) return;

    // Prevent duplicate whispers within 5 seconds
    const now = Date.now();
    if (lastWhisperRef.current === text && now - lastWhisperTimeRef.current < 5000) {
      return;
    }

    lastWhisperRef.current = text;
    lastWhisperTimeRef.current = now;

    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
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

      speechSynthesis.speak(utterance);
    }
  };

  const handleSaveNewFace = async () => {
    if (!newFaceName.trim() || !patient || !faceDescriptor) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a name for this person.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Save face encoding as JSON string
      const encodingString = JSON.stringify(Array.from(faceDescriptor));

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
        toast({
          title: 'Contact Saved',
          description: `${newFaceName} has been added to your contacts.`,
        });

        whisper(`I will remember ${newFaceName} from now on.`);

        // Reload known faces
        await loadData();

        // Reset form
        setShowSaveDialog(false);
        setNewFaceName('');
        setNewFaceRelationship('');
        setNewFaceNotes('');
        setCapturedImage(null);
        setFaceDescriptor(null);
      }
    } catch (error) {
      console.error('Error saving face:', error);
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
              {modelsLoaded 
                ? 'Face recognition is ready. Start the camera to begin. Point the back camera at people to recognize them.' 
                : 'Loading face recognition models...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              {!cameraActive ? (
                <Button
                  onClick={startCamera}
                  disabled={!modelsLoaded}
                  size="lg"
                  className="flex-1 h-16 text-lg"
                >
                  <Camera className="w-6 h-6 mr-2" />
                  Start Camera
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
            {cameraActive && (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-auto"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Detection */}
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
            {!currentDetection.isKnown && (
              <CardContent>
                <Button
                  onClick={() => setShowSaveDialog(true)}
                  size="lg"
                  className="w-full h-16 text-lg"
                >
                  Save This Person
                </Button>
              </CardContent>
            )}
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
            {capturedImage && (
              <div className="flex justify-center">
                <img 
                  src={capturedImage} 
                  alt="Captured face" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-border"
                />
              </div>
            )}

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
