# 📸 Face Photo Capture - Quick Guide

## New Features Added

### 1. ✨ Manual "Add Person" Button
**Location**: Below the camera feed when camera is active

**What it does**: Opens the save dialog so you can manually add someone without waiting for automatic detection.

**How to use**:
1. Start the camera
2. Point camera at person's face
3. Click "Add Person Manually" button
4. Dialog opens - now capture the photo

---

### 2. 📷 Capture/Retake Photo Button
**Location**: Inside the "Save New Person" dialog

**What it does**: Captures or retakes the person's photo from the live camera feed.

**How to use**:
- **First time**: Click "Capture Photo" to take the picture
- **Retake**: Click "Retake Photo" to capture a new picture

---

### 3. 👤 Photo Preview
**Location**: Top of the "Save New Person" dialog

**What it shows**:
- **Before capture**: Gray circle with user icon (dashed border)
- **After capture**: Actual photo in circle (solid blue border with green camera badge)

---

## How to Add a Person (Two Ways)

### Method 1: Automatic Detection (Original)
```
1. Start Camera
   ↓
2. Point at unknown person
   ↓
3. System detects face automatically
   ↓
4. Whispers: "You are meeting someone new"
   ↓
5. "Save This Person" button appears
   ↓
6. Click button → Dialog opens with photo already captured
   ↓
7. Enter name and details
   ↓
8. Click "Save Person"
```

### Method 2: Manual Addition (New)
```
1. Start Camera
   ↓
2. Point at person
   ↓
3. Click "Add Person Manually" button
   ↓
4. Dialog opens (no photo yet)
   ↓
5. Click "Capture Photo" button
   ↓
6. Photo captured and displayed
   ↓
7. Enter name and details
   ↓
8. Click "Save Person"
```

---

## Visual Guide

### Camera Screen with Manual Button

```
┌─────────────────────────────────┐
│  Face Recognition               │
├─────────────────────────────────┤
│                                 │
│  [Start Camera] [🔊]            │
│                                 │
│  ┌───────────────────────────┐ │
│  │                           │ │
│  │   [Live Camera Feed]      │ │
│  │                           │ │
│  │            [Camera Active]│ │ ← Green badge
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │  👤 Add Person Manually   │ │ ← NEW BUTTON
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### Save Dialog - Before Photo Capture

```
┌─────────────────────────────────┐
│  Save New Person            [X] │
├─────────────────────────────────┤
│  Add this person to your        │
│  contacts so I can recognize    │
│  them next time.                │
│                                 │
│  Photo                          │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐  │
│  │                           │  │
│  │         ┌─────┐           │  │
│  │         │ 👤  │           │  │ ← Placeholder
│  │         └─────┘           │  │
│  │                           │  │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘  │
│                                 │
│     [📷 Capture Photo]          │ ← Primary button
│                                 │
│  Name *                         │
│  [________________]             │
│                                 │
│  Relationship                   │
│  [________________]             │
│                                 │
│  Notes (Optional)               │
│  [________________]             │
│  [________________]             │
│                                 │
│  [Cancel]  [Save Person]        │
│             (disabled)          │ ← Disabled until photo captured
└─────────────────────────────────┘
```

### Save Dialog - After Photo Capture

```
┌─────────────────────────────────┐
│  Save New Person            [X] │
├─────────────────────────────────┤
│  Add this person to your        │
│  contacts so I can recognize    │
│  them next time.                │
│                                 │
│  Photo                          │
│  ┌───────────────────────────┐ │
│  │                           │ │
│  │       ┏━━━━━━━┓           │ │
│  │       ┃ Photo ┃           │ │ ← Actual photo
│  │       ┗━━━━━━━┛           │ │
│  │          📷               │ │ ← Green camera badge
│  └───────────────────────────┘ │
│                                 │
│     [📷 Retake Photo]           │ ← Outline button
│                                 │
│  Name *                         │
│  [John Smith_______]            │
│                                 │
│  Relationship                   │
│  [Friend___________]            │
│                                 │
│  Notes (Optional)               │
│  [Met at the park__]            │
│  [________________]             │
│                                 │
│  [Cancel]  [Save Person]        │
│             (enabled)           │ ← Enabled when name + photo ready
└─────────────────────────────────┘
```

---

## Button States

### "Capture Photo" Button

| State | Appearance | When |
|-------|------------|------|
| Enabled | Blue button | Camera is active |
| Disabled | Gray button | Camera is not active |
| Success | Shows "Retake Photo" | Photo captured |

### "Save Person" Button

| State | Appearance | When |
|-------|------------|------|
| Enabled | Blue button | Name entered AND photo captured |
| Disabled | Gray button | Name empty OR no photo |

---

## Error Messages

### Camera Not Ready
```
❌ Camera Not Ready
Please start the camera first.
```
**Solution**: Click "Start Camera" button first

### No Face Detected
```
❌ No Face Detected
Please ensure a face is clearly visible in the camera.
```
**Solution**: 
- Move closer to camera
- Ensure good lighting
- Face the camera directly
- Remove obstructions (sunglasses, mask, etc.)

### Capture Failed
```
❌ Capture Failed
Could not capture photo. Please try again.
```
**Solution**: Click "Capture Photo" button again

### Missing Information
```
❌ Missing Information
Please enter a name for this person.
```
**Solution**: Type a name in the "Name" field

---

## Success Messages

### Photo Captured
```
✅ Photo Captured
Face photo captured successfully.
```

### Contact Saved
```
✅ Contact Saved
John Smith has been added to your contacts.
```

---

## Tips for Best Results

### 📸 Taking Good Photos

1. **Lighting**: Ensure face is well-lit (not too dark or bright)
2. **Distance**: 1-3 feet from camera works best
3. **Angle**: Face the camera directly (not from side)
4. **Expression**: Neutral expression works best
5. **Background**: Simple background helps detection
6. **Stability**: Hold device steady when capturing

### 🎯 When to Use Manual vs Automatic

**Use Automatic** when:
- Person is standing still
- Good lighting conditions
- Face is clearly visible
- You have time to wait

**Use Manual** when:
- Automatic detection is slow
- You want immediate control
- Person is moving
- You want to choose exact moment

---

## Troubleshooting

### Photo Not Appearing in Dialog

**Problem**: Dialog opens but no photo shown

**Solutions**:
1. Click "Capture Photo" button in dialog
2. Ensure camera is active (green badge visible)
3. Ensure face is visible in camera feed
4. Check browser console (F12) for errors

### Can't Click "Save Person" Button

**Problem**: Button is grayed out

**Reasons**:
- Name field is empty → Enter a name
- Photo not captured → Click "Capture Photo"
- Face descriptor missing → Retake photo

**Solution**: Ensure both name and photo are provided

### "Capture Photo" Button Disabled

**Problem**: Can't click capture button

**Reason**: Camera is not active

**Solution**: 
1. Close dialog
2. Click "Start Camera" button
3. Wait for green "Camera Active" badge
4. Open dialog again
5. Click "Capture Photo"

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Esc | Close dialog |
| Enter | Save person (when form is valid) |
| Tab | Navigate between fields |

---

## Data Storage

### What Gets Saved

1. **Photo**: Base64 JPEG image (20-50KB)
2. **Face Descriptor**: 128-dimensional vector for recognition
3. **Name**: Person's name (required)
4. **Relationship**: Optional (Friend, Doctor, etc.)
5. **Notes**: Optional additional information
6. **Timestamps**: When added and last seen

### Where It's Stored

- **Database Table**: `known_faces`
- **Photo Field**: `photo_url` (text, base64 encoded)
- **Descriptor Field**: `face_encoding` (text, JSON array)

---

## Privacy & Security

✅ **Photos stored locally** in your database
✅ **No cloud upload** unless you configure it
✅ **Only you can see** your saved contacts
✅ **Encrypted** if using Supabase with encryption
✅ **Can be deleted** anytime from contacts page

---

## Quick Reference

### To Add Someone Manually:
1. Start Camera
2. Click "Add Person Manually"
3. Click "Capture Photo"
4. Enter name
5. Click "Save Person"

### To Retake a Photo:
1. Open save dialog
2. Click "Retake Photo"
3. Photo updates automatically

### To Save Without Photo:
❌ Not possible - photo is required for face recognition

---

**Need Help?**
- Check browser console (F12) for detailed logs
- Ensure camera permissions are granted
- Try refreshing the page if issues persist
- See FACE_PHOTO_FEATURE.md for technical details

---

**Last Updated**: 2025-12-24
**Version**: 1.0.0
