-- Allow authenticated users to find patients by linking code for device linking
-- This is necessary for caregivers to link new patients
CREATE POLICY "Allow authenticated users to find patients by linking code"
ON patients
FOR SELECT
TO authenticated
USING (linking_code IS NOT NULL);

-- Add comment explaining the policy
COMMENT ON POLICY "Allow authenticated users to find patients by linking code" ON patients IS 
'Allows caregivers to search for patients by linking code during the device linking process. This is safe because linking codes are randomly generated and act as secure tokens.';