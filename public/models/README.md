# Face Recognition Models

This directory contains the pre-trained models required for face-api.js to work.

## Required Models

The following model files are needed for face recognition to function:

1. **tiny_face_detector_model-weights_manifest.json**
2. **tiny_face_detector_model-shard1**
3. **face_landmark_68_model-weights_manifest.json**
4. **face_landmark_68_model-shard1**
5. **face_recognition_model-weights_manifest.json**
6. **face_recognition_model-shard1**
7. **face_recognition_model-shard2**
8. **face_expression_model-weights_manifest.json**
9. **face_expression_model-shard1**

## How to Download Models

### Option 1: Download from face-api.js Repository

```bash
# Navigate to the public/models directory
cd public/models

# Download models from the official repository
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1

curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1

curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2

curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1
```

### Option 2: Use the Download Script

Run the provided download script:

```bash
npm run download-models
```

## Verification

After downloading, you should have these files in the `public/models` directory:

```
public/models/
├── tiny_face_detector_model-weights_manifest.json
├── tiny_face_detector_model-shard1
├── face_landmark_68_model-weights_manifest.json
├── face_landmark_68_model-shard1
├── face_recognition_model-weights_manifest.json
├── face_recognition_model-shard1
├── face_recognition_model-shard2
├── face_expression_model-weights_manifest.json
└── face_expression_model-shard1
```

## Model Details

- **Tiny Face Detector**: Lightweight face detection model (~200KB)
- **Face Landmark 68**: Detects 68 facial landmarks for alignment
- **Face Recognition**: Generates 128-dimensional face descriptors for recognition
- **Face Expression**: Detects facial expressions (optional, for enhanced features)

## Troubleshooting

If face recognition is not working:

1. Check browser console for model loading errors
2. Verify all model files are present in `public/models`
3. Ensure the web server can serve files from the `public` directory
4. Check that CORS is not blocking model loading
5. Try clearing browser cache and reloading

## License

These models are from the face-api.js project and are subject to their respective licenses.
See: https://github.com/justadudewhohacks/face-api.js
