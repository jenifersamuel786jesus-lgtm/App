# Patient-Caregiver Linking Guide

## Overview
This guide explains how to properly link a patient device with a caregiver device in RemZy, and how to troubleshoot common linking issues.

## How Linking Works

### Architecture
1. **Patient Setup**: Patient completes setup and receives a unique 8-character linking code
2. **Code Sharing**: Patient shares the code with their caregiver (via QR code or manual entry)
3. **Caregiver Linking**: Caregiver enters the code during setup or later in the Manage Patients page
4. **Device Link Creation**: System creates a record in the `device_links` table connecting the two accounts

### Database Structure
```sql
CREATE TABLE device_links (
  id uuid PRIMARY KEY,
  patient_id uuid REFERENCES patients(id),
  caregiver_id uuid REFERENCES caregivers(id),
  linked_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(patient_id, caregiver_id)
);
```

## Step-by-Step Linking Process

### For Patients

#### Step 1: Complete Patient Setup
1. Log in to your account
2. Select "Patient Mode" from mode selection
3. Complete the setup wizard:
   - Enter your full name (required)
   - Enter date of birth (optional)
   - Set safe area location (optional)
4. Click "Complete Setup"

#### Step 2: Get Your Linking Code
After completing setup, you'll see:
- A QR code
- An 8-character linking code (e.g., "A1B2C3D4")

**Important**: Save this code! You'll need to share it with your caregiver.

#### Step 3: Share the Code
Share the linking code with your caregiver using one of these methods:
- Show them the QR code to scan
- Tell them the 8-character code
- Send them a photo of the code
- Write it down for them

### For Caregivers

#### Method 1: Link During Setup

1. Log in to your account
2. Select "Caregiver Mode" from mode selection
3. Complete the setup wizard:
   - Enter your full name (required)
   - Enter the patient's linking code (optional but recommended)
4. Click "Complete Setup"

If you entered a valid linking code, the patient will be automatically linked to your account.

#### Method 2: Link After Setup

1. Log in to your caregiver account
2. Go to "Caregiver Dashboard"
3. Click "Manage Patients"
4. Click "Link Patient" button
5. Enter the 8-character linking code
6. Click "Link Patient"

The patient will appear in your patients list immediately.

## Visual Guide

### Patient Setup - Final Step
```
┌─────────────────────────────────┐
│  Setup Complete!                │
├─────────────────────────────────┤
│  Share this QR code or linking  │
│  code with your caregiver       │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │    [QR CODE IMAGE]      │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Linking Code:                  │
│  A1B2C3D4                       │ ← Share this!
│                                 │
│  [Go to Dashboard]              │
└─────────────────────────────────┘
```

### Caregiver Setup - Linking Step
```
┌─────────────────────────────────┐
│  Link Patient (Optional)        │
├─────────────────────────────────┤
│  Enter the linking code from    │
│  the patient's device           │
│                                 │
│  Linking Code:                  │
│  [________]                     │ ← Enter code here
│                                 │
│  [Skip]  [Complete Setup]       │
└─────────────────────────────────┘
```

### Caregiver Manage Patients Page
```
┌─────────────────────────────────┐
│  ← Manage Patients  [Link +]   │
├─────────────────────────────────┤
│                                 │
│  No Patients Linked             │
│                                 │
│  Link a patient device to       │
│  start monitoring               │
│                                 │
│  [Link Your First Patient]      │
│                                 │
└─────────────────────────────────┘
```

## Troubleshooting

### Issue 1: "Invalid linking code" Error

**Symptoms**: Caregiver enters code but gets "Invalid linking code" error

**Possible Causes**:
1. Code was entered incorrectly
2. Patient hasn't completed setup yet
3. Code has expired or been regenerated

**Solutions**:
1. **Double-check the code**:
   - Codes are exactly 8 characters
   - Codes are case-insensitive (automatically converted to uppercase)
   - No spaces or special characters
   - Example: A1B2C3D4

2. **Verify patient setup is complete**:
   - Patient must complete ALL setup steps
   - Patient must see the "Setup Complete" screen with the code
   - Patient should be able to access their dashboard

3. **Get a fresh code**:
   - Patient can find their code in Settings
   - If code is not visible, patient may need to contact support

### Issue 2: "Patient already linked" Error

**Symptoms**: Caregiver tries to link but gets "already linked" error

**Possible Causes**:
1. Patient is already linked to this caregiver account
2. Trying to link the same patient twice

**Solutions**:
1. **Check existing patients**:
   - Go to "Manage Patients" page
   - Look for the patient in the list
   - If they're there, linking was successful

2. **If patient not visible**:
   - Refresh the page
   - Log out and log back in
   - Check database directly (for developers)

### Issue 3: Patient Not Appearing in Caregiver's List

**Symptoms**: Linking appears successful but patient doesn't show in list

**Possible Causes**:
1. Page needs refresh
2. Database query issue
3. RLS policy blocking access

**Solutions**:
1. **Refresh the page**:
   - Click browser refresh button
   - Or navigate away and back

2. **Log out and back in**:
   - Sometimes session needs refresh
   - Log out from caregiver account
   - Log back in
   - Check "Manage Patients" page

3. **Check database** (for developers):
   ```sql
   -- Check if link exists
   SELECT * FROM device_links 
   WHERE patient_id = 'patient-uuid' 
   AND caregiver_id = 'caregiver-uuid';
   
   -- Check if link is active
   SELECT * FROM device_links 
   WHERE is_active = true;
   ```

### Issue 4: Caregiver Can't See Patient Data

**Symptoms**: Patient is linked but caregiver can't see their data

**Possible Causes**:
1. RLS policies blocking access
2. Patient data not yet created
3. Link is inactive

**Solutions**:
1. **Verify link is active**:
   - Check `device_links` table
   - Ensure `is_active = true`

2. **Check RLS policies** (for developers):
   ```sql
   -- Test caregiver access to patient data
   SELECT * FROM patients 
   WHERE id IN (
     SELECT patient_id FROM device_links 
     WHERE caregiver_id = 'caregiver-uuid' 
     AND is_active = true
   );
   ```

3. **Verify patient has data**:
   - Patient should have completed setup
   - Patient record should exist in database
   - Patient should have profile_id set

### Issue 5: Multiple Caregivers Can't Link to Same Patient

**Symptoms**: Second caregiver can't link to patient

**Possible Causes**:
1. This is actually supported! Multiple caregivers can link to one patient
2. May be a different issue

**Solutions**:
1. **Verify it's not Issue 1 or 2**:
   - Check for "Invalid code" error (see Issue 1)
   - Check for "Already linked" error (see Issue 2)

2. **Each caregiver needs the same code**:
   - Patient's linking code works for multiple caregivers
   - Each caregiver enters the same code
   - System creates separate device_link records

## Database Verification (For Developers)

### Check Patient Record
```sql
SELECT id, profile_id, full_name, linking_code, created_at 
FROM patients 
WHERE linking_code = 'A1B2C3D4';
```

**Expected Result**: One row with patient data

### Check Caregiver Record
```sql
SELECT id, profile_id, full_name, created_at 
FROM caregivers 
WHERE profile_id = 'auth-user-id';
```

**Expected Result**: One row with caregiver data

### Check Device Link
```sql
SELECT 
  dl.id,
  dl.patient_id,
  dl.caregiver_id,
  dl.linked_at,
  dl.is_active,
  p.full_name as patient_name,
  c.full_name as caregiver_name
FROM device_links dl
JOIN patients p ON p.id = dl.patient_id
JOIN caregivers c ON c.id = dl.caregiver_id
WHERE dl.is_active = true;
```

**Expected Result**: One row per active link

### Check RLS Policies
```sql
-- Check if caregiver can see their links
SELECT * FROM device_links 
WHERE caregiver_id = 'caregiver-uuid';

-- Check if caregiver can see linked patients
SELECT p.* FROM patients p
WHERE p.id IN (
  SELECT patient_id FROM device_links 
  WHERE caregiver_id = 'caregiver-uuid' 
  AND is_active = true
);
```

## API Functions Reference

### Patient Side
```typescript
// Create patient with linking code
const patient = await createPatient({
  profile_id: profile.id,
  full_name: 'John Doe',
  // ... other fields
});
// patient.linking_code contains the 8-character code
```

### Caregiver Side
```typescript
// Find patient by linking code
const patient = await findPatientByLinkingCode('A1B2C3D4');

// Link devices
if (patient && caregiver) {
  await linkDevices(patient.id, caregiver.id);
}

// Get linked patients
const patients = await getLinkedPatients(caregiver.id);
```

## Common Mistakes

### ❌ Wrong: Entering Code with Spaces
```
A1B2 C3D4  ← Wrong!
```

### ✅ Correct: No Spaces
```
A1B2C3D4   ← Correct!
```

### ❌ Wrong: Lowercase Letters
```
a1b2c3d4   ← Works, but not standard
```

### ✅ Correct: Uppercase Letters
```
A1B2C3D4   ← Standard format
```

### ❌ Wrong: Including Dashes or Symbols
```
A1B2-C3D4  ← Wrong!
```

### ✅ Correct: Letters and Numbers Only
```
A1B2C3D4   ← Correct!
```

## Security Considerations

### Linking Code Security
- **Unique**: Each patient gets a unique code
- **Random**: Generated using MD5 hash of random data
- **Collision-free**: System checks for duplicates
- **Permanent**: Code doesn't expire (patient can reuse it)

### Access Control
- **RLS Policies**: Ensure caregivers only see their linked patients
- **Active Links**: Only `is_active = true` links grant access
- **Mutual Consent**: Patient must share code (implicit consent)

### Privacy
- **No Global Search**: Caregivers can't search for patients
- **Code Required**: Must have linking code to establish connection
- **Revocable**: Links can be deactivated (future feature)

## Testing the Linking Process

### Test Scenario 1: Basic Linking
1. Create patient account (email: patient@test.com)
2. Complete patient setup
3. Note the linking code (e.g., A1B2C3D4)
4. Create caregiver account (email: caregiver@test.com)
5. Complete caregiver setup with the linking code
6. Verify patient appears in caregiver's dashboard

### Test Scenario 2: Post-Setup Linking
1. Create patient account and complete setup
2. Create caregiver account and complete setup (skip linking)
3. Caregiver goes to "Manage Patients"
4. Caregiver clicks "Link Patient"
5. Caregiver enters patient's linking code
6. Verify patient appears in list

### Test Scenario 3: Multiple Caregivers
1. Create patient account and complete setup
2. Create first caregiver account
3. Link first caregiver to patient
4. Create second caregiver account
5. Link second caregiver to patient (same code)
6. Verify both caregivers see the patient

## FAQ

### Q: Can one patient have multiple caregivers?
**A**: Yes! Multiple caregivers can link to the same patient using the same linking code.

### Q: Can one caregiver have multiple patients?
**A**: Yes! Caregivers can link to multiple patients by entering each patient's unique linking code.

### Q: Does the linking code expire?
**A**: No, linking codes are permanent and can be reused.

### Q: Can I unlink a patient from a caregiver?
**A**: Not yet in the UI, but the database supports it via `is_active = false`.

### Q: What if I lose my linking code?
**A**: Patients can find their code in Settings (future feature) or contact support.

### Q: Can I change my linking code?
**A**: Not currently supported, but could be added as a feature.

### Q: Is the linking code case-sensitive?
**A**: No, codes are automatically converted to uppercase.

### Q: How long is the linking code?
**A**: Always exactly 8 characters (letters and numbers).

### Q: Can I link before the patient completes setup?
**A**: No, the patient must complete setup first to generate the linking code.

### Q: What happens if I enter the wrong code?
**A**: You'll get an "Invalid linking code" error. Double-check and try again.

## Support

If you're still experiencing issues after following this guide:

1. **Check the browser console** (F12) for error messages
2. **Verify database records** using the SQL queries above
3. **Check RLS policies** are correctly configured
4. **Review application logs** for backend errors
5. **Contact support** with:
   - Patient email
   - Caregiver email
   - Linking code
   - Error messages
   - Steps to reproduce

---

**Last Updated**: 2025-12-24
**Version**: 1.0.0
