-- Create a function to delete all auth users
CREATE OR REPLACE FUNCTION delete_all_auth_users()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    DELETE FROM auth.users WHERE id = user_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function
SELECT delete_all_auth_users();

-- Drop the function after use
DROP FUNCTION delete_all_auth_users();