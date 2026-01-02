-- ============================================================================
-- RemZy Complete Database Reset
-- This migration drops all existing tables and recreates everything from scratch
-- ============================================================================

-- Drop all existing tables (in correct order to respect foreign keys)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS ai_interactions CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS health_metrics CASCADE;
DROP TABLE IF EXISTS unknown_encounters CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS known_faces CASCADE;
DROP TABLE IF EXISTS device_links CASCADE;
DROP TABLE IF EXISTS caregivers CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop all existing functions
DROP FUNCTION IF EXISTS generate_linking_code() CASCADE;
DROP FUNCTION IF EXISTS is_patient_owner(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS caregiver_has_access(UUID, UUID) CASCADE;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$;

-- Function to generate unique linking code
CREATE OR REPLACE FUNCTION public.generate_linking_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to check if user owns patient record (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_patient_owner(patient_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM patients
    WHERE id = patient_id_param
    AND profile_id = auth.uid()
  );
END;
$$;

-- Function to check if caregiver has access to patient
CREATE OR REPLACE FUNCTION public.caregiver_has_access(caregiver_profile_id UUID, patient_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM device_links dl
    JOIN caregivers c ON c.id = dl.caregiver_id
    WHERE c.profile_id = caregiver_profile_id
    AND dl.patient_id = patient_id_param
    AND dl.is_active = true
  );
END;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table (base user table)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'caregiver', 'admin')),
  device_mode TEXT CHECK (device_mode IN ('patient', 'caregiver')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  device_id TEXT NOT NULL,
  linking_code TEXT UNIQUE NOT NULL,
  safe_area_lat DOUBLE PRECISION,
  safe_area_lng DOUBLE PRECISION,
  safe_area_radius INTEGER DEFAULT 500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Caregivers table
CREATE TABLE public.caregivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Device links table (connects patients and caregivers)
CREATE TABLE public.device_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(patient_id, caregiver_id)
);

-- Known faces table (people recognized by patient)
CREATE TABLE public.known_faces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  relationship TEXT,
  face_encoding TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unknown encounters table
CREATE TABLE public.unknown_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  photo_url TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  patient_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Health metrics table
CREATE TABLE public.health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  heart_rate INTEGER,
  steps INTEGER,
  inactivity_duration INTEGER,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('emergency', 'task_skipped', 'unknown_person', 'health_abnormal', 'safe_area_breach')),
  message TEXT NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI interactions table
CREATE TABLE public.ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_query TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  context_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE unknown_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins have full access to profiles"
ON profiles FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- ============================================================================
-- PATIENTS POLICIES
-- ============================================================================

CREATE POLICY "Patients can view their own data"
ON patients FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "Patients can insert their own data"
ON patients FOR INSERT
TO authenticated
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Patients can update their own data"
ON patients FOR UPDATE
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Caregivers can view linked patients"
ON patients FOR SELECT
TO authenticated
USING (caregiver_has_access(auth.uid(), id));

CREATE POLICY "Caregivers can update linked patients"
ON patients FOR UPDATE
TO authenticated
USING (caregiver_has_access(auth.uid(), id));

CREATE POLICY "Admins have full access to patients"
ON patients FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Allow authenticated users to find patients by linking code"
ON patients FOR SELECT
TO authenticated
USING (linking_code IS NOT NULL);

-- ============================================================================
-- CAREGIVERS POLICIES
-- ============================================================================

CREATE POLICY "Caregivers can view their own data"
ON caregivers FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "Caregivers can insert their own data"
ON caregivers FOR INSERT
TO authenticated
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Caregivers can update their own data"
ON caregivers FOR UPDATE
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Patients can view linked caregivers"
ON caregivers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM device_links dl
    JOIN patients p ON p.id = dl.patient_id
    WHERE dl.caregiver_id = caregivers.id
    AND p.profile_id = auth.uid()
    AND dl.is_active = true
  )
);

CREATE POLICY "Admins have full access to caregivers"
ON caregivers FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- ============================================================================
-- DEVICE LINKS POLICIES
-- ============================================================================

CREATE POLICY "Patients can view their device links"
ON device_links FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM patients p
    WHERE p.id = device_links.patient_id
    AND p.profile_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can view their device links"
ON device_links FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM caregivers c
    WHERE c.id = device_links.caregiver_id
    AND c.profile_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can create device links"
ON device_links FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM caregivers c
    WHERE c.id = device_links.caregiver_id
    AND c.profile_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can update their device links"
ON device_links FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM caregivers c
    WHERE c.id = device_links.caregiver_id
    AND c.profile_id = auth.uid()
  )
);

-- ============================================================================
-- KNOWN FACES POLICIES
-- ============================================================================

CREATE POLICY "Patients can manage their known faces"
ON known_faces FOR ALL
TO authenticated
USING (is_patient_owner(patient_id))
WITH CHECK (is_patient_owner(patient_id));

CREATE POLICY "Caregivers can view linked patient known faces"
ON known_faces FOR SELECT
TO authenticated
USING (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Caregivers can add known faces for linked patients"
ON known_faces FOR INSERT
TO authenticated
WITH CHECK (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Caregivers can update known faces for linked patients"
ON known_faces FOR UPDATE
TO authenticated
USING (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Caregivers can delete known faces for linked patients"
ON known_faces FOR DELETE
TO authenticated
USING (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Admins have full access to known_faces"
ON known_faces FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- ============================================================================
-- TASKS POLICIES
-- ============================================================================

CREATE POLICY "Patients can manage their tasks"
ON tasks FOR ALL
TO authenticated
USING (is_patient_owner(patient_id))
WITH CHECK (is_patient_owner(patient_id));

CREATE POLICY "Caregivers can view linked patient tasks"
ON tasks FOR SELECT
TO authenticated
USING (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Caregivers can create tasks for linked patients"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Caregivers can update tasks for linked patients"
ON tasks FOR UPDATE
TO authenticated
USING (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Caregivers can delete tasks for linked patients"
ON tasks FOR DELETE
TO authenticated
USING (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Admins have full access to tasks"
ON tasks FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- ============================================================================
-- UNKNOWN ENCOUNTERS POLICIES
-- ============================================================================

CREATE POLICY "Patients can manage their unknown encounters"
ON unknown_encounters FOR ALL
TO authenticated
USING (is_patient_owner(patient_id))
WITH CHECK (is_patient_owner(patient_id));

CREATE POLICY "Caregivers can view linked patient unknown encounters"
ON unknown_encounters FOR SELECT
TO authenticated
USING (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Admins have full access to unknown_encounters"
ON unknown_encounters FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- ============================================================================
-- HEALTH METRICS POLICIES
-- ============================================================================

CREATE POLICY "Patients can manage their health metrics"
ON health_metrics FOR ALL
TO authenticated
USING (is_patient_owner(patient_id))
WITH CHECK (is_patient_owner(patient_id));

CREATE POLICY "Caregivers can view linked patient health metrics"
ON health_metrics FOR SELECT
TO authenticated
USING (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Admins have full access to health_metrics"
ON health_metrics FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- ============================================================================
-- ALERTS POLICIES
-- ============================================================================

CREATE POLICY "Patients can view their alerts"
ON alerts FOR SELECT
TO authenticated
USING (is_patient_owner(patient_id));

CREATE POLICY "Patients can create their alerts"
ON alerts FOR INSERT
TO authenticated
WITH CHECK (is_patient_owner(patient_id));

CREATE POLICY "Caregivers can view linked patient alerts"
ON alerts FOR SELECT
TO authenticated
USING (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Caregivers can update linked patient alerts"
ON alerts FOR UPDATE
TO authenticated
USING (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Admins have full access to alerts"
ON alerts FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- ============================================================================
-- AI INTERACTIONS POLICIES
-- ============================================================================

CREATE POLICY "Patients can manage their AI interactions"
ON ai_interactions FOR ALL
TO authenticated
USING (is_patient_owner(patient_id))
WITH CHECK (is_patient_owner(patient_id));

CREATE POLICY "Caregivers can view linked patient AI interactions"
ON ai_interactions FOR SELECT
TO authenticated
USING (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Admins have full access to ai_interactions"
ON ai_interactions FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- ============================================================================
-- ACTIVITY LOGS POLICIES
-- ============================================================================

CREATE POLICY "Patients can view their activity logs"
ON activity_logs FOR SELECT
TO authenticated
USING (is_patient_owner(patient_id));

CREATE POLICY "Patients can create their activity logs"
ON activity_logs FOR INSERT
TO authenticated
WITH CHECK (is_patient_owner(patient_id));

CREATE POLICY "Caregivers can view linked patient activity logs"
ON activity_logs FOR SELECT
TO authenticated
USING (caregiver_has_access(auth.uid(), patient_id));

CREATE POLICY "Admins have full access to activity_logs"
ON activity_logs FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_patients_profile_id ON patients(profile_id);
CREATE INDEX idx_patients_linking_code ON patients(linking_code);
CREATE INDEX idx_caregivers_profile_id ON caregivers(profile_id);
CREATE INDEX idx_device_links_patient_id ON device_links(patient_id);
CREATE INDEX idx_device_links_caregiver_id ON device_links(caregiver_id);
CREATE INDEX idx_known_faces_patient_id ON known_faces(patient_id);
CREATE INDEX idx_tasks_patient_id ON tasks(patient_id);
CREATE INDEX idx_tasks_scheduled_time ON tasks(scheduled_time);
CREATE INDEX idx_unknown_encounters_patient_id ON unknown_encounters(patient_id);
CREATE INDEX idx_health_metrics_patient_id ON health_metrics(patient_id);
CREATE INDEX idx_alerts_patient_id ON alerts(patient_id);
CREATE INDEX idx_ai_interactions_patient_id ON ai_interactions(patient_id);
CREATE INDEX idx_activity_logs_patient_id ON activity_logs(patient_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'Base user profiles for all users (patients, caregivers, admins)';
COMMENT ON TABLE patients IS 'Patient-specific data including linking codes and safe areas';
COMMENT ON TABLE caregivers IS 'Caregiver-specific data';
COMMENT ON TABLE device_links IS 'Links between patients and caregivers for monitoring access';
COMMENT ON TABLE known_faces IS 'People recognized by the patient through face recognition';
COMMENT ON TABLE tasks IS 'Tasks and reminders for patients';
COMMENT ON TABLE unknown_encounters IS 'Encounters with unknown people detected by face recognition';
COMMENT ON TABLE health_metrics IS 'Health data from wearables or phone sensors';
COMMENT ON TABLE alerts IS 'Alerts sent to caregivers about patient activities';
COMMENT ON TABLE ai_interactions IS 'Conversations between patient and AI companion';
COMMENT ON TABLE activity_logs IS 'General activity logs for patients';

COMMENT ON FUNCTION generate_linking_code IS 'Generates a unique 8-character alphanumeric linking code for patient-caregiver pairing';
COMMENT ON FUNCTION is_patient_owner IS 'SECURITY DEFINER function to check if authenticated user owns the patient record';
COMMENT ON FUNCTION is_admin IS 'SECURITY DEFINER function to check if user has admin role';
COMMENT ON FUNCTION caregiver_has_access IS 'SECURITY DEFINER function to check if caregiver has access to patient through device link';