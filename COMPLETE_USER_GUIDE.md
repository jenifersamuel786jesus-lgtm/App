# RemZy Complete User Guide

**Date**: 2026-01-02  
**Version**: 5.0.0  
**Status**: ✅ Production Ready with AI-Enhanced Face Detection

---

## 🎯 What's New

### AI-Enhanced Face Detection

RemZy now uses **Google Gemini 2.5 Flash** vision AI to provide detailed, contextual descriptions of people:

**Known Person Example**:
> "Alen is watching you wearing a green shirt and smiling."

**Unknown Person Example**:
> "A new person is watching you silently wearing a red jacket with short brown hair."

### Features

✅ **Clothing Detection**: Identifies clothing color and type  
✅ **Activity Recognition**: Describes what the person is doing  
✅ **Expression Analysis**: Detects smiles, friendly demeanor  
✅ **Appearance Details**: Hair color, glasses, distinctive features  
✅ **Contextual Whispers**: Natural, reassuring audio guidance  

---

## 📱 Complete User Flow

### Step 1: Sign Up

1. Open RemZy application
2. Click **"Sign Up"**
3. Enter:
   - Username (unique)
   - Email address
   - Password (minimum 6 characters)
4. Click **"Create Account"**
5. You'll be automatically logged in

### Step 2: Select Device Mode

After signup, you'll see two options:

**Option A: Patient Mode** (for Alzheimer's patients)
- Face recognition with AI descriptions
- AI companion for orientation
- Task reminders
- Emergency panic button
- Location tracking

**Option B: Caregiver Mode** (for family/caregivers)
- Monitor linked patients
- View patient location
- See task completion
- Receive alerts
- View activity logs

**⚠️ Important**: Once selected, device mode is locked and cannot be changed.

---

## 👤 For Patients

### Step 3: Patient Setup

1. After selecting "Patient Mode", fill out:
   - **Full Name** (required)
   - **Date of Birth** (optional)
   - **Safe Area Location** (optional - for boundary alerts)
   - **Safe Area Radius** (default: 500 meters)

2. Click **"Complete Setup"**

3. You'll receive a **Linking Code** (8 characters, e.g., "1A4B53EA")
   - ⚠️ **IMPORTANT**: Write this down or take a screenshot
   - Share this code with your caregiver
   - They'll need it to link to your device

4. Click **"Finish"** to go to your dashboard

### Step 4: Patient Dashboard

Your dashboard includes:

**🎥 Face Recognition**
- Always-on camera system
- Recognizes people you know
- Alerts you to unknown people
- AI describes what they're wearing and doing

**🤖 AI Companion**
- Ask questions anytime:
  - "What day is it?"
  - "Who am I?"
  - "Did I take my medicine?"
  - "Where am I?"
- Provides orientation and reassurance

**✅ Tasks & Reminders**
- View upcoming tasks
- Mark tasks as completed or skipped
- Receive Bluetooth whisper reminders

**📍 Location**
- View your current location
- See safe area boundary

**🚨 Emergency Button**
- Large red button always visible
- One tap sends alert to caregiver
- Shares your location automatically

### Step 5: Using Face Recognition

1. Navigate to **"Face Recognition"** page
2. Click **"Start Camera"**
3. Allow camera access when prompted
4. Wait for models to load (10-30 seconds)
5. Position your face in the camera

**When a Known Person Appears**:
- You'll hear via Bluetooth: "This is [Name]. [Name] is watching you wearing a [color] [clothing] and [expression]."
- Example: "This is Alen. Alen is watching you wearing a green shirt and smiling."
- Their name appears on screen with confidence score

**When an Unknown Person Appears**:
- You'll hear: "You are meeting someone new. A new person is [activity] wearing [clothing description]."
- Example: "You are meeting someone new. A new person is watching you silently wearing a red jacket with short brown hair."
- A dialog appears asking if you want to save this person

**Saving a New Person**:
1. When unknown person detected, dialog appears
2. Enter their name (required)
3. Enter relationship (optional): Friend, Doctor, Neighbor, etc.
4. Click **"Save Person"**
5. You'll hear: "I will remember [Name] from now on."
6. Next time they appear, you'll be reminded of their name

### Step 6: Using AI Companion

1. Navigate to **"AI Companion"** page
2. Type your question in the input box
3. Click **"Ask"** or press Enter
4. AI responds with helpful information
5. All conversations are logged

**Example Questions**:
- "What day is it?" → "Today is Tuesday, January 2nd, 2026."
- "Who am I?" → "You are [Your Name], and you're at home."
- "Did I take my medicine?" → Checks your task log
- "Where am I?" → Provides your current location

### Step 7: Managing Tasks

1. Navigate to **"Tasks"** page
2. View all upcoming tasks
3. Click **"Add Task"** to create new task:
   - Task name (e.g., "Take medicine")
   - Scheduled time
   - Location (optional)
4. When reminder sounds via Bluetooth:
   - Go to Tasks page
   - Mark as "Completed" or "Skipped"
5. Caregiver sees status updates in real-time

---

## 👨‍⚕️ For Caregivers

### Step 3: Caregiver Setup

1. After selecting "Caregiver Mode", fill out:
   - **Full Name** (required)
   - **Phone Number** (optional)

2. Click **"Complete Setup"**

3. You'll see the **"Link Patient"** section

### Step 4: Linking to Patient

1. Get the patient's **Linking Code** (8 characters)
   - Patient receives this after their setup
   - Code format: "1A4B53EA" (uppercase alphanumeric)

2. Enter the linking code in the input field
   - Case-insensitive (automatically normalized)
   - Spaces are automatically trimmed

3. Click **"Link Patient"**

4. If successful:
   - You'll see a success message
   - Patient appears in your patients list
   - You can now monitor their activities

5. If failed:
   - Check the code is correct (8 characters)
   - Ensure patient completed their setup
   - Try again

### Step 5: Caregiver Dashboard

Your dashboard shows:

**📊 Overview**
- Number of linked patients
- Active alerts count
- Recent activities

**👥 Linked Patients**
- List of all patients you're monitoring
- Click on patient to view details

**🚨 Alerts**
- Emergency button activations
- Skipped tasks
- Unknown person encounters
- Health abnormalities
- Safe area breaches

**📍 Patient Location**
- Real-time location on map
- Safe area boundary visualization
- Location history

### Step 6: Monitoring Patient

1. Navigate to **"Patients"** page
2. Click on a patient to view:
   - **Known Faces**: People they've saved
   - **Tasks**: Upcoming and completed tasks
   - **AI Interactions**: Recent conversations
   - **Alerts**: All alerts for this patient
   - **Activity Logs**: Complete activity history

3. You can:
   - View their known faces
   - Create tasks for them
   - See their AI companion conversations
   - Check their location
   - View all alerts

### Step 7: Responding to Alerts

**Emergency Alert**:
1. Notification appears immediately
2. Shows patient's location
3. Call patient or emergency services
4. Mark alert as "Read" when handled

**Task Skipped Alert**:
1. See which task was skipped
2. Check if patient needs help
3. Call or visit patient
4. Mark alert as "Read"

**Unknown Person Alert**:
1. See photo of unknown person (if captured)
2. AI description of their appearance
3. Check if patient is safe
4. Contact patient if needed

**Safe Area Breach**:
1. See patient's current location
2. Check if they're lost
3. Call patient to guide them back
4. Consider going to their location

---

## 🔍 AI Face Detection Details

### How It Works

1. **Camera Activation**: Patient starts camera on Face Recognition page
2. **Model Loading**: 4 AI models load (TinyFaceDetector, FaceLandmark68Net, FaceRecognitionNet, FaceExpressionNet)
3. **Continuous Detection**: Camera scans for faces every 2 seconds
4. **Face Matching**: Detected face compared against known faces database
5. **AI Analysis**: Google Gemini 2.5 Flash analyzes the image for:
   - Clothing color and type
   - Current activity
   - Facial expression
   - Appearance details
6. **Whisper Feedback**: Contextual description whispered via Bluetooth

### AI Analysis Examples

**Known Person - Alen**:
```
Input: Face detected, matched to "Alen"
AI Analysis: "Alen is watching you wearing a green shirt and smiling."
Whisper: "This is Alen. Alen is watching you wearing a green shirt and smiling."
```

**Unknown Person**:
```
Input: Face detected, no match found
AI Analysis: "A new person is watching you silently wearing a red jacket with short brown hair."
Whisper: "You are meeting someone new. A new person is watching you silently wearing a red jacket with short brown hair."
```

**Known Person - Sarah**:
```
Input: Face detected, matched to "Sarah"
AI Analysis: "Sarah is standing nearby wearing a blue jacket and looking friendly."
Whisper: "This is Sarah. Sarah is standing nearby wearing a blue jacket and looking friendly."
```

### What AI Detects

**Clothing**:
- Color (red, blue, green, black, white, etc.)
- Type (shirt, jacket, sweater, dress, etc.)
- Style (casual, formal, etc.)

**Activity**:
- Watching you
- Looking at you
- Standing
- Sitting
- Walking
- Approaching
- Leaving

**Expression**:
- Smiling
- Friendly
- Calm
- Neutral
- Concerned

**Appearance**:
- Hair color (brown, black, blonde, gray, etc.)
- Hair length (short, long, medium)
- Glasses (yes/no)
- Distinctive features (beard, mustache, etc.)

### Privacy & Security

✅ **Local Processing**: Face detection runs on device  
✅ **Encrypted Storage**: Face encodings encrypted in database  
✅ **Secure Transmission**: All data encrypted in transit  
✅ **RLS Policies**: Only patient and linked caregivers can access data  
✅ **No Public Access**: Face data never shared publicly  
✅ **Caregiver Access**: Only linked caregivers can view patient data  

---

## 🔗 Device Linking Details

### How Linking Works

1. **Patient Setup**: Patient completes setup → receives linking code
2. **Code Generation**: Database function generates unique 8-character code
3. **Code Sharing**: Patient shares code with caregiver (text, email, in-person)
4. **Caregiver Entry**: Caregiver enters code in their app
5. **Patient Search**: System searches for patient by linking code
6. **Link Creation**: Device link created in database
7. **Access Granted**: Caregiver can now view patient data

### Linking Code Format

- **Length**: 8 characters
- **Characters**: Uppercase letters (A-Z) and numbers (0-9)
- **Example**: "1A4B53EA", "7F2K9P3M", "B5D8N1Q4"
- **Uniqueness**: Each patient has one unique code
- **Permanence**: Code doesn't change (cannot regenerate)

### Multiple Caregivers

✅ **Supported**: One patient can link to multiple caregivers  
✅ **Same Code**: All caregivers use the same linking code  
✅ **Independent Access**: Each caregiver has their own account  
✅ **Equal Access**: All linked caregivers see same patient data  

### Unlinking (Future Feature)

⚠️ **Not Yet Implemented**: Cannot unlink devices currently  
🔄 **Workaround**: Contact support to manually unlink  

---

## 🎧 Bluetooth Whisper System

### How It Works

1. **Bluetooth Connection**: Patient connects Bluetooth earphones to device
2. **Audio Output**: All guidance delivered via Bluetooth
3. **No Loudspeaker**: Audio never plays through phone speaker (except emergencies)
4. **Text-to-Speech**: Natural, calm, friendly voice
5. **Contextual Messages**: Messages tailored to situation

### Whisper Examples

**Face Recognition**:
- "This is Alen. Alen is watching you wearing a green shirt and smiling."
- "You are meeting someone new. A new person is watching you silently wearing a red jacket."
- "Would you like to save this person? Tap the Save This Person button."

**AI Companion**:
- "Today is Tuesday, January 2nd, 2026."
- "You are at home, and it's a beautiful day."
- "You took your medicine at 9 AM this morning."

**Task Reminders**:
- "It's time to take your medicine."
- "Remember to call your doctor at 2 PM."
- "Don't forget to eat lunch."

**Orientation**:
- "You are at home. Your caregiver is Sarah."
- "It's morning, and you have breakfast scheduled soon."

**Emergency**:
- "Emergency alert sent to your caregiver. Help is on the way."

### Setup Bluetooth

1. **Pair Earphones**: Go to phone Settings → Bluetooth → Pair earphones
2. **Test Audio**: Play music to verify connection
3. **Open RemZy**: Audio will automatically route to Bluetooth
4. **Adjust Volume**: Use phone volume buttons

---

## 🚨 Emergency Features

### Panic Button

**Location**: Always visible on patient dashboard (large red button)

**How to Use**:
1. Tap the red "Emergency" button once
2. Alert sent immediately to all linked caregivers
3. Your location shared automatically
4. Whisper confirms: "Emergency alert sent to your caregiver."

**What Caregivers See**:
- Immediate notification
- Patient's current location on map
- Timestamp of emergency
- Option to call patient

### Safe Area Alerts

**Setup**:
1. During patient setup, set safe area location
2. Set radius (default: 500 meters)
3. System monitors location continuously

**How It Works**:
1. Patient's location tracked in background
2. If patient exits safe area boundary:
   - Alert sent to caregivers
   - Patient's current location shared
   - Caregiver can call or navigate to patient

**Use Cases**:
- Patient wanders away from home
- Patient gets lost
- Patient leaves care facility

---

## 📊 Activity Logs

### What's Logged

**Patient Activities**:
- Face recognition events (known/unknown)
- Task completions and skips
- AI companion conversations
- Location changes
- Emergency button activations
- Unknown person encounters

**Caregiver Activities**:
- Device linking events
- Alert acknowledgments
- Task creations
- Patient monitoring sessions

### Viewing Logs

**Caregiver View**:
1. Navigate to patient details
2. Click "Activity Logs" tab
3. Filter by:
   - Date range
   - Activity type
   - Status
4. Export logs (future feature)

**Patient View**:
- Patients cannot view their own logs
- Maintains dignity and reduces confusion

---

## 🔧 Troubleshooting

### Face Recognition Not Working

**Problem**: Camera not starting
- **Solution**: Allow camera permissions in browser/app settings
- **Solution**: Refresh page and try again
- **Solution**: Check if another app is using camera

**Problem**: Models not loading
- **Solution**: Check internet connection
- **Solution**: Wait 30-60 seconds for models to download
- **Solution**: Refresh page to retry

**Problem**: Face not detected
- **Solution**: Ensure good lighting
- **Solution**: Face camera directly (1-3 feet away)
- **Solution**: Remove sunglasses or face coverings

**Problem**: Wrong person recognized
- **Solution**: Improve lighting conditions
- **Solution**: Re-save person with better photo
- **Solution**: Delete incorrect face and re-add

### Device Linking Not Working

**Problem**: "Patient not found" error
- **Solution**: Verify linking code is correct (8 characters)
- **Solution**: Ensure patient completed setup first
- **Solution**: Check code is uppercase (auto-normalized)

**Problem**: "Already linked" error
- **Solution**: Patient already linked to your account
- **Solution**: Check patients list to confirm

**Problem**: Cannot enter linking code
- **Solution**: Complete caregiver setup first
- **Solution**: Refresh page and try again

### AI Analysis Not Working

**Problem**: No clothing/activity description
- **Solution**: Check internet connection (AI requires online access)
- **Solution**: Wait a few seconds for AI to analyze
- **Solution**: Ensure good lighting for better analysis

**Problem**: Incorrect description
- **Solution**: AI does its best but may not be 100% accurate
- **Solution**: Improve lighting and camera angle
- **Solution**: Ensure person is fully visible in frame

### Bluetooth Whisper Not Working

**Problem**: No audio heard
- **Solution**: Check Bluetooth earphones are connected
- **Solution**: Increase phone volume
- **Solution**: Test Bluetooth with music app
- **Solution**: Disconnect and reconnect Bluetooth

**Problem**: Audio plays through speaker
- **Solution**: Ensure Bluetooth is connected
- **Solution**: Check audio output settings
- **Solution**: Restart app

---

## 📞 Support

### Getting Help

**Technical Issues**:
1. Check this guide first
2. Try troubleshooting steps
3. Refresh app and try again
4. Contact support with:
   - Username
   - Error message
   - Steps to reproduce
   - Screenshots

**Feature Requests**:
- Submit via feedback form
- Describe desired feature
- Explain use case

**Bug Reports**:
- Describe the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or screen recording

---

## 🎓 Best Practices

### For Patients

✅ **Save Known Faces**: Add family, friends, doctors, neighbors  
✅ **Use AI Companion**: Ask questions when confused  
✅ **Complete Tasks**: Mark tasks as done to keep caregiver informed  
✅ **Keep Bluetooth On**: Ensure whisper guidance works  
✅ **Charge Device**: Keep phone charged for continuous monitoring  
✅ **Stay in Safe Area**: Avoid wandering outside safe zone  

### For Caregivers

✅ **Link Immediately**: Link to patient as soon as they complete setup  
✅ **Monitor Regularly**: Check dashboard daily  
✅ **Respond to Alerts**: Acknowledge and act on alerts promptly  
✅ **Create Tasks**: Set up medication and appointment reminders  
✅ **Review Logs**: Check activity logs weekly  
✅ **Update Contact Info**: Keep your phone number current  
✅ **Test Emergency**: Periodically test emergency button with patient  

---

## 🔐 Privacy & Security

### Data Protection

✅ **End-to-End Encryption**: All data encrypted in transit  
✅ **Encrypted Storage**: Face encodings and photos encrypted at rest  
✅ **RLS Policies**: Row-level security enforces data isolation  
✅ **SECURITY DEFINER**: Functions prevent RLS recursion  
✅ **No Public Access**: Data never shared publicly  
✅ **Caregiver-Only Access**: Only linked caregivers can view patient data  

### What We Store

**Patient Data**:
- Profile information (name, date of birth)
- Face encodings (128-dimensional vectors)
- Photos (for face recognition)
- Task data
- AI conversation logs
- Location history
- Health metrics

**Caregiver Data**:
- Profile information (name, phone)
- Device links
- Alert acknowledgments

### What We Don't Store

❌ **Passwords**: Only hashed passwords stored  
❌ **Credit Cards**: No payment information  
❌ **Social Security**: No government IDs  
❌ **Medical Records**: No health records  
❌ **Live Video**: No continuous video recording  

### Your Rights

✅ **Access**: View all your data anytime  
✅ **Export**: Export your data (future feature)  
✅ **Delete**: Request account deletion  
✅ **Correct**: Update incorrect information  
✅ **Unlink**: Unlink from caregivers (future feature)  

---

## 📈 Future Features

### Coming Soon

🔄 **QR Code Scanner**: Scan QR code instead of typing linking code  
🔄 **Offline Mode**: Basic features work without internet  
🔄 **Voice Commands**: Control app with voice  
🔄 **Medication Tracking**: Photo-based pill recognition  
🔄 **Fall Detection**: Automatic alert on fall  
🔄 **Sleep Monitoring**: Track sleep patterns  
🔄 **Nutrition Tracking**: Meal reminders and logging  
🔄 **Exercise Reminders**: Physical activity prompts  
🔄 **Social Features**: Connect with other patients/caregivers  
🔄 **Video Calls**: Built-in video calling  

### Under Consideration

💭 **Wearable Integration**: Apple Watch, Fitbit support  
💭 **Smart Home Integration**: Control lights, locks, etc.  
💭 **Multi-Language Support**: Spanish, Chinese, etc.  
💭 **Professional Caregiver Mode**: Features for care facilities  
💭 **Insurance Integration**: Share data with insurance  
💭 **Doctor Portal**: Share data with healthcare providers  

---

## ✅ Quick Reference

### Patient Quick Start

1. Sign up → Select "Patient Mode"
2. Complete setup → Get linking code
3. Share code with caregiver
4. Start using Face Recognition
5. Ask AI Companion questions
6. Complete tasks as reminded

### Caregiver Quick Start

1. Sign up → Select "Caregiver Mode"
2. Complete setup
3. Enter patient's linking code
4. Monitor patient dashboard
5. Respond to alerts
6. Review activity logs

### Emergency Procedure

**Patient**: Tap red Emergency button  
**Caregiver**: Receive alert → Check location → Call patient → Take action  

### Face Recognition Quick Tips

- Good lighting essential
- Face camera directly
- 1-3 feet distance
- Remove sunglasses
- Wait for AI analysis
- Save unknown people

---

**Version**: 5.0.0  
**Last Updated**: 2026-01-02  
**Support**: support@remzy.app
