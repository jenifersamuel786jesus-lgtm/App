# Camera Configuration Update

## Change Summary

Updated the face recognition system to use the **back (rear) camera** instead of the front camera.

## What Changed

### Code Changes

**File**: `src/pages/patient/PatientFaceRecognitionPage.tsx`

```typescript
// BEFORE (Front Camera)
facingMode: 'user'

// AFTER (Back Camera)
facingMode: 'environment'
```

### UI Text Updates

1. **Camera Card Description**:
   - Added: "Point the back camera at people to recognize them."

2. **Instructions Section**:
   - Step 1: Changed from "point it at someone's face" to "point the back camera at someone's face"
   - Added Step 5: "Hold your device steady and ensure good lighting for best results"

### Documentation Updates

**File**: `FACE_RECOGNITION_GUIDE.md`

- Updated "Real-Time Camera System" section to specify "back-facing camera (environment mode)"
- Updated usage instructions to mention "Point back camera at the person"
- Updated device requirements to specify "Back (rear) camera required"
- Updated API reference code example to show `facingMode: 'environment'`

## Why Back Camera?

### Advantages

1. **Better Quality**: Back cameras typically have higher resolution and better sensors
2. **Natural Interaction**: Patient can point device at people like taking a photo
3. **Better Lighting**: Back camera usually has better low-light performance
4. **More Natural**: Feels more like showing someone a picture rather than selfie mode
5. **Easier Positioning**: Easier to frame other people's faces

### Use Case

The back camera is ideal for the RemZy use case because:
- Patients point their device at people they meet
- Similar to taking a photo of someone
- More intuitive for recognizing others (not themselves)
- Better for caregivers to help position the device

## How It Works Now

1. Patient opens Face Recognition page
2. Taps "Start Camera"
3. **Holds device with back camera facing the person** (like taking a photo)
4. System detects and recognizes the face
5. Whispers the person's name through earphones

## Testing

✅ Code changes validated
✅ Lint checks passing
✅ TypeScript compilation successful
✅ Documentation updated
✅ UI text updated

## Browser Support

The `facingMode: 'environment'` setting is supported by:
- ✅ Chrome 90+ (mobile & desktop)
- ✅ Safari 14+ (iOS & macOS)
- ✅ Edge 90+
- ✅ Firefox 88+

## Fallback Behavior

If the device doesn't have a back camera (e.g., desktop webcam), the browser will:
1. Use the available camera
2. Show camera permission dialog
3. Allow user to select from available cameras

## Production Ready

✅ All changes implemented
✅ All tests passing
✅ Documentation updated
✅ Ready for deployment

---

**Updated**: 2025-12-24
**Status**: ✅ Complete
**Impact**: Low (configuration change only)
