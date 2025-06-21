-- Final solution: Remove foreign key constraint and use Supabase auth directly
-- Run this in Supabase SQL Editor

-- First, let's simplify the RLS policies
DROP POLICY IF EXISTS "cart_items_select_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_insert_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_update_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_delete_policy" ON cart_items;

-- Create simpler policies that don't require user_id to be set during insert
CREATE POLICY "cart_items_select_policy" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_items_insert_policy" ON cart_items
    FOR INSERT WITH CHECK (true); -- Allow all inserts, trigger will set user_id

CREATE POLICY "cart_items_update_policy" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_items_delete_policy" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Remove the foreign key constraint to users table
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;

-- Create a trigger function to automatically set user_id
CREATE OR REPLACE FUNCTION set_cart_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the user_id to the current authenticated user from Supabase auth
    NEW.user_id := auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS set_cart_user_id_trigger ON cart_items;
CREATE TRIGGER set_cart_user_id_trigger
    BEFORE INSERT ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION set_cart_user_id();

-- Verify the trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'cart_items';

-- Test the current user ID
SELECT auth.uid() as current_user_id; 