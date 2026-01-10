-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'caregiver')),
  device_mode TEXT CHECK (device_mode IN ('phone', 'tablet')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  linking_code TEXT UNIQUE,
  safe_area_latitude FLOAT,
  safe_area_longitude FLOAT,
  safe_area_radius FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create caregivers table
CREATE TABLE IF NOT EXISTS caregivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create device_links table
CREATE TABLE IF NOT EXISTS device_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(patient_id, caregiver_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles (owner access)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for patients (owner access)
CREATE POLICY "Patients can view their own data" ON patients
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Patients can update their own data" ON patients
  FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Patients can insert their own data" ON patients
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Create RLS policies for caregivers (owner access)
CREATE POLICY "Caregivers can view their own profile" ON caregivers
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Caregivers can update their own profile" ON caregivers
  FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Caregivers can insert their own profile" ON caregivers
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Create RLS policies for device_links
CREATE POLICY "Caregivers can view linked patients" ON device_links
  FOR SELECT USING (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE profile_id = auth.uid()
    )
  );
CREATE POLICY "Caregivers can create links" ON device_links
  FOR INSERT WITH CHECK (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE profile_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_patients_profile_id ON patients(profile_id);
CREATE INDEX idx_caregivers_profile_id ON caregivers(profile_id);
CREATE INDEX idx_device_links_caregiver_id ON device_links(caregiver_id);
CREATE INDEX idx_device_links_patient_id ON device_links(patient_id);
