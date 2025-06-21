-- Verification Script: Check that all database objects were created correctly
-- Run this in Supabase SQL Editor to verify the migration

-- 1. Check cart_items table structure
SELECT 'cart_items table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
ORDER BY ordinal_position;

-- 2. Check orders table structure
SELECT 'orders table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 3. Check order_items table structure
SELECT 'order_items table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- 4. Check if RLS is enabled
SELECT 'RLS Status:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('cart_items', 'orders', 'order_items');

-- 5. Check RLS policies
SELECT 'RLS Policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('cart_items', 'orders', 'order_items')
ORDER BY tablename, policyname;

-- 6. Check indexes
SELECT 'Indexes:' as info;
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('cart_items', 'orders', 'order_items')
ORDER BY tablename, indexname;

-- 7. Check triggers
SELECT 'Triggers:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('cart_items', 'orders', 'order_items')
ORDER BY event_object_table, trigger_name;

-- 8. Check functions
SELECT 'Functions:' as info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('generate_order_number', 'update_updated_at_column')
ORDER BY routine_name;

-- 9. Check if order_details view exists
SELECT 'order_details view:' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'order_details';

-- 10. Test order_details view structure
SELECT 'order_details view columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'order_details' 
ORDER BY ordinal_position;

-- 11. Check permissions
SELECT 'Permissions:' as info;
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name IN ('cart_items', 'orders', 'order_items', 'order_details')
AND grantee = 'authenticated'
ORDER BY table_name, privilege_type; 