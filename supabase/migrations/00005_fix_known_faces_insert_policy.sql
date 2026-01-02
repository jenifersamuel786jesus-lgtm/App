-- Drop the existing policy that has incomplete WITH CHECK
DROP POLICY IF EXISTS "Patients can manage their known faces" ON known_faces;

-- Recreate with proper WITH CHECK clause for INSERT operations
CREATE POLICY "Patients can manage their known faces"
ON known_faces
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM patients
    WHERE patients.id = known_faces.patient_id
    AND patients.profile_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM patients
    WHERE patients.id = known_faces.patient_id
    AND patients.profile_id = auth.uid()
  )
);

-- Add comment explaining the policy
COMMENT ON POLICY "Patients can manage their known faces" ON known_faces IS 
'Allows patients to SELECT, INSERT, UPDATE, and DELETE their own known faces. 
USING clause checks for SELECT, UPDATE, DELETE operations.
WITH CHECK clause validates INSERT operations to ensure patient owns the record.';