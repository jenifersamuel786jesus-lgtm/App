# RemZy - Developer Quick Reference

## 🚀 Quick Start

### Run Lint Check
```bash
cd /workspace/app-8g7cyjjxisxt
npm run lint
```

### Project Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── common/          # Common components (RouteGuard, PageMeta)
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── db/
│   ├── supabase.ts      # Supabase client
│   └── api.ts           # Database API functions
├── hooks/
│   ├── use-whisper.ts   # Bluetooth audio whisper
│   ├── use-task-reminders.ts  # Task reminder system
│   ├── use-supabase-upload.ts # Image upload
│   └── use-toast.tsx    # Toast notifications
├── pages/
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── patient/         # 8 patient pages
│   └── caregiver/       # 5 caregiver pages
├── types/
│   └── types.ts         # TypeScript types
├── routes.tsx           # Route configuration
└── App.tsx              # Main app component
```

## 🗄️ Database

### Tables (11 total)
1. **profiles** - User accounts
2. **patients** - Patient data
3. **caregivers** - Caregiver data
4. **device_links** - Patient-caregiver links
5. **tasks** - Patient tasks
6. **known_faces** - Face recognition data
7. **unknown_encounters** - Unknown person logs
8. **health_metrics** - Health data
9. **ai_interactions** - AI conversation logs
10. **activity_logs** - Activity tracking
11. **alerts** - Alert system

### Storage Buckets
- **app-8g7cyjjxisxt_face_photos** - Face photo storage

### Key Database Functions

```typescript
// Profile
getProfile(userId: string): Promise<Profile | null>
updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null>

// Patient
getPatientByProfileId(profileId: string): Promise<PatientWithProfile | null>
createPatient(patient: Partial<Patient>): Promise<Patient | null>
updatePatient(patientId: string, updates: Partial<Patient>): Promise<Patient | null>

// Caregiver
getCaregiverByProfileId(profileId: string): Promise<CaregiverWithProfile | null>
createCaregiver(caregiver: Partial<Caregiver>): Promise<Caregiver | null>

// Device Linking
findPatientByLinkingCode(code: string): Promise<Patient | null>
linkDevices(patientId: string, caregiverId: string): Promise<DeviceLink | null>
getLinkedPatients(caregiverId: string): Promise<PatientWithProfile[]>

// Tasks
getTasks(patientId: string): Promise<Task[]>
createTask(task: Partial<Task>): Promise<Task | null>
updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null>
deleteTask(taskId: string): Promise<boolean>

// Known Faces
getKnownFaces(patientId: string): Promise<KnownFace[]>
createKnownFace(face: Partial<KnownFace>): Promise<KnownFace | null>
updateKnownFace(faceId: string, updates: Partial<KnownFace>): Promise<KnownFace | null>
deleteKnownFace(faceId: string): Promise<boolean>

// Health Metrics
getHealthMetrics(patientId: string, limit?: number): Promise<HealthMetric[]>
createHealthMetric(metric: Partial<HealthMetric>): Promise<HealthMetric | null>

// Alerts
getCaregiverAlerts(caregiverId: string, limit?: number): Promise<AlertWithPatient[]>
createAlert(alert: Partial<Alert>): Promise<Alert | null>
updateAlert(alertId: string, updates: Partial<Alert>): Promise<Alert | null>

// Activity Logs
getActivityLogs(patientId: string, limit?: number): Promise<ActivityLog[]>
createActivityLog(log: Partial<ActivityLog>): Promise<ActivityLog | null>

// AI Interactions
getAIInteractions(patientId: string, limit?: number): Promise<AIInteraction[]>
createAIInteraction(interaction: Partial<AIInteraction>): Promise<AIInteraction | null>
```

## 🔐 Authentication

### Login Flow
```typescript
// Username + password (uses @miaoda.com domain internally)
const { error } = await signIn(username, password);
if (!error) {
  await refreshProfile();
  navigate('/mode-selection');
}
```

### Sign Up Flow
```typescript
const { error } = await signUp(username, password);
if (!error) {
  await refreshProfile();
  navigate('/mode-selection');
}
```

### Auth Context
```typescript
const { user, profile, loading, signIn, signUp, signOut, refreshProfile } = useAuth();
```

## 🎨 Design Tokens

### Colors (from index.css)
```css
/* Patient Mode - Calming Blues & Soft Greens */
--primary: 200 80% 45%;        /* Calming blue */
--secondary: 150 40% 55%;      /* Soft green */
--background: 200 30% 98%;     /* Light blue-gray */
--accent: 200 30% 90%;         /* Very light blue */

/* Special Colors */
--emergency: 0 85% 60%;        /* Red for emergency */
--success: 150 60% 45%;        /* Green for success */
--warning: 40 90% 55%;         /* Orange for warnings */
```

### Usage in Components
```tsx
// Use semantic tokens, never direct colors
<Button className="bg-primary text-primary-foreground">
<Card className="bg-card text-card-foreground">
<Badge className="bg-emergency text-emergency-foreground">
```

## 🔊 Bluetooth Whisper Audio

### Usage
```typescript
import { useWhisper } from '@/hooks/use-whisper';

const { whisper, isEnabled, setIsEnabled } = useWhisper();

// Whisper a message
whisper("Hello, this is a reminder");

// Toggle audio
setIsEnabled(!isEnabled);
```

### Features
- Text-to-speech via Web Speech API
- Bluetooth earphone output
- Queue management
- Volume control

## ⏰ Task Reminders

### Usage
```typescript
import { useTaskReminders } from '@/hooks/use-task-reminders';

useTaskReminders({ 
  tasks, 
  enabled: true,
  reminderMinutesBefore: 5 // Remind 5 minutes before
});
```

### Features
- Automatic reminders before task time
- Bluetooth whisper integration
- Configurable reminder timing

## 📸 Image Upload

### Usage
```typescript
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';

const { uploadFile, uploading, progress } = useSupabaseUpload({
  bucket: 'app-8g7cyjjxisxt_face_photos',
  maxSizeMB: 1,
  onSuccess: (url) => console.log('Uploaded:', url),
  onError: (error) => console.error('Error:', error)
});

// Upload file
await uploadFile(file);
```

### Features
- Automatic compression to 1MB
- WEBP conversion
- Progress tracking
- Error handling

## 🤖 Face Recognition

### Models Location
```
/public/models/
├── tiny_face_detector_model-weights_manifest.json
├── face_landmark_68_model-weights_manifest.json
├── face_recognition_model-weights_manifest.json
└── face_expression_model-weights_manifest.json
```

### Usage
```typescript
import * as faceapi from 'face-api.js';

// Load models
await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

// Detect faces
const detections = await faceapi
  .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
  .withFaceLandmarks()
  .withFaceDescriptors();
```

## 🛣️ Routes

### Public Routes
- `/login` - Login/signup page

### Protected Routes (require authentication)
- `/mode-selection` - Choose patient or caregiver mode

### Patient Routes
- `/patient/setup` - Initial patient setup
- `/patient/dashboard` - Patient dashboard
- `/patient/ai-companion` - AI companion chat
- `/patient/tasks` - Task management
- `/patient/contacts` - Known faces management
- `/patient/face-recognition` - Face recognition camera
- `/patient/health` - Health metrics
- `/patient/emergency` - Emergency button
- `/patient/settings` - Patient settings

### Caregiver Routes
- `/caregiver/setup` - Initial caregiver setup
- `/caregiver/dashboard` - Caregiver dashboard
- `/caregiver/patients` - Linked patients list
- `/caregiver/patient/:patientId` - Patient details
- `/caregiver/alerts` - Alert management

## 🔒 Security

### Row-Level Security (RLS)
All tables have RLS policies:
- Patients can access their own data
- Caregivers can access linked patients' data
- Admins have full access

### Authentication
- Username + password only
- No email verification
- Auto-profile creation on signup
- First user becomes admin

## 🧪 Testing

### Test User Creation
```typescript
// Create patient
1. Sign up: username="testpatient", password="password123"
2. Select "Patient Mode"
3. Enter name: "Test Patient"
4. Copy linking code (8 characters)
5. Complete setup

// Create caregiver
1. Sign up: username="testcaregiver", password="password123"
2. Select "Caregiver Mode"
3. Enter name: "Test Caregiver"
4. Enter patient's linking code
5. Complete setup
```

### Verify Linking
```sql
SELECT 
  p.full_name as patient_name,
  c.full_name as caregiver_name,
  dl.linked_at
FROM device_links dl
JOIN patients p ON p.id = dl.patient_id
JOIN caregivers c ON c.id = dl.caregiver_id;
```

## 📝 Common Tasks

### Add New Patient Feature
1. Update types in `src/types/types.ts`
2. Add database function in `src/db/api.ts`
3. Create/update page component
4. Add route in `src/routes.tsx`
5. Update navigation

### Add New Caregiver Feature
1. Follow same steps as patient feature
2. Ensure RLS policies allow caregiver access
3. Test with linked patient data

### Add New Alert Type
1. Update `AlertType` in `src/types/types.ts`
2. Add alert creation logic
3. Update caregiver alerts page
4. Test alert flow

## 🐛 Debugging

### Check Auth State
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### Check Profile
```typescript
const profile = await getProfile(user.id);
console.log('Profile:', profile);
```

### Check Database
```sql
-- Check user count
SELECT COUNT(*) FROM auth.users;

-- Check profiles
SELECT * FROM profiles;

-- Check patients
SELECT * FROM patients;

-- Check device links
SELECT * FROM device_links;
```

### Browser Console
- Open DevTools (F12)
- Check Console for errors
- Check Network tab for API calls
- Check Application > Local Storage for auth state

## 📦 Dependencies

### Key Libraries
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router 7** - Routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Supabase** - Backend
- **face-api.js** - Face recognition
- **qrcode** - QR generation
- **html5-qrcode** - QR scanning
- **lucide-react** - Icons
- **react-hook-form** - Forms
- **zod** - Validation

## 🎯 Best Practices

### Component Structure
```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getPatientByProfileId } from '@/db/api';
import type { Patient } from '@/types/types';

export default function MyPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    setLoading(true);
    const data = await getPatientByProfileId(profile.id);
    setPatient(data);
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        {/* Content */}
      </Card>
    </div>
  );
}
```

### Error Handling
```typescript
try {
  const result = await someAsyncFunction();
  if (!result) {
    toast({
      title: "Error",
      description: "Operation failed",
      variant: "destructive"
    });
    return;
  }
  // Success
} catch (error) {
  console.error('Error:', error);
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  });
}
```

### Type Safety
```typescript
// Always use types from types.ts
import type { Patient, Task, KnownFace } from '@/types/types';

// Use proper type annotations
const [patient, setPatient] = useState<Patient | null>(null);
const [tasks, setTasks] = useState<Task[]>([]);

// Use type guards
if (patient) {
  console.log(patient.full_name);
}
```

## 🔧 Maintenance

### Update Dependencies
```bash
# Check for updates
npm outdated

# Update specific package
npm install package-name@latest

# Update all (careful!)
npm update
```

### Database Migrations
```bash
# Migrations are in supabase/migrations/
# Apply via Supabase dashboard or CLI
```

### Backup Database
```sql
-- Export data
pg_dump -h db.supabase.co -U postgres -d postgres > backup.sql

-- Import data
psql -h db.supabase.co -U postgres -d postgres < backup.sql
```

## 📞 Support

### Common Issues

**Issue: Login not working**
- Check auth state in browser console
- Verify profile was created
- Check Supabase dashboard for user

**Issue: Face recognition not loading**
- Check /public/models/ directory
- Verify models are accessible
- Check browser console for errors

**Issue: Bluetooth audio not working**
- Check browser permissions
- Verify Bluetooth device connected
- Test with different browser

**Issue: Image upload failing**
- Check file size (max 1MB)
- Verify bucket exists
- Check storage policies

## 🎉 Success Indicators

Application is working correctly when:
- ✅ Users can sign up and log in
- ✅ Mode selection redirects properly
- ✅ Patient can complete setup and see linking code
- ✅ Caregiver can link to patient
- ✅ Face recognition loads models
- ✅ Tasks can be created and completed
- ✅ Alerts appear in caregiver dashboard
- ✅ All pages load without errors
- ✅ Lint passes with no errors

---

**Last Updated: 2025-12-24**
**Version: 1.0.0**
**Status: Production Ready**
