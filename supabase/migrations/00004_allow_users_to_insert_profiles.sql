-- Allow users to create their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add comment explaining the policy
COMMENT ON POLICY "Users can insert their own profile" ON profiles IS 
'Allows authenticated users to create their own profile record during signup.';