# Caregiver Profile Creation Troubleshooting Guide

**Date**: 2026-01-02  
**Issue**: "Failed to create caregiver profile. Please check your connection and try again."  
**Status**: ✅ Enhanced logging added for diagnosis

---

## 🔍 Problem Description

**User Report**: "Failed to create caregiver profile. Please check your connection and try again."

**Error Location**: CaregiverSetupPage.tsx, line 101

**When It Happens**: When user tries to complete caregiver setup and `createCaregiver` returns `null`

---

## 🎯 Root Causes Identified

### 1. **Unique Constraint Violation** (Most Likely)

**Constraint**: `caregivers_profile_id_key` - Each profile can only have ONE caregiver record

**Scenario**:
- User creates caregiver profile successfully
- User refreshes page or navigates back
- User tries to create caregiver profile again
- Database rejects with unique constraint violation
- `createCaregiver` returns `null`
- User sees error message

**Database Constraint**:
```sql
UNIQUE (profile_id)
```

**Error Code**: `23505`

**Solution**: Check if caregiver already exists before creating

### 2. **RLS Policy Blocking INSERT**

**Policy**: "Caregivers can insert their own data"

**Condition**: `(profile_id = auth.uid())`

**Scenario**:
- User's `auth.uid()` doesn't match `profile_id` being inserted
- RLS policy blocks the INSERT
- `createCaregiver` returns `null`

**Error Code**: `42501`

**Solution**: Verify user is authenticated and profile_id matches auth.uid()

### 3. **Foreign Key Violation**

**Constraint**: `caregivers_profile_id_fkey` - Profile must exist

**Scenario**:
- Profile doesn't exist in profiles table
- Foreign key constraint blocks INSERT
- `createCaregiver` returns `null`

**Error Code**: `23503`

**Solution**: Ensure profile is created before caregiver

---

## 🔧 Solutions Implemented

### 1. Enhanced Logging in createCaregiver

**Added Comprehensive Logging**:

```typescript
export const createCaregiver = async (caregiver: Partial<Caregiver>): Promise<Caregiver | null> => {
  console.log('👤 createCaregiver called');
  console.log('Caregiver data:', {
    profile_id: caregiver.profile_id,
    full_name: caregiver.full_name,
    device_id: caregiver.device_id,
  });
  
  // Check current auth status
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current auth user:', user?.id);
  console.log('Profile ID matches auth?', user?.id === caregiver.profile_id);
  
  const { data, error } = await supabase
    .from('caregivers')
    .insert(caregiver)
    .select()
    .maybeSingle();

  if (error) {
    console.error('❌ Error creating caregiver:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    
    // Provide specific error messages
    if (error.code === '23505') {
      console.error('🚫 UNIQUE CONSTRAINT VIOLATION: A caregiver profile already exists for this user');
    } else if (error.code === '42501') {
      console.error('🚫 RLS POLICY VIOLATION: User not authorized to create caregiver record');
    } else if (error.code === '23503') {
      console.error('🚫 FOREIGN KEY VIOLATION: Profile does not exist');
    }
    
    return null;
  }
  
  console.log('✅ Caregiver created successfully:', {
    id: data?.id,
    full_name: data?.full_name,
    profile_id: data?.profile_id,
  });
  
  return data;
};
```

**Benefits**:
- ✅ Shows function called indicator
- ✅ Logs caregiver data (profile_id, full_name, device_id)
- ✅ Checks and logs current auth user
- ✅ Verifies profile_id matches auth.uid()
- ✅ Logs detailed error information
- ✅ Provides specific error messages for common issues
- ✅ Helps diagnose unique constraint, RLS, and foreign key violations

### 2. Enhanced Logging in getCaregiverByProfileId

**Added Comprehensive Logging**:

```typescript
export const getCaregiverByProfileId = async (profileId: string): Promise<CaregiverWithProfile | null> => {
  console.log('🔍 getCaregiverByProfileId called');
  console.log('Looking for caregiver with profile_id:', profileId);
  
  const { data, error } = await supabase
    .from('caregivers')
    .select('*, profile:profiles!caregivers_profile_id_fkey(*)')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    console.error('❌ Error fetching caregiver:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
    });
    return null;
  }
  
  if (data) {
    console.log('✅ Caregiver found:', {
      id: data.id,
      full_name: data.full_name,
      profile_id: data.profile_id,
    });
  } else {
    console.log('ℹ️ No caregiver found for profile_id:', profileId);
  }
  
  return data;
};
```

**Benefits**:
- ✅ Shows function called indicator
- ✅ Logs profile_id being searched
- ✅ Logs whether caregiver was found or not
- ✅ Logs caregiver details if found
- ✅ Helps diagnose why existing caregiver check might fail

---

## 🧪 Testing & Diagnosis

### Test 1: Check Console Logs

**Open Browser DevTools** (F12) → Console tab

**Expected Logs for Successful Creation**:
```
🔍 getCaregiverByProfileId called
Looking for caregiver with profile_id: abc-123-...
ℹ️ No caregiver found for profile_id: abc-123-...

👤 createCaregiver called
Caregiver data: {
  profile_id: "abc-123-...",
  full_name: "John Doe",
  device_id: "xyz-789-..."
}
Current auth user: abc-123-...
Profile ID matches auth? true

✅ Caregiver created successfully: {
  id: "def-456-...",
  full_name: "John Doe",
  profile_id: "abc-123-..."
}
```

**Expected Logs for Unique Constraint Violation**:
```
🔍 getCaregiverByProfileId called
Looking for caregiver with profile_id: abc-123-...
✅ Caregiver found: {
  id: "def-456-...",
  full_name: "John Doe",
  profile_id: "abc-123-..."
}

[User should be redirected to dashboard, but if not...]

👤 createCaregiver called
Caregiver data: {
  profile_id: "abc-123-...",
  full_name: "John Doe",
  device_id: "xyz-789-..."
}
Current auth user: abc-123-...
Profile ID matches auth? true

❌ Error creating caregiver: {...}
Error details: {
  message: "duplicate key value violates unique constraint \"caregivers_profile_id_key\"",
  code: "23505",
  ...
}
🚫 UNIQUE CONSTRAINT VIOLATION: A caregiver profile already exists for this user
```

**Expected Logs for RLS Policy Violation**:
```
👤 createCaregiver called
Caregiver data: {
  profile_id: "abc-123-...",
  full_name: "John Doe",
  device_id: "xyz-789-..."
}
Current auth user: xyz-999-...
Profile ID matches auth? false

❌ Error creating caregiver: {...}
Error details: {
  message: "new row violates row-level security policy for table \"caregivers\"",
  code: "42501",
  ...
}
🚫 RLS POLICY VIOLATION: User not authorized to create caregiver record
```

### Test 2: Check Database Directly

**Query to check if caregiver exists**:
```sql
SELECT 
  c.id,
  c.full_name,
  c.profile_id,
  p.username,
  p.email
FROM caregivers c
LEFT JOIN profiles p ON c.profile_id = p.id
WHERE c.profile_id = '[user-profile-id]';
```

**If caregiver exists**: User should be redirected to dashboard, not shown setup page

**If caregiver doesn't exist**: User should be able to create caregiver

### Test 3: Verify RLS Policies

**Query to check caregivers RLS policies**:
```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'caregivers'
ORDER BY cmd, policyname;
```

**Expected Policies**:
1. ✅ Admins have full access to caregivers (ALL)
2. ✅ Caregivers can view their own data (SELECT)
3. ✅ Caregivers can insert their own data (INSERT)
4. ✅ Caregivers can update their own data (UPDATE)
5. ✅ Patients can view linked caregivers (SELECT)

### Test 4: Verify User Authentication

**Check if user is authenticated**:
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

**Expected**: User object with `id` field

**If null**: User is not authenticated, need to sign in

---

## 🔍 Troubleshooting Steps

### Issue 1: Unique Constraint Violation

**Symptoms**:
- Error code: `23505`
- Console: "🚫 UNIQUE CONSTRAINT VIOLATION: A caregiver profile already exists for this user"
- User has already created caregiver profile

**Root Cause**:
- `getCaregiverByProfileId` check failed (RLS blocking SELECT)
- User tried to create caregiver again
- Database rejected due to unique constraint on `profile_id`

**Solutions**:

**Solution 1: Fix RLS Policy for SELECT**
```sql
-- Verify SELECT policy exists
SELECT * FROM pg_policies
WHERE tablename = 'caregivers'
AND cmd = 'SELECT'
AND policyname = 'Caregivers can view their own data';

-- If missing, create it
CREATE POLICY "Caregivers can view their own data"
ON caregivers
FOR SELECT
TO authenticated
USING (profile_id = auth.uid());
```

**Solution 2: Manually Redirect User**
- User already has caregiver profile
- Navigate to `/caregiver/dashboard` manually
- Or delete existing caregiver record and recreate

**Solution 3: Check Database**
```sql
-- Find existing caregiver
SELECT * FROM caregivers
WHERE profile_id = '[user-profile-id]';

-- If found, user should be redirected to dashboard
-- If not needed, delete it
DELETE FROM caregivers
WHERE profile_id = '[user-profile-id]';
```

### Issue 2: RLS Policy Violation

**Symptoms**:
- Error code: `42501`
- Console: "🚫 RLS POLICY VIOLATION: User not authorized to create caregiver record"
- Console: "Profile ID matches auth? false"

**Root Cause**:
- User's `auth.uid()` doesn't match `profile_id` being inserted
- RLS policy blocks INSERT

**Solutions**:

**Solution 1: Verify User is Authenticated**
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user?.id);
```

**Solution 2: Verify Profile ID Matches**
```javascript
console.log('Profile ID:', profile.id);
console.log('Auth UID:', user?.id);
console.log('Match?', profile.id === user?.id);
```

**Solution 3: Check RLS Policy**
```sql
SELECT * FROM pg_policies
WHERE tablename = 'caregivers'
AND cmd = 'INSERT';

-- Expected: with_check = "(profile_id = auth.uid())"
```

### Issue 3: Foreign Key Violation

**Symptoms**:
- Error code: `23503`
- Console: "🚫 FOREIGN KEY VIOLATION: Profile does not exist"

**Root Cause**:
- Profile record doesn't exist in profiles table
- Foreign key constraint blocks INSERT

**Solutions**:

**Solution 1: Verify Profile Exists**
```sql
SELECT * FROM profiles
WHERE id = '[user-profile-id]';
```

**Solution 2: Create Profile if Missing**
```sql
-- Check if profile creation trigger exists
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- If trigger exists but profile missing, manually create
INSERT INTO profiles (id, username, email, role)
VALUES (
  '[user-auth-id]',
  '[username]',
  '[email]',
  'patient'
);
```

**Solution 3: Check Profile Creation Trigger**
```sql
-- Verify trigger function
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'handle_new_user';
```

---

## ✅ Success Indicators

### Caregiver Creation Success

✅ Console: "🔍 getCaregiverByProfileId called"  
✅ Console: "ℹ️ No caregiver found for profile_id: ..."  
✅ Console: "👤 createCaregiver called"  
✅ Console: "Current auth user: [user-id]"  
✅ Console: "Profile ID matches auth? true"  
✅ Console: "✅ Caregiver created successfully"  
✅ User redirected to `/caregiver/dashboard`  
✅ No error messages  

### Caregiver Already Exists

✅ Console: "🔍 getCaregiverByProfileId called"  
✅ Console: "✅ Caregiver found: {id, full_name, profile_id}"  
✅ User redirected to `/caregiver/dashboard` immediately  
✅ `createCaregiver` NOT called  
✅ No error messages  

---

## 📊 Database Constraints Summary

### Caregivers Table Constraints

1. **Primary Key**: `caregivers_pkey` on `id`
2. **Unique Constraint**: `caregivers_profile_id_key` on `profile_id` ⚠️
3. **Unique Constraint**: `caregivers_device_id_key` on `device_id`
4. **Foreign Key**: `caregivers_profile_id_fkey` references `profiles(id)` ON DELETE CASCADE

**Critical**: Each profile can only have ONE caregiver record due to unique constraint on `profile_id`

---

## 🔐 RLS Policies Summary

### Caregivers Table Policies

1. ✅ **Admins have full access to caregivers** (ALL)
   - `is_admin(auth.uid())`

2. ✅ **Caregivers can view their own data** (SELECT)
   - `(profile_id = auth.uid())`

3. ✅ **Caregivers can insert their own data** (INSERT)
   - WITH CHECK: `(profile_id = auth.uid())`

4. ✅ **Caregivers can update their own data** (UPDATE)
   - `(profile_id = auth.uid())`

5. ✅ **Patients can view linked caregivers** (SELECT)
   - Complex EXISTS query checking device_links

---

## 📝 Summary

**Problem**: Caregiver profile creation failing with generic error message

**Root Causes**:
1. ❌ Unique constraint violation (caregiver already exists)
2. ❌ RLS policy blocking INSERT (auth mismatch)
3. ❌ Foreign key violation (profile doesn't exist)

**Solutions Implemented**:
1. ✅ Enhanced logging in `createCaregiver` function
2. ✅ Enhanced logging in `getCaregiverByProfileId` function
3. ✅ Specific error messages for common issues
4. ✅ Auth status verification
5. ✅ Profile ID match verification

**Impact**:
- ✅ Easy to diagnose caregiver creation failures
- ✅ Specific error messages for each scenario
- ✅ Complete visibility into creation pipeline
- ✅ Helps identify RLS policy issues
- ✅ Helps identify unique constraint violations
- ✅ Helps identify foreign key violations

**Next Steps**:
1. User should check browser console logs
2. Identify specific error code (23505, 42501, 23503)
3. Follow troubleshooting steps for that error
4. If caregiver already exists, navigate to dashboard
5. If RLS blocking, verify authentication
6. If profile missing, check profile creation trigger

---

**Version**: 3.8.2  
**Last Updated**: 2026-01-02
