# RemZy Troubleshooting Guide

**Date**: 2026-01-02  
**Version**: 5.1.0

---

## 🔍 Common Issues and Solutions

### Issue 1: "Contact Saved" but Not Visible in Contacts

**Problem**: After saving a face from Face Recognition page, the contact doesn't appear in the Contacts list.

**Cause**: The Contacts page needs to be refreshed or navigated to.

**Solution**:
1. After saving a face, you'll see a success message: "Contact Saved Successfully. You can view them in the Contacts page."
2. Navigate to the **Contacts** page from the navigation menu
3. The saved contact should appear with their photo and name
4. If not visible, try refreshing the page (F5 or pull-down to refresh)

**Verification**:
- Check browser console for logs: "✅ Face saved successfully"
- Check database: Contact should be in `known_faces` table with `face_encoding` and `photo_url`

---

### Issue 2: "AI Analysis Unavailable"

**Problem**: When a face is detected, the AI description shows "AI analysis unavailable" or just says "is nearby".

**Causes**:
1. No internet connection
2. Gemini API error
3. Image too large
4. API rate limit exceeded
5. Invalid APP_ID

**Solutions**:

**Step 1: Check Internet Connection**
- Ensure device has active internet connection
- Test by opening a website in another tab
- Check if other online features work

**Step 2: Check Browser Console**
- Open browser DevTools (F12)
- Go to Console tab
- Look for AI analysis logs:
  - `🤖 AI Analysis starting...`
  - `📤 Sending request to Gemini API...`
  - `📥 Response status: 200 OK` (success) or error code
  - `✅ AI Analysis complete: [description]`

**Step 3: Check for Errors**
- Look for red error messages in console:
  - `❌ AI API error response:` - API rejected request
  - `❌ Error analyzing with AI:` - Network or parsing error
- Note the error message and status code

**Step 4: Common Error Codes**
- **400 Bad Request**: Image format issue or prompt too long
  - Solution: Retry with better lighting
- **401 Unauthorized**: Invalid APP_ID
  - Solution: Check `.env` file has correct `VITE_APP_ID`
- **429 Too Many Requests**: Rate limit exceeded
  - Solution: Wait 1 minute and try again
- **500 Internal Server Error**: Gemini API issue
  - Solution: Wait and retry, or check Google Cloud status
- **503 Service Unavailable**: API temporarily down
  - Solution: Wait 5-10 minutes and retry

**Step 5: Fallback Behavior**
- If AI fails, system returns generic description: "is nearby"
- Face recognition still works (name is recognized)
- Only the detailed description is missing
- Example: "This is Alen. Alen is nearby." instead of "This is Alen. Alen is watching you wearing a green shirt."

**Step 6: Retry**
- Move face out of frame and back in
- System will re-detect and retry AI analysis
- Check console for new attempt logs

---

### Issue 3: Face Not Detected

**Problem**: Camera is active but no face is detected.

**Solutions**:
1. **Improve Lighting**: Ensure good, even lighting on face
2. **Face Camera Directly**: Look straight at camera (not profile)
3. **Optimal Distance**: Stay 1-3 feet from camera
4. **Remove Obstructions**: Take off sunglasses, hats, masks
5. **Wait for Models**: Ensure all 4 models loaded (check console for "✅ All models loaded successfully")
6. **Check Camera Quality**: Use device with good camera (720p minimum)

---

### Issue 4: Wrong Person Recognized

**Problem**: System recognizes wrong person or confuses people.

**Solutions**:
1. **Improve Lighting**: Better lighting improves accuracy
2. **Re-save Person**: Delete incorrect face and re-save with better photo
3. **Multiple Photos**: Save same person multiple times with different angles/lighting
4. **Check Threshold**: System uses 0.6 threshold (lower = stricter)

---

### Issue 5: Contacts Not Loading

**Problem**: Contacts page shows "Loading contacts..." forever or shows empty when contacts exist.

**Solutions**:
1. **Refresh Page**: Press F5 or pull-down to refresh
2. **Check Profile**: Ensure you're logged in as patient
3. **Check Database**: Verify `known_faces` table has records for your patient_id
4. **Check Console**: Look for errors in browser console
5. **Check RLS Policies**: Ensure `is_patient_owner()` function works

**Verification Query**:
```sql
SELECT * FROM known_faces WHERE patient_id = '[your-patient-id]';
```

---

### Issue 6: Photo Not Displaying in Contacts

**Problem**: Contact saved but photo shows initials instead of image.

**Causes**:
1. Photo URL is NULL
2. Photo URL is invalid
3. Base64 image too large
4. Browser can't render base64 image

**Solutions**:
1. **Check Database**: Verify `photo_url` column is not NULL
2. **Check Size**: Photo should be ~100KB (base64 encoded)
3. **Re-save Contact**: Delete and re-save with new photo
4. **Check Browser Console**: Look for image loading errors

**Verification Query**:
```sql
SELECT 
  person_name,
  CASE WHEN photo_url IS NOT NULL THEN 'Present' ELSE 'NULL' END as photo_status,
  LENGTH(photo_url) as photo_size
FROM known_faces
WHERE patient_id = '[your-patient-id]';
```

---

### Issue 7: Face Encoding Not Saved

**Problem**: Face saved but not recognized later.

**Causes**:
1. Face encoding is NULL
2. Face encoding is invalid JSON
3. Face encoding is wrong length (not 128 elements)

**Solutions**:
1. **Check Database**: Verify `face_encoding` column is not NULL
2. **Check Length**: Parse JSON and verify 128 elements
3. **Re-save Face**: Delete and re-save with camera active
4. **Check Console**: Look for "Face encoding array length: 128"

**Verification Query**:
```sql
SELECT 
  person_name,
  CASE WHEN face_encoding IS NOT NULL THEN 'Present' ELSE 'NULL' END as encoding_status,
  LENGTH(face_encoding) as encoding_size,
  (SELECT COUNT(*) FROM json_array_elements(face_encoding::json)) as encoding_length
FROM known_faces
WHERE patient_id = '[your-patient-id]';
```

Expected: `encoding_length = 128`

---

### Issue 8: Camera Not Starting

**Problem**: Camera button clicked but camera doesn't start.

**Solutions**:
1. **Allow Permissions**: Click "Allow" when browser asks for camera access
2. **Check Browser Settings**: Ensure camera not blocked in browser settings
3. **Close Other Apps**: Close other apps using camera (Zoom, Skype, etc.)
4. **Restart Browser**: Close and reopen browser
5. **Check Device**: Ensure device has working camera
6. **Try Different Browser**: Test in Chrome, Firefox, or Safari

---

### Issue 9: Models Not Loading

**Problem**: Face detection models fail to load.

**Solutions**:
1. **Check Internet**: Models download from CDN (requires internet)
2. **Wait Longer**: Models can take 30-60 seconds to load
3. **Check Console**: Look for model loading logs
4. **Clear Cache**: Clear browser cache and reload
5. **Try Different Network**: Switch to different WiFi or mobile data

**Model Loading Logs**:
```
🔄 Loading face detection models...
Trying model URL: [url]
✅ Model loaded: TinyFaceDetector
✅ Model loaded: FaceLandmark68Net
✅ Model loaded: FaceRecognitionNet
✅ Model loaded: FaceExpressionNet
✅ All models loaded successfully
```

---

### Issue 10: Whisper Audio Not Working

**Problem**: No audio heard when face detected.

**Solutions**:
1. **Enable Audio**: Click "Enable Audio" button on Face Recognition page
2. **Check Volume**: Increase device volume
3. **Check Browser**: Ensure browser allows audio playback
4. **User Interaction**: Click anywhere on page first (browsers require user interaction for audio)
5. **Check Console**: Look for "🔊 Speaking: [text]" logs

---

## 🛠️ Debugging Tools

### Browser Console

**How to Open**:
- Chrome/Edge: Press F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)
- Firefox: Press F12 or Ctrl+Shift+K (Cmd+Option+K on Mac)
- Safari: Enable Developer menu, then press Cmd+Option+C

**What to Look For**:
- ✅ Green checkmarks = success
- ❌ Red X = error
- ⚠️ Yellow warning = non-critical issue
- 🔍 Magnifying glass = search/detection
- 🤖 Robot = AI analysis
- 💾 Floppy disk = save operation
- 🔊 Speaker = audio/whisper

### Network Tab

**How to Use**:
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Look for failed requests (red)
5. Click on request to see details

**Key Requests**:
- `streamGenerateContent` - Gemini AI API
- `known_faces` - Database queries
- `patients` - Patient data
- `models` - Face detection models

### Database Queries

**Check Saved Faces**:
```sql
SELECT 
  id,
  person_name,
  relationship,
  CASE WHEN face_encoding IS NOT NULL THEN 'Present' ELSE 'NULL' END as encoding,
  CASE WHEN photo_url IS NOT NULL THEN 'Present' ELSE 'NULL' END as photo,
  created_at
FROM known_faces
WHERE patient_id = '[your-patient-id]'
ORDER BY created_at DESC;
```

**Check Patient Data**:
```sql
SELECT * FROM patients WHERE profile_id = '[your-profile-id]';
```

**Check Device Links**:
```sql
SELECT 
  dl.*,
  p.full_name as patient_name,
  c.full_name as caregiver_name
FROM device_links dl
JOIN patients p ON p.id = dl.patient_id
JOIN caregivers c ON c.id = dl.caregiver_id
WHERE dl.is_active = true;
```

---

## 📞 Getting Help

### Before Contacting Support

1. **Check This Guide**: Review all relevant sections
2. **Check Console**: Note any error messages
3. **Try Solutions**: Attempt all suggested solutions
4. **Gather Information**:
   - Browser and version
   - Device and OS
   - Error messages
   - Steps to reproduce
   - Screenshots

### Information to Provide

**For Face Recognition Issues**:
- Console logs (copy/paste)
- Network tab screenshot
- Face detection status (models loaded?)
- Camera status (active?)
- Lighting conditions

**For AI Analysis Issues**:
- Console logs showing AI request/response
- Network tab showing Gemini API call
- Response status code
- Error message
- Image size

**For Contact Saving Issues**:
- Console logs showing save operation
- Database query results
- Face encoding status
- Photo URL status
- RLS policy check

---

## ✅ Quick Checklist

### Face Recognition Not Working

- [ ] Camera permissions allowed
- [ ] All 4 models loaded successfully
- [ ] Good lighting on face
- [ ] Face directly facing camera
- [ ] 1-3 feet from camera
- [ ] No obstructions (glasses, hat, mask)
- [ ] Internet connection active

### AI Analysis Not Working

- [ ] Internet connection active
- [ ] APP_ID set correctly in .env
- [ ] No rate limit errors in console
- [ ] Image size reasonable (<200KB)
- [ ] Gemini API status OK
- [ ] No 400/401/429/500 errors

### Contact Not Saving

- [ ] Patient profile exists
- [ ] Face descriptor captured (128 elements)
- [ ] Photo captured (base64 image)
- [ ] Name entered (required field)
- [ ] RLS policies allow INSERT
- [ ] No database errors in console

### Contact Not Displaying

- [ ] Navigate to Contacts page
- [ ] Refresh page if needed
- [ ] Check database has record
- [ ] Photo URL not NULL
- [ ] Face encoding not NULL
- [ ] RLS policies allow SELECT

---

**Version**: 5.1.0  
**Last Updated**: 2026-01-02  
**Support**: Check console logs first, then contact support with details
