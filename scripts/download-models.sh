#!/bin/bash

# Script to download face-api.js models

echo "Downloading face-api.js models..."

cd "$(dirname "$0")/../public/models" || exit 1

BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

# Download tiny face detector
echo "Downloading tiny face detector..."
curl -sS -O "$BASE_URL/tiny_face_detector_model-weights_manifest.json"
curl -sS -O "$BASE_URL/tiny_face_detector_model-shard1"

# Download face landmark 68
echo "Downloading face landmark 68 model..."
curl -sS -O "$BASE_URL/face_landmark_68_model-weights_manifest.json"
curl -sS -O "$BASE_URL/face_landmark_68_model-shard1"

# Download face recognition
echo "Downloading face recognition model..."
curl -sS -O "$BASE_URL/face_recognition_model-weights_manifest.json"
curl -sS -O "$BASE_URL/face_recognition_model-shard1"
curl -sS -O "$BASE_URL/face_recognition_model-shard2"

# Download face expression
echo "Downloading face expression model..."
curl -sS -O "$BASE_URL/face_expression_model-weights_manifest.json"
curl -sS -O "$BASE_URL/face_expression_model-shard1"

echo "✅ All models downloaded successfully!"
echo ""
echo "Models are now available in: public/models/"
ls -lh
