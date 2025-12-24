-- Create user role enum
CREATE TYPE user_role AS ENUM ('patient', 'caregiver', 'admin');

-- Create task status enum
CREATE TYPE task_status AS ENUM ('pending', 'completed', 'skipped');

-- Create alert type enum
CREATE TYPE alert_type AS ENUM ('emergency', 'task_skipped', 'unknown_person', 'health_abnormal', 'safe_area_breach');

-- Create alert status enum
CREATE TYPE alert_status AS ENUM ('unread', 'read', 'resolved');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text,
  phone text,
  role user_role NOT NULL DEFAULT 'patient',
  device_mode text CHECK (device_mode IN ('patient', 'caregiver', 'unlocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date,
  safe_area_lat numeric,
  safe_area_lng numeric,
  safe_area_radius numeric DEFAULT 500,
  heart_rate_min integer DEFAULT 50,
  heart_rate_max integer DEFAULT 120,
  inactivity_threshold_hours integer DEFAULT 12,
  device_id text UNIQUE,
  linking_code text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create caregivers table
CREATE TABLE caregivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  device_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create device_links table (many-to-many relationship)
CREATE TABLE device_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  caregiver_id uuid REFERENCES caregivers(id) ON DELETE CASCADE,
  linked_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(patient_id, caregiver_id)
);

-- Create tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  task_name text NOT NULL,
  description text,
  scheduled_time timestamptz NOT NULL,
  location text,
  status task_status DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create known_faces table
CREATE TABLE known_faces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  person_name text NOT NULL,
  relationship text,
  notes text,
  face_encoding text,
  photo_url text,
  added_at timestamptz DEFAULT now(),
  last_seen timestamptz
);

-- Create unknown_encounters table
CREATE TABLE unknown_encounters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  encounter_time timestamptz DEFAULT now(),
  location_lat numeric,
  location_lng numeric,
  location_name text,
  snapshot_url text,
  patient_action text,
  saved_as_known boolean DEFAULT false,
  notes text
);

-- Create health_metrics table
CREATE TABLE health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  recorded_at timestamptz DEFAULT now(),
  heart_rate integer,
  steps integer,
  inactivity_duration_hours numeric,
  location_lat numeric,
  location_lng numeric,
  is_abnormal boolean DEFAULT false
);

-- Create ai_interactions table
CREATE TABLE ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  interaction_time timestamptz DEFAULT now(),
  user_query text,
  ai_response text,
  context_data jsonb,
  interaction_type text
);

-- Create activity_logs table
CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  log_time timestamptz DEFAULT now(),
  activity_type text NOT NULL,
  activity_description text,
  location_lat numeric,
  location_lng numeric,
  metadata jsonb
);

-- Create alerts table
CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  alert_status alert_status DEFAULT 'unread',
  title text NOT NULL,
  message text NOT NULL,
  location_lat numeric,
  location_lng numeric,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  resolved_at timestamptz
);

-- Create indexes for better query performance
CREATE INDEX idx_tasks_patient_id ON tasks(patient_id);
CREATE INDEX idx_tasks_scheduled_time ON tasks(scheduled_time);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_known_faces_patient_id ON known_faces(patient_id);
CREATE INDEX idx_unknown_encounters_patient_id ON unknown_encounters(patient_id);
CREATE INDEX idx_health_metrics_patient_id ON health_metrics(patient_id);
CREATE INDEX idx_health_metrics_recorded_at ON health_metrics(recorded_at);
CREATE INDEX idx_ai_interactions_patient_id ON ai_interactions(patient_id);
CREATE INDEX idx_activity_logs_patient_id ON activity_logs(patient_id);
CREATE INDEX idx_activity_logs_log_time ON activity_logs(log_time);
CREATE INDEX idx_alerts_patient_id ON alerts(patient_id);
CREATE INDEX idx_alerts_status ON alerts(alert_status);
CREATE INDEX idx_device_links_patient_id ON device_links(patient_id);
CREATE INDEX idx_device_links_caregiver_id ON device_links(caregiver_id);

-- Create function to generate unique linking code
CREATE OR REPLACE FUNCTION generate_linking_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  code_exists boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM patients WHERE linking_code = code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN code;
END;
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Extract username from email (format: username@miaoda.com)
  extracted_username := split_part(NEW.email, '@', 1);
  
  -- Insert profile
  INSERT INTO profiles (id, username, email, phone, role, device_mode)
  VALUES (
    NEW.id,
    extracted_username,
    NEW.email,
    NEW.phone,
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'patient'::user_role END,
    'unlocked'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Create helper function to check if user is patient
CREATE OR REPLACE FUNCTION is_patient(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'patient'::user_role
  );
$$;

-- Create helper function to check if user is caregiver
CREATE OR REPLACE FUNCTION is_caregiver(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'caregiver'::user_role
  );
$$;

-- Create helper function to check if caregiver has access to patient
CREATE OR REPLACE FUNCTION caregiver_has_access(caregiver_profile_id uuid, target_patient_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM device_links dl
    JOIN caregivers c ON c.id = dl.caregiver_id
    WHERE c.profile_id = caregiver_profile_id 
    AND dl.patient_id = target_patient_id
    AND dl.is_active = true
  );
$$;

-- Create public view for profiles
CREATE VIEW public_profiles AS
  SELECT id, username, role, device_mode FROM profiles;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE unknown_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Patients policies
CREATE POLICY "Admins have full access to patients" ON patients
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Patients can view their own data" ON patients
  FOR SELECT TO authenticated USING (
    profile_id = auth.uid()
  );

CREATE POLICY "Patients can update their own data" ON patients
  FOR UPDATE TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "Patients can insert their own data" ON patients
  FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Caregivers can view linked patients" ON patients
  FOR SELECT TO authenticated USING (
    caregiver_has_access(auth.uid(), id)
  );

-- Caregivers policies
CREATE POLICY "Admins have full access to caregivers" ON caregivers
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Caregivers can view their own data" ON caregivers
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "Caregivers can update their own data" ON caregivers
  FOR UPDATE TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "Caregivers can insert their own data" ON caregivers
  FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());

-- Device links policies
CREATE POLICY "Admins have full access to device_links" ON device_links
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Patients can view their links" ON device_links
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM patients WHERE id = patient_id AND profile_id = auth.uid())
  );

CREATE POLICY "Caregivers can view their links" ON device_links
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM caregivers WHERE id = caregiver_id AND profile_id = auth.uid())
  );

CREATE POLICY "Caregivers can create links" ON device_links
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM caregivers WHERE id = caregiver_id AND profile_id = auth.uid())
  );

-- Tasks policies
CREATE POLICY "Admins have full access to tasks" ON tasks
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Patients can manage their tasks" ON tasks
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM patients WHERE id = patient_id AND profile_id = auth.uid())
  );

CREATE POLICY "Caregivers can view linked patient tasks" ON tasks
  FOR SELECT TO authenticated USING (
    caregiver_has_access(auth.uid(), patient_id)
  );

-- Known faces policies
CREATE POLICY "Admins have full access to known_faces" ON known_faces
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Patients can manage their known faces" ON known_faces
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM patients WHERE id = patient_id AND profile_id = auth.uid())
  );

CREATE POLICY "Caregivers can view linked patient known faces" ON known_faces
  FOR SELECT TO authenticated USING (
    caregiver_has_access(auth.uid(), patient_id)
  );

-- Unknown encounters policies
CREATE POLICY "Admins have full access to unknown_encounters" ON unknown_encounters
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Patients can manage their encounters" ON unknown_encounters
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM patients WHERE id = patient_id AND profile_id = auth.uid())
  );

CREATE POLICY "Caregivers can view linked patient encounters" ON unknown_encounters
  FOR SELECT TO authenticated USING (
    caregiver_has_access(auth.uid(), patient_id)
  );

-- Health metrics policies
CREATE POLICY "Admins have full access to health_metrics" ON health_metrics
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Patients can manage their health metrics" ON health_metrics
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM patients WHERE id = patient_id AND profile_id = auth.uid())
  );

CREATE POLICY "Caregivers can view linked patient health metrics" ON health_metrics
  FOR SELECT TO authenticated USING (
    caregiver_has_access(auth.uid(), patient_id)
  );

-- AI interactions policies
CREATE POLICY "Admins have full access to ai_interactions" ON ai_interactions
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Patients can manage their AI interactions" ON ai_interactions
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM patients WHERE id = patient_id AND profile_id = auth.uid())
  );

CREATE POLICY "Caregivers can view linked patient AI interactions" ON ai_interactions
  FOR SELECT TO authenticated USING (
    caregiver_has_access(auth.uid(), patient_id)
  );

-- Activity logs policies
CREATE POLICY "Admins have full access to activity_logs" ON activity_logs
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Patients can manage their activity logs" ON activity_logs
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM patients WHERE id = patient_id AND profile_id = auth.uid())
  );

CREATE POLICY "Caregivers can view linked patient activity logs" ON activity_logs
  FOR SELECT TO authenticated USING (
    caregiver_has_access(auth.uid(), patient_id)
  );

-- Alerts policies
CREATE POLICY "Admins have full access to alerts" ON alerts
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Patients can view their alerts" ON alerts
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM patients WHERE id = patient_id AND profile_id = auth.uid())
  );

CREATE POLICY "Caregivers can view and manage linked patient alerts" ON alerts
  FOR ALL TO authenticated USING (
    caregiver_has_access(auth.uid(), patient_id)
  );