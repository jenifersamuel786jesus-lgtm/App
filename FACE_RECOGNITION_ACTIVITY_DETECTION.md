# Face Recognition with Activity Detection

**Date**: 2025-12-30  
**Feature**: Enhanced face recognition with real-time activity/pose detection  
**Status**: ✅ Fully Functional

---

## 🎯 Overview

RemZy's face recognition system now includes **activity detection** that describes what people are doing in real-time. The system not only identifies who someone is but also describes their current activity (sitting, standing, walking, etc.) and appearance.

### What You'll Hear

**For Known People (e.g., Alan)**:
1. First whisper: "This is Alan."
2. Second whisper: "Alan is sitting down wearing a blue shirt." or "Alan is standing and appears to be smiling."

**For Unknown People**:
1. First whisper: "You are meeting someone new."
2. Second whisper: "This person is standing and wearing a red jacket with short brown hair." or "This person is sitting down with glasses and a friendly smile."

---

## 🔧 How It Works

### Detection Pipeline

```
Camera Feed → Face Detection → Face Recognition → AI Activity Analysis → Voice Whisper
     ↓              ↓                  ↓                    ↓                  ↓
  Video         Bounding Box      Known/Unknown      Pose + Appearance    Text-to-Speech
```

### Step-by-Step Process

**1. Face Detection** (face-api.js)
- Detects faces in camera feed every 2 seconds
- Identifies facial landmarks (68 points)
- Generates 128-dimensional face encoding

**2. Face Recognition** (Euclidean Distance)
- Compares face encoding with stored faces
- Matches against known contacts
- Determines if person is known or unknown

**3. Activity Analysis** (Google Gemini AI)
- Captures snapshot of detected person
- Sends image to Gemini AI with specialized prompt
- AI analyzes:
  - **Pose/Activity**: Sitting, standing, walking, leaning, etc.
  - **Appearance**: Clothing color, style, accessories
  - **Facial features**: Glasses, smile, hair style
  - **Context**: What they're doing or holding

**4. Voice Notification** (Web Speech API)
- First whisper: Identity (known name or "someone new")
- Second whisper: Activity description from AI
- Calm, friendly voice at comfortable volume

---

## 💬 Example Scenarios

### Scenario 1: Known Person Sitting

**Detection**:
- Face recognized as "Alan"
- AI analyzes: Person sitting in chair, wearing blue shirt

**Voice Output**:
1. "This is Alan."
2. "Alan is sitting down wearing a blue shirt."

**UI Display**:
- Green border card (known person)
- Name: "Alan"
- Confidence: 85%
- AI Analysis: "Alan is sitting down wearing a blue shirt."

### Scenario 2: Known Person Standing

**Detection**:
- Face recognized as "Sarah"
- AI analyzes: Person standing, smiling, wearing red jacket

**Voice Output**:
1. "This is Sarah."
2. "Sarah is standing and wearing a red jacket. She appears to be smiling."

**UI Display**:
- Green border card (known person)
- Name: "Sarah"
- Confidence: 92%
- AI Analysis: "Sarah is standing and wearing a red jacket. She appears to be smiling."

### Scenario 3: Unknown Person Standing

**Detection**:
- Face not in database
- AI analyzes: Person standing, wearing glasses, brown hair

**Voice Output**:
1. "You are meeting someone new."
2. "This person is standing and wearing glasses with short brown hair."

**UI Display**:
- Yellow border card (unknown person)
- Name: "Unknown Person"
- AI Analysis: "This person is standing and wearing glasses with short brown hair."
- Button: "Save This Person"

### Scenario 4: Unknown Person Sitting

**Detection**:
- Face not in database
- AI analyzes: Person sitting, wearing green sweater, friendly smile

**Voice Output**:
1. "You are meeting someone new."
2. "This person is sitting down wearing a green sweater with a friendly smile."

**UI Display**:
- Yellow border card (unknown person)
- Name: "Unknown Person"
- AI Analysis: "This person is sitting down wearing a green sweater with a friendly smile."
- Button: "Save This Person"

---

## 🎨 AI Prompts

### For Known People

**Prompt Template**:
```
You are assisting an Alzheimer's patient. This is {name}, someone they know. 
Describe what {name} is doing right now (sitting, standing, walking, etc.) 
and what they're wearing. Keep it to 1-2 short sentences. Be warm and reassuring.

Example: "{name} is sitting down wearing a blue shirt." 
or "{name} is standing and appears to be smiling."
```

**Sample Outputs**:
- "Alan is sitting comfortably in a chair wearing a blue button-up shirt."
- "Sarah is standing near the door wearing a red jacket and smiling warmly."
- "John is sitting at the table wearing glasses and a green sweater."
- "Mary is standing by the window wearing a yellow dress and looking outside."

### For Unknown People

**Prompt Template**:
```
You are assisting an Alzheimer's patient. They are meeting someone new. 
Describe what this person is doing (sitting, standing, walking, etc.) 
and their appearance (clothing, hair, distinctive features). 
Keep it to 1-2 short sentences. Be warm and reassuring.

Example: "This person is standing and wearing a red jacket with short brown hair." 
or "This person is sitting down with glasses and a friendly smile."
```

**Sample Outputs**:
- "This person is standing and wearing a blue jacket with short dark hair."
- "This person is sitting down with glasses and a friendly expression."
- "This person is standing near the door wearing a red sweater and has long blonde hair."
- "This person is sitting comfortably wearing a green shirt and appears to be smiling."

---

## 🧪 Testing Guide

### Test 1: Known Person Detection with Activity

**Setup**:
1. Save a person as "Alan" in the system
2. Have Alan sit in a chair
3. Point camera at Alan

**Expected Results**:
- ✅ Face detected (green box appears)
- ✅ First whisper: "This is Alan."
- ✅ Second whisper: "Alan is sitting down wearing [clothing description]."
- ✅ UI shows: Name "Alan", confidence score, activity description
- ✅ Green border card (known person)

**Console Logs**:
```
Running face detection...
Detection complete: { facesFound: 1 }
Face matched: Alan (confidence: 85%)
AI analysis started...
AI analysis complete: "Alan is sitting down wearing a blue shirt."
Whisper: "This is Alan."
Whisper: "Alan is sitting down wearing a blue shirt."
```

### Test 2: Known Person Standing

**Setup**:
1. Same person (Alan) now stands up
2. Point camera at Alan standing

**Expected Results**:
- ✅ Face detected
- ✅ First whisper: "This is Alan."
- ✅ Second whisper: "Alan is standing [additional description]."
- ✅ Activity description updates to "standing"

### Test 3: Unknown Person Detection with Activity

**Setup**:
1. Point camera at someone not in database
2. Person is sitting

**Expected Results**:
- ✅ Face detected (green box appears)
- ✅ First whisper: "You are meeting someone new."
- ✅ Second whisper: "This person is sitting down [appearance description]."
- ✅ UI shows: "Unknown Person", activity description
- ✅ Yellow border card (unknown person)
- ✅ "Save This Person" button visible

**Console Logs**:
```
Running face detection...
Detection complete: { facesFound: 1 }
Face not matched (unknown person)
AI analysis started...
AI analysis complete: "This person is sitting down wearing a green sweater."
Whisper: "You are meeting someone new."
Whisper: "This person is sitting down wearing a green sweater."
```

### Test 4: Multiple Activity Changes

**Setup**:
1. Have known person (Alan) sit down
2. Wait for detection and whisper
3. Have Alan stand up
4. Wait for next detection cycle (2 seconds)

**Expected Results**:
- ✅ First detection: "Alan is sitting down..."
- ✅ Second detection: "Alan is standing..."
- ✅ Activity description updates based on current pose

### Test 5: Different Clothing

**Setup**:
1. Have known person wear different clothing
2. Point camera at them

**Expected Results**:
- ✅ Still recognized by face (name correct)
- ✅ Activity description includes new clothing
- ✅ Example: "Alan is sitting down wearing a red jacket." (instead of blue shirt)

---

## 🔍 Debugging

### Check AI Analysis

**Console Commands**:
```javascript
// Check if AI analysis is running
console.log('AI analyzing:', document.querySelector('[data-ai-analyzing]'));

// Check last AI response
// (Look for console logs starting with "AI analysis complete:")
```

**Expected Console Output**:
```
AI analysis started...
Sending image to Gemini AI...
AI response received
AI analysis complete: "Alan is sitting down wearing a blue shirt."
```

### Common Issues

**Issue 1: No Activity Description**

**Symptoms**:
- Face detected and recognized
- Name whispered correctly
- But no activity description

**Possible Causes**:
1. AI API not responding
2. Network connection issue
3. Image capture failed

**Solutions**:
1. Check internet connection
2. Check browser console for API errors
3. Look for "AI analysis failed" errors
4. Verify VITE_APP_ID environment variable set

**Issue 2: Activity Description Incorrect**

**Symptoms**:
- Person is standing but AI says "sitting"
- Or vice versa

**Possible Causes**:
1. Poor camera angle
2. Person partially visible
3. Ambiguous pose

**Solutions**:
1. Ensure full body visible in frame (not just face)
2. Improve camera angle (show more of person)
3. Better lighting
4. Wait for next detection cycle (may correct itself)

**Issue 3: Generic Descriptions**

**Symptoms**:
- AI says "This person is visible" without details
- Or very vague descriptions

**Possible Causes**:
1. Poor image quality
2. Low lighting
3. Person too far from camera

**Solutions**:
1. Move closer to camera
2. Improve lighting
3. Ensure person clearly visible
4. Check camera resolution settings

---

## ⚙️ Configuration

### Adjust AI Prompt

**File**: `PatientFaceRecognitionPage.tsx`

**Location**: Line ~482-484

**Current Prompt (Known Person)**:
```typescript
const prompt = isKnown 
  ? `You are assisting an Alzheimer's patient. This is ${personName}, someone they know. 
     Describe what ${personName} is doing right now (sitting, standing, walking, etc.) 
     and what they're wearing. Keep it to 1-2 short sentences. Be warm and reassuring.`
```

**Customization Options**:

**More Detailed**:
```typescript
const prompt = isKnown 
  ? `Describe what ${personName} is doing (sitting, standing, walking, leaning, etc.), 
     what they're wearing (colors, style), and their facial expression. 
     Keep it to 2-3 sentences. Be warm and reassuring.`
```

**Less Detailed**:
```typescript
const prompt = isKnown 
  ? `Briefly describe what ${personName} is doing right now in one sentence. 
     Example: "${personName} is sitting down." or "${personName} is standing."`
```

**Focus on Activity Only**:
```typescript
const prompt = isKnown 
  ? `Describe only what ${personName} is doing right now (sitting, standing, walking, etc.). 
     One sentence only. Example: "${personName} is sitting down."`
```

**Focus on Appearance Only**:
```typescript
const prompt = isKnown 
  ? `Describe only what ${personName} is wearing right now. 
     One sentence only. Example: "${personName} is wearing a blue shirt."`
```

### Adjust Whisper Timing

**Current**: Two separate whispers (name, then activity)

**Change to Single Whisper**:
```typescript
// Instead of:
whisper(`This is ${match.name}.`);
// ... later ...
whisper(aiAnalysis);

// Combine into one:
const aiAnalysis = await analyzeWithAI(snapshotImage, true, match.name);
if (aiAnalysis) {
  whisper(`This is ${match.name}. ${aiAnalysis}`);
}
```

**Result**: "This is Alan. Alan is sitting down wearing a blue shirt." (all at once)

### Adjust Detection Frequency

**Current**: Every 2 seconds

**Change Detection Interval**:
```typescript
// Line ~281
detectionIntervalRef.current = setInterval(async () => {
  await detectFaces();
}, 2000); // Change to 1000 (1 second) or 3000 (3 seconds)
```

**Recommendations**:
- 1 second: More responsive, higher CPU usage, more frequent whispers
- 2 seconds: Good balance (default)
- 3 seconds: Less responsive, lower CPU usage, fewer whispers

---

## 📊 Performance

### Resource Usage

**AI Analysis**:
- API call: ~50-100 KB per request
- Latency: 1-3 seconds
- Frequency: Once per detection (every 2 seconds if face present)

**Total Detection Time**:
- Face detection: 200-500ms
- Face recognition: 50-100ms
- AI analysis: 1-3 seconds
- Voice whisper: 100-300ms
- **Total**: 2-4 seconds from face to activity description

### Network Usage

**Per Detection Cycle** (with face present):
- Image upload: ~20-50 KB (JPEG snapshot)
- AI response: ~1-5 KB (text description)
- **Total**: ~25-55 KB per detection

**Per Minute** (continuous detection):
- Detections: 30 (every 2 seconds)
- Network: ~750 KB - 1.6 MB per minute
- **Recommendation**: Use on WiFi for extended sessions

### Battery Impact

**High Drain Activities**:
- Camera: High
- Face detection: Medium
- AI analysis: Medium (network)
- Voice synthesis: Low

**Recommendations**:
- Use while charging for extended sessions
- Reduce detection frequency to 3 seconds
- Disable AI analysis if battery low (face recognition still works)

---

## 🔒 Privacy

### Data Sent to AI

**What's Sent**:
- Single snapshot image (JPEG, ~20-50 KB)
- Text prompt (instructions for AI)

**What's NOT Sent**:
- Video stream (only single frames)
- Face encodings (stay local)
- Personal information (except name in prompt)
- Location data
- Other contacts

### Data Storage

**Local (Browser)**:
- Video stream: Not stored
- Face encodings: Temporary during detection

**Database (Supabase)**:
- Face encodings: Stored (128 numbers)
- Names: Stored
- Activity descriptions: Not stored (real-time only)

**AI Service (Google)**:
- Images: Not stored (processed and discarded)
- Prompts: Not stored
- Responses: Not stored

---

## ✅ Summary

### Key Features

✅ **Face Detection**: Real-time detection every 2 seconds  
✅ **Face Recognition**: Identifies known people by name  
✅ **Activity Detection**: Describes what person is doing (sitting, standing, etc.)  
✅ **Appearance Description**: Describes clothing, accessories, features  
✅ **Voice Notifications**: Two whispers (name + activity)  
✅ **Visual Feedback**: UI shows name, confidence, activity description  
✅ **Unknown Person Alerts**: Warns about new people with description  

### User Experience

**For Known People**:
1. Camera detects face
2. System recognizes: "This is Alan"
3. AI analyzes: "Alan is sitting down wearing a blue shirt"
4. User hears both whispers
5. UI displays all information

**For Unknown People**:
1. Camera detects face
2. System alerts: "You are meeting someone new"
3. AI describes: "This person is standing and wearing a red jacket"
4. User hears both whispers
5. Option to save person

### Benefits for Alzheimer's Patients

- **Reduces confusion**: Knows who people are
- **Provides context**: Knows what they're doing
- **Builds confidence**: Detailed descriptions help memory
- **Maintains dignity**: Private whispers, not loud announcements
- **Proactive assistance**: Automatic detection, no need to ask

---

**Status**: ✅ Fully Functional with Activity Detection  
**Version**: 2.4.0  
**Last Updated**: 2025-12-30
