-- Verify and fix RLS policies for cart_items table
-- Run this in Supabase SQL Editor

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'cart_items'
ORDER BY policyname;

-- Drop existing policies
DROP POLICY IF EXISTS "cart_items_select_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_insert_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_update_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_delete_policy" ON cart_items;
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

-- Create new policies using the custom function
CREATE POLICY "cart_items_select_policy" ON cart_items
    FOR SELECT USING (get_current_user_id() = user_id);

CREATE POLICY "cart_items_insert_policy" ON cart_items
    FOR INSERT WITH CHECK (get_current_user_id() = user_id);

CREATE POLICY "cart_items_update_policy" ON cart_items
    FOR UPDATE USING (get_current_user_id() = user_id);

CREATE POLICY "cart_items_delete_policy" ON cart_items
    FOR DELETE USING (get_current_user_id() = user_id);

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'cart_items'
ORDER BY policyname;

-- Test the custom function
SELECT get_current_user_id() as current_user_id;

-- Test a simple insert to verify RLS is working
-- (This will only work if you're authenticated and a product exists)
-- First, get a real product ID
SELECT id FROM products LIMIT 1;

-- Then test insert with a real product ID (replace PRODUCT_ID_HERE with actual ID from above)
-- INSERT INTO cart_items (user_id, product_id, quantity) 
-- VALUES (get_current_user_id(), 'PRODUCT_ID_HERE', 1)
-- ON CONFLICT (user_id, product_id) DO NOTHING; 