-- Test script to verify order creation works
-- Run this in Supabase SQL Editor after applying the fixes

-- Step 1: Check if we have a current user
SELECT get_current_user_id() as current_user_id;

-- Step 2: Check if we have products to test with
SELECT id, name, price FROM products LIMIT 3;

-- Step 3: Check the current table structures
SELECT 'orders' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

SELECT 'order_items' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Step 4: Check RLS policies
SELECT schemaname, tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;

-- Step 5: Test order creation (replace PRODUCT_ID_HERE with actual product ID)
-- This will only work if you're authenticated and have a valid product ID
/*
-- First, get a real product ID
SELECT id FROM products LIMIT 1;

-- Then test order creation (uncomment and replace PRODUCT_ID_HERE)
INSERT INTO orders (user_id, total, shipping_address, billing_address, payment_method, notes)
VALUES (
    get_current_user_id(),
    29.99,
    '{"firstName": "John", "lastName": "Doe", "address": "123 Main St", "city": "Anytown", "state": "CA", "zipCode": "12345"}',
    '{"firstName": "John", "lastName": "Doe", "address": "123 Main St", "city": "Anytown", "state": "CA", "zipCode": "12345"}',
    'credit_card',
    'Test order'
) RETURNING id, order_number;

-- Then test order items creation (replace ORDER_ID_HERE and PRODUCT_ID_HERE)
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
VALUES (
    'ORDER_ID_HERE',
    'PRODUCT_ID_HERE',
    1,
    29.99
);
*/

-- Step 6: Check if the order_details view works
SELECT * FROM order_details LIMIT 5;

-- Step 7: Test the order number generation function
SELECT generate_order_number() as test_order_number; 