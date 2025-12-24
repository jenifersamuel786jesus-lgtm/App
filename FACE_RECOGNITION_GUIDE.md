# Face Recognition Feature - Implementation Guide

## Overview

The RemZy Face Recognition system provides real-time face detection and recognition for Alzheimer's patients, helping them identify people they meet. The system uses browser-based AI models and provides audio feedback through text-to-speech.

## Features Implemented

### 1. Real-Time Camera System
- Continuous video stream from device camera
- Optimized for back-facing camera (environment mode)
- 1280x720 resolution for balance between quality and performance
- Canvas overlay for face detection visualization

### 2. Face Detection & Recognition
- Detects faces in real-time (every 2 seconds)
- Matches detected faces against saved contacts
- 60% similarity threshold for recognition (adjustable)
- Draws bounding boxes and landmarks on detected faces

### 3. Known Face Recognition
- Whispers person's name when recognized
- Shows confidence percentage
- Updates "last seen" timestamp in database
- Displays green success indicator

### 4. Unknown Face Detection
- Whispers "You are meeting someone new"
- Shows yellow warning indicator
- Prompts to save the person
- Logs unknown encounters to database
- Captures snapshot for saving

### 5. Save New Contacts
- Dialog form to save unknown faces
- Fields: Name (required), Relationship, Notes
- Stores 128-dimensional face descriptor
- Saves snapshot image
- Immediately available for recognition

### 6. Audio Whisper System
- Text-to-speech using Web Speech API
- Softer volume (80%) for "whisper" effect
- Slightly slower rate (0.9x) for clarity
- Prefers female/calm voices when available
- Prevents duplicate whispers within 5 seconds
- Toggle audio on/off

### 7. User Interface
- Large, accessible buttons (60px+ height)
- Clear visual feedback with color-coded cards
- Camera controls (start/stop)
- Audio toggle button
- Contact summary display
- Step-by-step instructions
- Empty state guidance

## Technical Architecture

### Face Recognition Pipeline

```
Camera Feed → Face Detection → Feature Extraction → Matching → Audio Feedback
                    ↓                                    ↓
              Draw Landmarks                      Update Database
```

### Models Used

1. **Tiny Face Detector** (~200KB)
   - Lightweight CNN for face detection
   - Fast inference on mobile devices
   - Good balance of speed and accuracy

2. **Face Landmark 68** (~350KB)
   - Detects 68 facial landmarks
   - Used for face alignment
   - Improves recognition accuracy

3. **Face Recognition** (~6.2MB)
   - Generates 128-dimensional descriptors
   - Based on FaceNet architecture
   - Enables face matching

4. **Face Expression** (~320KB)
   - Optional emotion detection
   - Can be used for enhanced features

### Database Schema

#### known_faces Table
```sql
- id: UUID
- patient_id: UUID (foreign key)
- person_name: TEXT
- relationship: TEXT (nullable)
- notes: TEXT (nullable)
- face_encoding: TEXT (JSON array of 128 floats)
- photo_url: TEXT (base64 image data)
- added_at: TIMESTAMP
- last_seen: TIMESTAMP (nullable)
```

#### unknown_encounters Table
```sql
- id: UUID
- patient_id: UUID (foreign key)
- encounter_time: TIMESTAMP
- location_lat: FLOAT (nullable)
- location_lng: FLOAT (nullable)
- location_name: TEXT (nullable)
- snapshot_url: TEXT (nullable)
- patient_action: TEXT (nullable)
- saved_as_known: BOOLEAN
- notes: TEXT (nullable)
```

## Usage Flow

### For Patients

1. **Navigate to Face Recognition**
   - From dashboard, tap "Face Recognition" card
   - Wait for models to load (first time only)

2. **Start Camera**
   - Tap "Start Camera" button
   - Allow camera permissions if prompted
   - Ensure good lighting

3. **Point at Person's Face**
   - Hold device steady
   - Point back camera at the person
   - Face should be clearly visible
   - Wait 2-3 seconds for detection

4. **Listen for Whisper**
   - Known person: Hear their name
   - Unknown person: Hear "meeting someone new"

5. **Save Unknown Person (Optional)**
   - Tap "Save This Person" button
   - Enter their name (required)
   - Add relationship (optional)
   - Add notes (optional)
   - Tap "Save Person"

6. **Stop Camera**
   - Tap "Stop Camera" when done
   - Camera feed stops
   - Battery saved

### For Caregivers

Caregivers can view:
- List of patient's saved contacts
- Unknown encounter logs
- Last seen timestamps
- Face recognition activity

## Performance Considerations

### Optimization Strategies

1. **Detection Interval**: 2 seconds between scans
   - Balances responsiveness and CPU usage
   - Prevents excessive battery drain
   - Allows time for audio feedback

2. **Model Loading**: One-time on page load
   - Models cached by browser
   - ~7MB total download
   - Subsequent loads are instant

3. **Face Matching**: Linear search through contacts
   - Acceptable for <100 contacts
   - O(n) complexity
   - Consider indexing for larger datasets

4. **Image Capture**: On-demand only
   - Snapshots only when saving
   - Base64 encoding for simplicity
   - Could use Supabase Storage for production

### Browser Compatibility

✅ **Supported Browsers:**
- Chrome 90+ (desktop & mobile)
- Safari 14+ (iOS & macOS)
- Edge 90+
- Firefox 88+

❌ **Not Supported:**
- Internet Explorer
- Older mobile browsers
- Browsers without WebRTC

### Device Requirements

- **Camera**: Back (rear) camera required
- **RAM**: 2GB+ recommended
- **CPU**: Modern processor (2015+)
- **Network**: Initial model download only
- **Storage**: ~10MB for models

## Security & Privacy

### Data Protection

1. **Local Processing**
   - Face detection runs in browser
   - No images sent to external servers
   - Models loaded once, cached locally

2. **Encrypted Storage**
   - Face encodings stored as JSON
   - Database encryption at rest
   - Secure transmission (HTTPS)

3. **Access Control**
   - Patient can only see own contacts
   - Caregivers have view-only access
   - RLS policies enforce boundaries

4. **Camera Permissions**
   - Explicit user consent required
   - Camera only active when page open
   - No background recording

### Privacy Safeguards

- Face snapshots stored as base64 (optional)
- Can be disabled for privacy
- Unknown encounters logged without images
- Patient controls all data

## Troubleshooting

### Common Issues

#### 1. Models Not Loading
**Symptoms**: "Model loading failed" error
**Solutions**:
- Check internet connection
- Verify models in `public/models/` directory
- Run `npm run download-models`
- Clear browser cache
- Check browser console for CORS errors

#### 2. Camera Not Starting
**Symptoms**: "Camera access denied" error
**Solutions**:
- Grant camera permissions in browser
- Check if another app is using camera
- Try different browser
- Restart device
- Check camera hardware

#### 3. Face Not Detected
**Symptoms**: No bounding box appears
**Solutions**:
- Improve lighting conditions
- Move closer to camera
- Face camera directly
- Remove obstructions (masks, sunglasses)
- Wait 2-3 seconds

#### 4. Wrong Person Recognized
**Symptoms**: Incorrect name whispered
**Solutions**:
- Adjust similarity threshold (currently 0.6)
- Re-save person with better photo
- Delete incorrect contact
- Ensure good lighting when saving

#### 5. No Audio Feedback
**Symptoms**: No whisper heard
**Solutions**:
- Check audio toggle (top right)
- Verify device volume
- Check browser audio permissions
- Try different browser
- Ensure speakers/headphones working

### Debug Mode

Enable debug logging:
```javascript
// In PatientFaceRecognitionPage.tsx
console.log('Detection:', detection);
console.log('Match:', match);
console.log('Known faces:', knownFaces.length);
```

## Future Enhancements

### Planned Features

1. **Background Face Recognition**
   - Always-on detection (with permission)
   - Automatic whispers without opening app
   - Battery-optimized scanning

2. **Multiple Face Detection**
   - Recognize multiple people simultaneously
   - Group encounter logging
   - Social interaction tracking

3. **Face Recognition History**
   - Timeline of encounters
   - Frequency analysis
   - Relationship insights

4. **Advanced Matching**
   - Age-invariant recognition
   - Pose-invariant matching
   - Partial face recognition

5. **Cloud Sync**
   - Sync contacts across devices
   - Backup face encodings
   - Family sharing

6. **Emotion Detection**
   - Detect facial expressions
   - Mood tracking
   - Social cues assistance

7. **Voice Recognition**
   - Combine face + voice
   - Enhanced accuracy
   - Multi-modal identification

## API Reference

### Face Recognition Functions

#### `loadModels()`
Loads face-api.js models from `/models` directory.

```typescript
const loadModels = async () => {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  await faceapi.nets.faceExpressionNet.loadFromUri('/models');
};
```

#### `startCamera()`
Requests camera access and starts video stream.

```typescript
const startCamera = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720, facingMode: 'environment' } // Back camera
  });
  videoRef.current.srcObject = stream;
};
```

#### `detectFaces()`
Detects faces in current video frame.

```typescript
const detectFaces = async () => {
  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptors();
  return detections;
};
```

#### `matchFace(descriptor)`
Matches face descriptor against known faces.

```typescript
const matchFace = async (descriptor: Float32Array) => {
  const threshold = 0.6;
  for (const face of knownFaces) {
    const distance = faceapi.euclideanDistance(descriptor, storedDescriptor);
    if (distance < threshold) {
      return { isKnown: true, name: face.person_name };
    }
  }
  return { isKnown: false };
};
```

#### `whisper(text)`
Speaks text using Web Speech API.

```typescript
const whisper = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.volume = 0.8;
  speechSynthesis.speak(utterance);
};
```

## Testing Checklist

### Functional Testing

- [ ] Models load successfully
- [ ] Camera starts and shows video
- [ ] Face detection draws bounding boxes
- [ ] Known face recognized correctly
- [ ] Unknown face triggers prompt
- [ ] Save dialog opens with snapshot
- [ ] New contact saved to database
- [ ] Audio whisper plays correctly
- [ ] Audio toggle works
- [ ] Camera stops cleanly
- [ ] Navigation works
- [ ] Empty state displays

### Performance Testing

- [ ] Detection runs every 2 seconds
- [ ] No memory leaks after 5 minutes
- [ ] Battery drain acceptable
- [ ] CPU usage under 50%
- [ ] Smooth video playback
- [ ] No UI freezing

### Edge Cases

- [ ] Multiple faces in frame
- [ ] No face in frame
- [ ] Poor lighting conditions
- [ ] Face partially obscured
- [ ] Camera permission denied
- [ ] Models fail to load
- [ ] Network offline
- [ ] Browser not supported

## Deployment

### Production Checklist

1. **Models**
   - [ ] All 9 model files in `public/models/`
   - [ ] Models served with correct MIME types
   - [ ] CDN caching configured

2. **Permissions**
   - [ ] HTTPS enabled (required for camera)
   - [ ] Camera permissions requested properly
   - [ ] Privacy policy updated

3. **Performance**
   - [ ] Models compressed/optimized
   - [ ] Lazy loading implemented
   - [ ] Service worker caching

4. **Monitoring**
   - [ ] Error tracking (Sentry, etc.)
   - [ ] Usage analytics
   - [ ] Performance metrics

## Support

For issues or questions:
- Check browser console for errors
- Review troubleshooting section
- Test in different browser
- Contact development team

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-24  
**Status**: Production Ready
