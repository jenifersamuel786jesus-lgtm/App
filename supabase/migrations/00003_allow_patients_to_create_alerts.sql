-- Allow patients to create alerts for themselves
CREATE POLICY "Patients can create alerts"
ON alerts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = alerts.patient_id
    AND patients.profile_id = auth.uid()
  )
);

-- Add comment explaining the policy
COMMENT ON POLICY "Patients can create alerts" ON alerts IS 
'Allows patients to create alerts (emergency, task skipped, etc.) that will be sent to their linked caregivers.';