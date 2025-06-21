-- Test auth.uid() function and user context
-- Run this in Supabase SQL Editor

-- First, let's check if auth.uid() function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'auth_uid';

-- Test auth.uid() directly
SELECT auth.uid() as current_user_id;

-- Check if we can access the auth schema
SELECT 
    schema_name,
    schema_owner
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- Test a simple query to see if RLS is working
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'cart_items';

-- Try to insert a test record (this should fail if RLS is working)
-- We'll use a dummy UUID that doesn't exist
INSERT INTO cart_items (user_id, product_id, quantity) 
VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 1)
ON CONFLICT DO NOTHING;

-- Check if the test record was inserted
SELECT * FROM cart_items WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Clean up test record
DELETE FROM cart_items WHERE user_id = '00000000-0000-0000-0000-000000000000'; 