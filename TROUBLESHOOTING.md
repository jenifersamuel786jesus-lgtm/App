# RemZy - Troubleshooting Guide

## Common Issues and Solutions

### Issue: Caregiver Dashboard Not Accessible

**Symptoms:**
- After completing caregiver setup, user is not redirected to dashboard
- User is stuck in a redirect loop between setup and dashboard
- Dashboard shows loading spinner indefinitely

**Root Causes:**
1. Caregiver record not created in database
2. Profile device_mode not set correctly
3. Database transaction not completed before redirect
4. RLS policy preventing access

**Solutions:**

#### Step 1: Check Browser Console
Open browser DevTools (F12) and check Console tab for error messages:
- Look for "❌" emoji messages indicating errors
- Check for "No caregiver record found" message
- Verify "Caregiver found" message appears

#### Step 2: Verify Database State
Run this SQL query in Supabase dashboard:
```sql
-- Check if caregiver record exists
SELECT 
  p.id,
  p.username,
  p.role,
  p.device_mode,
  c.id as caregiver_id,
  c.full_name
FROM profiles p
LEFT JOIN caregivers c ON c.profile_id = p.id
WHERE p.username = 'YOUR_USERNAME';
```

Expected result:
- `role` should be 'caregiver'
- `device_mode` should be 'caregiver'
- `caregiver_id` should NOT be null
- `full_name` should be populated

#### Step 3: If Caregiver Record Missing
If the query shows `caregiver_id` is null:

**Option A: Complete Setup Again**
1. Log out
2. Log in
3. You'll be redirected to mode selection
4. Select "Caregiver Mode"
5. Complete setup with full name

**Option B: Manually Create Record**
Run this SQL in Supabase dashboard:
```sql
-- Replace YOUR_PROFILE_ID with actual profile ID from Step 2
INSERT INTO caregivers (profile_id, full_name, phone)
VALUES ('YOUR_PROFILE_ID', 'Your Full Name', NULL);

-- Update profile
UPDATE profiles 
SET role = 'caregiver', device_mode = 'caregiver'
WHERE id = 'YOUR_PROFILE_ID';
```

#### Step 4: If device_mode is Wrong
If `device_mode` is null or 'patient':
```sql
UPDATE profiles 
SET device_mode = 'caregiver'
WHERE id = 'YOUR_PROFILE_ID';
```

Then:
1. Refresh the page
2. You should be redirected to caregiver dashboard

#### Step 5: Clear Browser Cache
Sometimes cached data causes issues:
1. Open DevTools (F12)
2. Go to Application tab
3. Clear Storage > Clear site data
4. Refresh page
5. Log in again

#### Step 6: Check RLS Policies
Verify RLS policies allow caregiver access:
```sql
-- Check if policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'caregivers';
```

Should show policies like:
- "Users can view their own caregiver profile"
- "Users can insert their own caregiver profile"

### Issue: Patient Dashboard Not Accessible

**Symptoms:**
- After completing patient setup, not redirected to dashboard
- Stuck in redirect loop

**Solutions:**

Follow same steps as caregiver, but check `patients` table instead:
```sql
SELECT 
  p.id,
  p.username,
  p.role,
  p.device_mode,
  pt.id as patient_id,
  pt.full_name,
  pt.linking_code
FROM profiles p
LEFT JOIN patients pt ON pt.profile_id = p.id
WHERE p.username = 'YOUR_USERNAME';
```

Expected:
- `role` = 'patient'
- `device_mode` = 'patient'
- `patient_id` NOT null
- `linking_code` should be 8 characters

### Issue: Device Linking Not Working

**Symptoms:**
- Caregiver enters linking code but gets "Invalid code" error
- QR scan doesn't populate linking code

**Solutions:**

#### Step 1: Verify Patient Linking Code
```sql
SELECT id, full_name, linking_code 
FROM patients 
WHERE linking_code = 'YOUR_CODE';
```

If no results:
- Patient hasn't completed setup
- Code is incorrect (check for typos)
- Code is case-sensitive (should be uppercase)

#### Step 2: Verify Code Format
Linking codes must be:
- Exactly 8 characters
- Uppercase letters and numbers only
- No spaces or special characters

#### Step 3: Check Device Link
After successful linking:
```sql
SELECT 
  dl.id,
  p.full_name as patient_name,
  c.full_name as caregiver_name,
  dl.linked_at,
  dl.is_active
FROM device_links dl
JOIN patients p ON p.id = dl.patient_id
JOIN caregivers c ON c.id = dl.caregiver_id
WHERE c.profile_id = 'YOUR_PROFILE_ID';
```

Should show link with `is_active` = true

### Issue: Face Recognition Not Working

**Symptoms:**
- Camera doesn't start
- Models don't load
- No face detection

**Solutions:**

#### Step 1: Check Camera Permission
1. Browser should prompt for camera permission
2. Click "Allow"
3. If denied, go to browser settings and enable camera for this site

#### Step 2: Verify Models Exist
Check that these files exist in `/public/models/`:
- `tiny_face_detector_model-weights_manifest.json`
- `face_landmark_68_model-weights_manifest.json`
- `face_recognition_model-weights_manifest.json`

#### Step 3: Check Console for Model Loading
Look for messages like:
- "Loading Tiny Face Detector..."
- "✅ Tiny Face Detector loaded successfully"

If models fail to load:
- Check internet connection
- Try refreshing page
- Clear browser cache

#### Step 4: Check Lighting
Face recognition requires:
- Good lighting (not too dark)
- Face clearly visible
- Looking at camera

### Issue: Bluetooth Audio Not Working

**Symptoms:**
- No whisper audio heard
- Audio toggle doesn't work

**Solutions:**

#### Step 1: Check Browser Support
Web Speech API support varies:
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ⚠️ Safari: Limited support
- ❌ iOS Safari: Not supported

#### Step 2: Check Audio Toggle
- Look for speaker icon in dashboard
- Ensure it's not muted (should show Volume2 icon, not VolumeX)
- Click to toggle on if needed

#### Step 3: Test Audio
Open browser console and run:
```javascript
const utterance = new SpeechSynthesisUtterance("Test message");
window.speechSynthesis.speak(utterance);
```

If you hear audio, the system works.

#### Step 4: Check Bluetooth Connection
- Ensure Bluetooth device is paired
- Check device is selected as audio output
- Try disconnecting and reconnecting

### Issue: Login Loop

**Symptoms:**
- After login, redirected back to login page
- Can't access any pages

**Solutions:**

#### Step 1: Check Profile Creation
```sql
SELECT * FROM profiles WHERE username = 'YOUR_USERNAME';
```

If no profile exists:
- Auto-profile trigger may have failed
- Try signing up again with different username

#### Step 2: Check Auth State
Open browser console and run:
```javascript
// Check if user is authenticated
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

If user is null:
- Session expired
- Log in again

#### Step 3: Clear Auth State
1. Log out
2. Clear browser cache
3. Close all tabs
4. Open new tab
5. Log in again

### Issue: Mode Selection Not Redirecting

**Symptoms:**
- After selecting mode, nothing happens
- Stuck on mode selection page

**Solutions:**

#### Step 1: Check Console for Errors
Look for JavaScript errors in console

#### Step 2: Verify Profile Exists
```sql
SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';
```

#### Step 3: Try Other Mode
- If patient mode doesn't work, try caregiver mode
- If caregiver mode doesn't work, try patient mode

#### Step 4: Manual Navigation
After selecting mode, manually navigate:
- Patient: `/patient/setup`
- Caregiver: `/caregiver/setup`

### General Debugging Steps

#### Enable Verbose Logging
All pages have console.log statements. Check browser console for:
- 📥 Data loading messages
- ✅ Success messages
- ❌ Error messages
- ⚠️ Warning messages

#### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for failed requests (red)
5. Check response for error details

#### Verify Supabase Connection
```javascript
// Test connection
const { data, error } = await supabase.from('profiles').select('count');
console.log('Connection test:', { data, error });
```

Should return count without error.

#### Check RLS Policies
If getting "permission denied" errors:
```sql
-- Disable RLS temporarily for testing (NOT for production!)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers DISABLE ROW LEVEL SECURITY;
```

If this fixes the issue, RLS policies need adjustment.

Re-enable after testing:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
```

### Getting Help

If none of these solutions work:

1. **Collect Information:**
   - Browser console logs
   - Network tab errors
   - Database query results
   - Steps to reproduce

2. **Check Documentation:**
   - APPLICATION_GUIDE.md
   - DEVELOPER_GUIDE.md
   - DEPLOYMENT_CHECKLIST.md

3. **Database Backup:**
   Before making changes, backup data:
   ```sql
   -- Export specific user data
   SELECT * FROM profiles WHERE id = 'YOUR_ID';
   SELECT * FROM patients WHERE profile_id = 'YOUR_ID';
   SELECT * FROM caregivers WHERE profile_id = 'YOUR_ID';
   ```

4. **Fresh Start:**
   As last resort, create new account:
   - Sign up with different username
   - Complete setup
   - Test functionality

### Prevention Tips

1. **Always Complete Setup:**
   - Don't skip required fields
   - Wait for confirmation messages
   - Don't navigate away during setup

2. **Check Console Regularly:**
   - Keep DevTools open during testing
   - Watch for error messages
   - Report issues immediately

3. **Test in Stages:**
   - Test login first
   - Then mode selection
   - Then setup
   - Then dashboard
   - Then features

4. **Use Supported Browsers:**
   - Chrome/Edge (recommended)
   - Firefox (recommended)
   - Safari (limited features)
   - Avoid IE/old browsers

5. **Maintain Good Connection:**
   - Stable internet required
   - Don't use on slow connections
   - Wait for operations to complete

---

**Last Updated: 2025-12-24**
**Version: 1.0.0**
