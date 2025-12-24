# Camera Not Working - Quick Fix Guide

## 🚨 Camera Allowed But Not Showing Video?

If you clicked "Allow" for camera permissions but still don't see video, follow these steps:

### Step 1: Open Browser Console (CRITICAL)
**Press F12** (or Right-click → Inspect → Console)

This will show you exactly what's happening. Look for messages like:
- ✅ "Camera access granted" = Permission is working
- ✅ "Video metadata loaded" = Video is loading
- ✅ "Video playing" = Everything should work
- ❌ Red error messages = Shows the exact problem

### Step 2: Use the Diagnostic Tool
Open this page in your browser:
```
http://localhost:5173/camera-diagnostic.html
```

This tool will:
- ✅ Check if your browser supports cameras
- ✅ List all available cameras on your device
- ✅ Test both front and back cameras
- ✅ Show detailed error messages
- ✅ Provide specific solutions

### Step 3: Common Fixes

#### Fix 1: Camera In Use by Another App
**Problem**: Another app is using your camera
**Solution**: 
- Close Zoom, Teams, Skype, or any video call apps
- Close other browser tabs using camera
- Restart your browser
- Try again

#### Fix 2: Wrong Camera Selected
**Problem**: Browser is trying to use a camera that doesn't exist
**Solution**:
- The app will automatically try simple camera settings
- Wait for the "Using default camera settings" message
- Or use the diagnostic tool to test each camera individually

#### Fix 3: Browser Cache Issue
**Problem**: Old settings are cached
**Solution**:
- Press Ctrl+Shift+R (or Cmd+Shift+R on Mac) to hard refresh
- Or clear browser cache:
  - Chrome: Settings → Privacy → Clear browsing data
  - Safari: Develop → Empty Caches
  - Firefox: Settings → Privacy → Clear Data

#### Fix 4: Video Element Not Rendering
**Problem**: Video element exists but doesn't show
**Solution**:
- Look for "Camera Active" green badge on screen
- If you see the badge but no video, check console for errors
- Try stopping and starting camera again
- Refresh the page

#### Fix 5: Mobile Browser Issues
**Problem**: Mobile browsers have stricter policies
**Solution**:
- Ensure you're using Safari on iOS (not Chrome)
- On Android, use Chrome or Firefox
- Make sure camera isn't being used by another app
- Check phone settings: Settings → Apps → Browser → Permissions → Camera

### Step 4: Check What You Should See

When camera is working, you should see:

1. **Green "Camera Active" badge** in top-right corner of video area
2. **Live video feed** showing what the camera sees
3. **Black rectangle** with video inside (minimum 300px tall)
4. **Console message**: "Video playing after metadata loaded"

If you see the green badge but no video:
- Video element exists but isn't rendering
- Check console for "Video dimensions: 0x0" (means no video data)
- Try the diagnostic tool to test camera independently

### Step 5: Test With Diagnostic Tool

The diagnostic tool (`camera-diagnostic.html`) provides:

**Visual Status Cards**:
- Browser Support: Should show "Supported" in green
- Camera Devices: Should show "X Found" in green
- Permissions: Should show "Granted" in green after allowing
- Video Stream: Should show "Active" in green when camera starts

**Detailed Logs**:
- Every step is logged with timestamps
- Errors shown in red with solutions
- Success messages in green
- Camera specifications (resolution, facing mode, etc.)

**Live Video Preview**:
- See exactly what the camera captures
- Verify video is actually working
- Test both front and back cameras

### Step 6: Advanced Debugging

If nothing above works, check these:

#### Check Video Element in DevTools
1. Press F12
2. Go to Elements tab
3. Find `<video>` element
4. Check if it has:
   - `srcObject` property set
   - `autoplay` attribute
   - `muted` attribute
   - `playsinline` attribute

#### Check Stream Object
In console, type:
```javascript
// Check if stream exists
console.log(document.querySelector('video').srcObject);

// Should show: MediaStream {id: "...", active: true}
```

#### Force Video Play
In console, type:
```javascript
document.querySelector('video').play()
  .then(() => console.log('Playing!'))
  .catch(err => console.error('Error:', err));
```

### Step 7: Browser-Specific Issues

#### Chrome/Edge
- Requires HTTPS (or localhost for development)
- Check for "Not secure" warning in address bar
- Go to: chrome://settings/content/camera
- Ensure site is allowed

#### Safari
- May require explicit permission each time
- Go to: Safari → Preferences → Websites → Camera
- Set to "Allow" for the site
- Try Safari Technology Preview if issues persist

#### Firefox
- May block camera on first visit
- Click shield icon in address bar
- Disable tracking protection for this site
- Go to: about:preferences#privacy

#### Mobile Safari (iOS)
- Requires iOS 14.3+ for WebRTC
- Must use Safari (not Chrome on iOS)
- Check: Settings → Safari → Camera → Allow
- Restart Safari if needed

#### Mobile Chrome (Android)
- Requires Android 5.0+
- Check: Settings → Apps → Chrome → Permissions → Camera
- Ensure "Allow" is selected
- Clear app cache if needed

### Step 8: System-Level Checks

#### Windows
- Settings → Privacy → Camera
- Ensure "Allow apps to access your camera" is ON
- Ensure browser is in the allowed list

#### macOS
- System Preferences → Security & Privacy → Camera
- Ensure browser is checked in the list
- May need to restart browser after granting permission

#### Linux
- Check if camera device exists: `ls /dev/video*`
- Check permissions: `ls -l /dev/video0`
- May need to add user to video group: `sudo usermod -a -G video $USER`

#### iOS
- Settings → Safari → Camera → Allow
- Settings → Privacy → Camera → Safari → ON
- Restart device if needed

#### Android
- Settings → Apps → Browser → Permissions → Camera → Allow
- Settings → Privacy → Permission manager → Camera → Browser → Allow
- Restart app if needed

## 🎯 Quick Checklist

Before asking for help, verify:

- [ ] Opened browser console (F12) and checked for errors
- [ ] Tried the diagnostic tool (camera-diagnostic.html)
- [ ] Closed other apps using camera
- [ ] Hard refreshed the page (Ctrl+Shift+R)
- [ ] Tested with diagnostic tool - both cameras work there
- [ ] Checked browser permissions settings
- [ ] Tried a different browser
- [ ] Restarted browser
- [ ] Checked system-level camera permissions

## 📊 What to Report

If still not working, provide this information:

1. **Browser Console Output**:
   - Copy all messages from console
   - Include any red error messages
   - Note what the last successful message was

2. **Diagnostic Tool Results**:
   - Screenshot of status cards
   - Copy log output
   - Note if diagnostic tool works but main app doesn't

3. **Device Information**:
   - Browser: Chrome 120, Safari 17, etc.
   - OS: Windows 11, macOS 14, iOS 17, Android 13, etc.
   - Device: iPhone 14, Windows laptop, etc.

4. **What You See**:
   - Green "Camera Active" badge visible? Yes/No
   - Black rectangle visible? Yes/No
   - Video feed visible? Yes/No
   - Any error messages on screen? What do they say?

5. **Console Messages**:
   - "Camera access granted" - Yes/No
   - "Video metadata loaded" - Yes/No
   - "Video playing" - Yes/No
   - Any error messages? Copy them

## 🔧 Recent Improvements

The latest version includes:

✅ **Automatic Fallback**: If back camera fails, automatically tries simple camera settings
✅ **Detailed Logging**: Every step logged to console for easy debugging
✅ **Better Error Messages**: Specific error messages for each type of failure
✅ **Visual Indicators**: Green "Camera Active" badge shows when camera is running
✅ **Diagnostic Tool**: Standalone tool to test camera independently
✅ **Multiple Retry Strategies**: Tries different camera configurations automatically

## 🎬 Expected Behavior

### When Working Correctly:

1. Click "Start Camera" button
2. Browser shows permission prompt
3. Click "Allow"
4. See console message: "Camera access granted"
5. See console message: "Video metadata loaded"
6. See console message: "Video playing"
7. See green "Camera Active" badge appear
8. See live video feed in black rectangle
9. Video shows what camera sees in real-time

### Timing:
- Permission prompt: Immediate
- Camera access: 1-2 seconds
- Video appears: 2-3 seconds
- Face detection starts: 3-4 seconds

If any step takes longer than 10 seconds, something is wrong. Check console for errors.

---

**Last Updated**: 2025-12-24
**Version**: 2.0.0
**Status**: Enhanced with automatic fallback and diagnostic tools
