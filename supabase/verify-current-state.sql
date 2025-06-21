-- Verify current database state and identify any remaining issues
-- Run this in Supabase SQL Editor

-- Step 1: Check authentication status
SELECT '=== AUTHENTICATION STATUS ===' as info;
SELECT 
    auth.role() as current_role,
    auth.uid() as current_user_id,
    CASE WHEN auth.jwt() IS NOT NULL THEN 'Has JWT' ELSE 'No JWT' END as jwt_status;

-- Step 2: Check table structures
SELECT '=== ORDERS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

SELECT '=== ORDER_ITEMS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Step 3: Check foreign key constraints
SELECT '=== FOREIGN KEY CONSTRAINTS ===' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('orders', 'order_items', 'cart_items')
ORDER BY tc.table_name, kcu.column_name;

-- Step 4: Check RLS policies
SELECT '=== RLS POLICIES ===' as info;
SELECT schemaname, tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'cart_items')
ORDER BY tablename, policyname;

-- Step 5: Check existing orders
SELECT '=== EXISTING ORDERS ===' as info;
SELECT id, order_number, user_id, total, status, created_at, LENGTH(order_number) as order_number_length
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 6: Check if user exists in auth.users
SELECT '=== USER IN AUTH.USERS ===' as info;
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid()
    ) THEN 'User exists in auth.users' 
    ELSE 'User NOT found in auth.users' 
    END as user_status;

-- Step 7: Test order creation manually
SELECT '=== MANUAL ORDER CREATION TEST ===' as info;

-- Test order creation
INSERT INTO orders (user_id, total, shipping_address, billing_address, payment_method, notes)
VALUES (
    auth.uid(),
    29.99,
    '{"firstName": "Test", "lastName": "User", "address": "123 Test St", "city": "Test City", "state": "CA", "zipCode": "12345"}',
    '{"firstName": "Test", "lastName": "User", "address": "123 Test St", "city": "Test City", "state": "CA", "zipCode": "12345"}',
    'credit_card',
    'Manual verification test'
) RETURNING id, order_number, user_id, total;

-- Step 8: Check if trigger function exists
SELECT '=== TRIGGER FUNCTION STATUS ===' as info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'generate_order_number';

-- Step 9: Check triggers
SELECT '=== TRIGGERS ===' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders';

-- Step 10: Test RLS policies
SELECT '=== RLS POLICY TEST ===' as info;
SELECT 
    'Can insert orders' as test,
    CASE WHEN EXISTS (
        SELECT 1 FROM orders 
        WHERE user_id = auth.uid() 
        LIMIT 1
    ) THEN 'PASS' ELSE 'FAIL' 
    END as result; 