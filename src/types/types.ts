// Database types matching Supabase schema

export type UserRole = 'patient' | 'caregiver' | 'admin';
export type DeviceMode = 'patient' | 'caregiver' | 'unlocked';
export type TaskStatus = 'pending' | 'completed' | 'skipped';
export type AlertType = 'emergency' | 'task_skipped' | 'unknown_person' | 'health_abnormal' | 'safe_area_breach';
export type AlertStatus = 'unread' | 'read' | 'resolved';

export interface Profile {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  device_mode: DeviceMode | null;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  profile_id: string;
  full_name: string;
  date_of_birth: string | null;
  device_id: string;
  linking_code: string;
  safe_area_lat: number | null;
  safe_area_lng: number | null;
  safe_area_radius: number | null;
  created_at: string;
  updated_at: string;
}

export interface Caregiver {
  id: string;
  profile_id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeviceLink {
  id: string;
  patient_id: string;
  caregiver_id: string;
  linked_at: string;
  is_active: boolean;
}

export interface Task {
  id: string;
  patient_id: string;
  task_name: string;
  description: string | null;
  scheduled_time: string;
  location: string | null;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnownFace {
  id: string;
  patient_id: string;
  person_name: string;
  relationship: string | null;
  face_encoding: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnknownEncounter {
  id: string;
  patient_id: string;
  encounter_time: string;
  location_lat: number | null;
  location_lng: number | null;
  location_name: string | null;
  snapshot_url: string | null;
  patient_action: string | null;
  saved_as_known: boolean;
  notes: string | null;
}

export interface HealthMetric {
  id: string;
  patient_id: string;
  recorded_at: string;
  heart_rate: number | null;
  steps: number | null;
  inactivity_duration_hours: number | null;
  location_lat: number | null;
  location_lng: number | null;
  is_abnormal: boolean;
}

export interface AIInteraction {
  id: string;
  patient_id: string;
  interaction_time: string;
  user_query: string | null;
  ai_response: string | null;
  context_data: Record<string, unknown> | null;
  interaction_type: string | null;
}

export interface ActivityLog {
  id: string;
  patient_id: string;
  log_time: string;
  activity_type: string;
  activity_description: string | null;
  location_lat: number | null;
  location_lng: number | null;
  metadata: Record<string, unknown> | null;
}

export interface Alert {
  id: string;
  patient_id: string;
  alert_type: AlertType;
  alert_status: AlertStatus;
  title: string;
  message: string;
  location_lat: number | null;
  location_lng: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  read_at: string | null;
  resolved_at: string | null;
}

// Extended types with relations
export interface PatientWithProfile extends Patient {
  profile?: Profile;
}

export interface CaregiverWithProfile extends Caregiver {
  profile?: Profile;
}

export interface DeviceLinkWithDetails extends DeviceLink {
  patient?: PatientWithProfile;
  caregiver?: CaregiverWithProfile;
}

export interface AlertWithPatient extends Alert {
  patient?: PatientWithProfile;
}
