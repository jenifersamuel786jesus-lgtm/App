-- Create a helper function to check if user is the patient owner
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

-- Drop the existing policy
DROP POLICY IF EXISTS "Patients can manage their known faces" ON known_faces;

-- Recreate with simpler function-based check
CREATE POLICY "Patients can manage their known faces"
ON known_faces
FOR ALL
TO authenticated
USING (is_patient_owner(patient_id))
WITH CHECK (is_patient_owner(patient_id));

-- Add comment
COMMENT ON FUNCTION public.is_patient_owner IS 
'SECURITY DEFINER function to check if authenticated user owns the patient record.
Bypasses RLS on patients table to allow policy evaluation.';

COMMENT ON POLICY "Patients can manage their known faces" ON known_faces IS 
'Allows patients to manage their own known faces using SECURITY DEFINER function.';