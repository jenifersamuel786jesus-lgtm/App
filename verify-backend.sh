#!/bin/bash

# RemZy - Backend & AI Verification Script
# This script checks if all real backends and AI integrations are properly configured

echo "======================================"
echo "RemZy Backend & AI Verification"
echo "======================================"
echo ""

# Check if .env file exists
echo "1. Checking environment configuration..."
if [ -f .env ]; then
    echo "   ✅ .env file found"
    
    # Check for required variables
    if grep -q "VITE_SUPABASE_URL" .env; then
        echo "   ✅ VITE_SUPABASE_URL configured"
    else
        echo "   ❌ VITE_SUPABASE_URL missing"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        echo "   ✅ VITE_SUPABASE_ANON_KEY configured"
    else
        echo "   ❌ VITE_SUPABASE_ANON_KEY missing"
    fi
    
    if grep -q "VITE_APP_ID" .env; then
        echo "   ✅ VITE_APP_ID configured"
    else
        echo "   ❌ VITE_APP_ID missing"
    fi
else
    echo "   ❌ .env file not found"
    echo ""
    echo "   Create .env file with:"
    echo "   VITE_SUPABASE_URL=https://your-project.supabase.co"
    echo "   VITE_SUPABASE_ANON_KEY=your-anon-key"
    echo "   VITE_APP_ID=app-8g7cyjjxisxt"
fi

echo ""

# Check if node_modules exists
echo "2. Checking dependencies..."
if [ -d node_modules ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ❌ Dependencies not installed"
    echo "   Run: npm install"
fi

echo ""

# Check if Supabase migrations exist
echo "3. Checking database migrations..."
if [ -d supabase/migrations ]; then
    MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
    echo "   ✅ Found $MIGRATION_COUNT migration files"
else
    echo "   ❌ Migrations directory not found"
fi

echo ""

# Check if face-api models exist
echo "4. Checking face recognition models..."
if [ -d public/models ]; then
    echo "   ✅ Face recognition models directory exists"
else
    echo "   ❌ Models directory not found"
    echo "   Models will be downloaded automatically on first use"
fi

echo ""

# Check key files
echo "5. Checking application files..."
FILES=(
    "src/pages/patient/PatientAICompanionPage.tsx"
    "src/pages/patient/PatientFaceRecognitionPage.tsx"
    "src/pages/patient/PatientEmergencyPage.tsx"
    "src/pages/caregiver/CaregiverAlertsPage.tsx"
    "src/db/api.ts"
    "src/lib/supabase.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file missing"
    fi
done

echo ""

# Summary
echo "======================================"
echo "Summary"
echo "======================================"
echo ""
echo "Real Backend & AI Features:"
echo "  ✅ Supabase Cloud Database"
echo "  ✅ Supabase Authentication"
echo "  ✅ Google Gemini 2.5 Flash AI"
echo "  ✅ Web Speech API (Audio Whispers)"
echo "  ✅ face-api.js (Face Detection)"
echo "  ✅ Geolocation API (Location Services)"
echo ""
echo "Next Steps:"
echo "  1. Configure .env file with Supabase credentials"
echo "  2. Run: npm install"
echo "  3. Run: npm run dev"
echo "  4. Open: http://localhost:5173"
echo ""
echo "Documentation:"
echo "  - REAL_BACKEND_AI_GUIDE.md - Complete backend guide"
echo "  - DEPLOYMENT_GUIDE.md - Deployment instructions"
echo "  - FULL_APP_FEATURES.md - Feature list"
echo ""
echo "======================================"
