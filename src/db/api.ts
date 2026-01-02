import { supabase } from './supabase';
import type {
  Profile,
  Patient,
  Caregiver,
  DeviceLink,
  Task,
  KnownFace,
  UnknownEncounter,
  HealthMetric,
  AIInteraction,
  ActivityLog,
  Alert,
  PatientWithProfile,
  CaregiverWithProfile,
  DeviceLinkWithDetails,
  AlertWithPatient,
} from '@/types/types';

// Profile operations
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data;
};

// Patient operations
export const getPatientByProfileId = async (profileId: string): Promise<PatientWithProfile | null> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*, profile:profiles!patients_profile_id_fkey(*)')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
  return data;
};

export const getPatient = async (patientId: string): Promise<Patient | null> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
  return data;
};

export const createPatient = async (patient: Partial<Patient>): Promise<Patient | null> => {
  console.log('👤 createPatient called');
  console.log('Patient data:', {
    profile_id: patient.profile_id,
    full_name: patient.full_name,
    device_id: patient.device_id,
  });
  
  // Check current auth status
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current auth user:', user?.id);
  console.log('Profile ID matches auth?', user?.id === patient.profile_id);
  
  // Generate linking code (8-character uppercase alphanumeric)
  const { data: linkingCode, error: codeError } = await supabase.rpc('generate_linking_code');
  
  if (codeError) {
    console.error('❌ Error generating linking code:', codeError);
    return null;
  }
  
  console.log('✅ Generated linking code:', linkingCode);
  
  const { data, error } = await supabase
    .from('patients')
    .insert({ ...patient, linking_code: linkingCode })
    .select()
    .maybeSingle();

  if (error) {
    console.error('❌ Error creating patient:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    
    // Provide specific error messages
    if (error.code === '23505') {
      console.error('🚫 UNIQUE CONSTRAINT VIOLATION: A patient profile already exists for this user');
    } else if (error.code === '42501') {
      console.error('🚫 RLS POLICY VIOLATION: User not authorized to create patient record');
    } else if (error.code === '23503') {
      console.error('🚫 FOREIGN KEY VIOLATION: Profile does not exist');
    }
    
    return null;
  }
  
  console.log('✅ Patient created successfully:', {
    id: data?.id,
    full_name: data?.full_name,
    linking_code: data?.linking_code,
  });
  
  return data;
};

export const updatePatient = async (patientId: string, updates: Partial<Patient>): Promise<Patient | null> => {
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', patientId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating patient:', error);
    return null;
  }
  return data;
};

// Caregiver operations
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

export const createCaregiver = async (caregiver: Partial<Caregiver>): Promise<Caregiver | null> => {
  console.log('👤 createCaregiver called');
  console.log('Caregiver data:', {
    profile_id: caregiver.profile_id,
    full_name: caregiver.full_name,
    phone: caregiver.phone,
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

// Device link operations
export const getLinkedPatients = async (caregiverId: string): Promise<PatientWithProfile[]> => {
  const { data, error } = await supabase
    .from('device_links')
    .select('patient:patients!device_links_patient_id_fkey(*, profile:profiles!patients_profile_id_fkey(*))')
    .eq('caregiver_id', caregiverId)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching linked patients:', error);
    return [];
  }
  
  const patients = (data || [])
    .map(d => (d as unknown as { patient: PatientWithProfile }).patient)
    .filter(Boolean);
  
  return patients as PatientWithProfile[];
};

export const getLinkedCaregivers = async (patientId: string): Promise<CaregiverWithProfile[]> => {
  const { data, error } = await supabase
    .from('device_links')
    .select('caregiver:caregivers!device_links_caregiver_id_fkey(*, profile:profiles!caregivers_profile_id_fkey(*))')
    .eq('patient_id', patientId)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching linked caregivers:', error);
    return [];
  }
  
  const caregivers = (data || [])
    .map(d => (d as unknown as { caregiver: CaregiverWithProfile }).caregiver)
    .filter(Boolean);
  
  return caregivers as CaregiverWithProfile[];
};

export const linkDevices = async (patientId: string, caregiverId: string): Promise<DeviceLink | null> => {
  console.log('linkDevices called with:', { patientId, caregiverId });
  
  const { data, error } = await supabase
    .from('device_links')
    .insert({ patient_id: patientId, caregiver_id: caregiverId })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error linking devices:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return null;
  }
  
  console.log('Devices linked successfully:', data);
  return data;
};

export const findPatientByLinkingCode = async (linkingCode: string): Promise<Patient | null> => {
  console.log('🔍 findPatientByLinkingCode called');
  console.log('Input linking code:', linkingCode);
  console.log('Linking code length:', linkingCode.length);
  console.log('Linking code type:', typeof linkingCode);
  
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('linking_code', linkingCode)
    .maybeSingle();

  if (error) {
    console.error('❌ Error finding patient:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return null;
  }
  
  if (data) {
    console.log('✅ Patient found:', {
      id: data.id,
      name: data.full_name,
      linkingCode: data.linking_code,
    });
  } else {
    console.log('❌ No patient found with linking code:', linkingCode);
    
    // Debug: Let's see all patients and their linking codes
    const { data: allPatients, error: debugError } = await supabase
      .from('patients')
      .select('id, full_name, linking_code')
      .limit(10);
    
    if (!debugError && allPatients) {
      console.log('📋 All patients in database:', allPatients.map(p => ({
        id: p.id,
        name: p.full_name,
        linkingCode: p.linking_code,
        match: p.linking_code === linkingCode,
      })));
    }
  }
  
  return data;
};

// Task operations
export const getTasks = async (patientId: string, status?: string): Promise<Task[]> => {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('patient_id', patientId)
    .order('scheduled_time', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const createTask = async (task: Partial<Task>): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating task:', error);
    return null;
  }
  return data;
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating task:', error);
    return null;
  }
  return data;
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }
  return true;
};

// Known faces operations
export const getKnownFaces = async (patientId: string): Promise<KnownFace[]> => {
  console.log('🔍 getKnownFaces called for patient:', patientId);
  
  const { data, error } = await supabase
    .from('known_faces')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching known faces:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return [];
  }
  
  console.log('✅ Known faces fetched:', data?.length || 0);
  return Array.isArray(data) ? data : [];
};

export const createKnownFace = async (face: Partial<KnownFace>): Promise<KnownFace | null> => {
  console.log('👤 createKnownFace called');
  console.log('Face data:', {
    patient_id: face.patient_id,
    person_name: face.person_name,
    relationship: face.relationship,
    has_face_encoding: !!face.face_encoding,
    encoding_length: face.face_encoding?.length,
  });
  
  const { data, error } = await supabase
    .from('known_faces')
    .insert(face)
    .select()
    .maybeSingle();

  if (error) {
    console.error('❌ Error creating known face:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }
  
  console.log('✅ Known face created successfully:', {
    id: data?.id,
    person_name: data?.person_name,
  });
  
  return data;
};

export const updateKnownFace = async (faceId: string, updates: Partial<KnownFace>): Promise<KnownFace | null> => {
  const { data, error } = await supabase
    .from('known_faces')
    .update(updates)
    .eq('id', faceId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating known face:', error);
    return null;
  }
  return data;
};

export const deleteKnownFace = async (faceId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('known_faces')
    .delete()
    .eq('id', faceId);

  if (error) {
    console.error('Error deleting known face:', error);
    return false;
  }
  return true;
};

// Unknown encounters operations
export const getUnknownEncounters = async (patientId: string, limit = 50): Promise<UnknownEncounter[]> => {
  const { data, error } = await supabase
    .from('unknown_encounters')
    .select('*')
    .eq('patient_id', patientId)
    .order('encounter_time', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching unknown encounters:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const createUnknownEncounter = async (encounter: Partial<UnknownEncounter>): Promise<UnknownEncounter | null> => {
  const { data, error } = await supabase
    .from('unknown_encounters')
    .insert(encounter)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating unknown encounter:', error);
    return null;
  }
  return data;
};

// Health metrics operations
export const getHealthMetrics = async (patientId: string, limit = 100): Promise<HealthMetric[]> => {
  const { data, error } = await supabase
    .from('health_metrics')
    .select('*')
    .eq('patient_id', patientId)
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching health metrics:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const createHealthMetric = async (metric: Partial<HealthMetric>): Promise<HealthMetric | null> => {
  const { data, error } = await supabase
    .from('health_metrics')
    .insert(metric)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating health metric:', error);
    return null;
  }
  return data;
};

// AI interactions operations
export const getAIInteractions = async (patientId: string, limit = 50): Promise<AIInteraction[]> => {
  const { data, error } = await supabase
    .from('ai_interactions')
    .select('*')
    .eq('patient_id', patientId)
    .order('interaction_time', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching AI interactions:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const createAIInteraction = async (interaction: Partial<AIInteraction>): Promise<AIInteraction | null> => {
  const { data, error } = await supabase
    .from('ai_interactions')
    .insert(interaction)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating AI interaction:', error);
    return null;
  }
  return data;
};

// Activity logs operations
export const getActivityLogs = async (patientId: string, limit = 100): Promise<ActivityLog[]> => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('patient_id', patientId)
    .order('log_time', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const createActivityLog = async (log: Partial<ActivityLog>): Promise<ActivityLog | null> => {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert(log)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating activity log:', error);
    return null;
  }
  return data;
};

// Alerts operations
export const getAlerts = async (patientId: string, status?: string, limit = 50): Promise<Alert[]> => {
  let query = supabase
    .from('alerts')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('alert_status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
};

export const createAlert = async (alert: Partial<Alert>): Promise<Alert | null> => {
  console.log('🚨 createAlert called');
  console.log('Alert data:', {
    patient_id: alert.patient_id,
    alert_type: alert.alert_type,
    title: alert.title,
    message: alert.message ? alert.message.substring(0, 50) + '...' : 'N/A',
  });
  
  const { data, error } = await supabase
    .from('alerts')
    .insert(alert)
    .select()
    .maybeSingle();

  if (error) {
    console.error('❌ Error creating alert:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }
  
  console.log('✅ Alert created successfully:', {
    id: data?.id,
    type: data?.alert_type,
    status: data?.alert_status,
  });
  
  return data;
};

export const updateAlert = async (alertId: string, updates: Partial<Alert>): Promise<Alert | null> => {
  const { data, error } = await supabase
    .from('alerts')
    .update(updates)
    .eq('id', alertId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating alert:', error);
    return null;
  }
  return data;
};

export const getUnreadAlertsCount = async (patientId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', patientId)
    .eq('alert_status', 'unread');

  if (error) {
    console.error('Error fetching unread alerts count:', error);
    return 0;
  }
  return count || 0;
};

// Get all alerts for caregiver (across all linked patients)
export const getCaregiverAlerts = async (caregiverId: string, limit = 50): Promise<AlertWithPatient[]> => {
  console.log('📬 getCaregiverAlerts called');
  console.log('Caregiver ID:', caregiverId);
  console.log('Limit:', limit);
  
  // First get all patient IDs linked to this caregiver
  const { data: links, error: linksError } = await supabase
    .from('device_links')
    .select('patient_id')
    .eq('caregiver_id', caregiverId)
    .eq('is_active', true);

  if (linksError) {
    console.error('❌ Error fetching device links:', linksError);
    return [];
  }
  
  if (!links || links.length === 0) {
    console.log('⚠️ No linked patients found for caregiver');
    return [];
  }

  const patientIds = links.map(link => link.patient_id);
  console.log(`✅ Found ${patientIds.length} linked patients:`, patientIds);

  // Then get alerts for those patients
  const { data, error } = await supabase
    .from('alerts')
    .select(`
      *,
      patient:patients!alerts_patient_id_fkey(
        *,
        profile:profiles!patients_profile_id_fkey(*)
      )
    `)
    .in('patient_id', patientIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching caregiver alerts:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return [];
  }
  
  console.log(`✅ Found ${data?.length || 0} alerts for caregiver`);
  if (data && data.length > 0) {
    console.log('Alert summary:', data.map(a => ({
      id: a.id,
      type: a.alert_type,
      status: a.alert_status,
      patient: a.patient?.full_name,
      created: a.created_at,
    })));
  }
  
  return Array.isArray(data) ? data : [];
};
