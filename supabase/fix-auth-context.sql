-- Alternative approach to fix auth context
-- Run this in Supabase SQL Editor

-- First, let's try a different approach to get the current user
-- Create a function that gets the current user ID from the JWT token
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT get_current_user_id() as current_user_id;

-- Update the RLS policies to use this function
DROP POLICY IF EXISTS "cart_items_insert_policy" ON cart_items;
CREATE POLICY "cart_items_insert_policy" ON cart_items
    FOR INSERT WITH CHECK (get_current_user_id() = user_id);

-- Test if this works better
-- You can test this by trying to add an item to cart in your app

-- Also, let's check if there's a session issue
-- Create a function to check the current session
CREATE OR REPLACE FUNCTION check_auth_session()
RETURNS TABLE (
    has_session BOOLEAN,
    user_id UUID,
    auth_uid_result UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (auth.role() IS NOT NULL) as has_session,
        auth.uid() as user_id,
        get_current_user_id() as auth_uid_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the session check
SELECT * FROM check_auth_session(); 