-- Fix ambiguous column reference for order_number
-- Run this in Supabase SQL Editor

-- Step 1: Check what tables/views have order_number column
SELECT '=== TABLES WITH ORDER_NUMBER COLUMN ===' as info;
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'order_number'
ORDER BY table_schema, table_name;

-- Step 2: Check if there are any views causing conflicts
SELECT '=== VIEWS WITH ORDER_NUMBER ===' as info;
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE definition LIKE '%order_number%'
AND schemaname = 'public';

-- Step 3: Drop the problematic order_details view if it exists
SELECT '=== DROPPING CONFLICTING VIEW ===' as info;
DROP VIEW IF EXISTS order_details;

-- Step 4: Check current order number generation function
SELECT '=== CURRENT ORDER NUMBER FUNCTION ===' as info;
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'generate_order_number';

-- Step 5: Fix the order number generation function to be more specific
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    new_order_number TEXT;
    counter INTEGER := 1;
    max_attempts INTEGER := 10;
    date_part TEXT;
    time_part TEXT;
BEGIN
    -- Get current date and time in very compact format
    date_part := TO_CHAR(NOW(), 'MMDD');
    time_part := TO_CHAR(NOW(), 'HHMM');
    
    -- Try to generate a unique order number
    LOOP
        -- Generate very short order number: ORD-MMDD-HHMM-XX
        new_order_number := 'ORD-' || date_part || '-' || time_part || '-' || LPAD(counter::TEXT, 2, '0');
        
        -- Check if this order number already exists (be specific about table)
        IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_order_number) THEN
            NEW.order_number := new_order_number;
            RETURN NEW;
        END IF;
        
        -- Increment counter and try again
        counter := counter + 1;
        
        -- Prevent infinite loop
        IF counter > max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique order number after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Test order creation with fixed function
SELECT '=== TESTING ORDER CREATION WITH FIXED FUNCTION ===' as info;

-- Test order creation
INSERT INTO orders (user_id, total, shipping_address, billing_address, payment_method, notes)
VALUES (
    auth.uid(),
    29.99,
    '{"firstName": "Test", "lastName": "User", "address": "123 Test St", "city": "Test City", "state": "CA", "zipCode": "12345"}',
    '{"firstName": "Test", "lastName": "User", "address": "123 Test St", "city": "Test City", "state": "CA", "zipCode": "12345"}',
    'credit_card',
    'Ambiguous column fix test'
) RETURNING id, order_number, user_id, total;

-- Step 7: Create a clean order_details view without conflicts
SELECT '=== CREATING CLEAN ORDER_DETAILS VIEW ===' as info;

CREATE OR REPLACE VIEW order_details AS
SELECT 
    o.id as order_id,
    o.order_number,
    o.user_id,
    o.status,
    o.total,
    o.shipping_address,
    o.billing_address,
    o.payment_method,
    o.notes,
    o.created_at,
    o.updated_at,
    oi.id as order_item_id,
    oi.quantity,
    oi.price_at_purchase,
    p.id as product_id,
    p.name as product_name,
    p.description as product_description,
    p.images as product_images,
    p.category as product_category
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
LEFT JOIN public.products p ON oi.product_id = p.id
ORDER BY o.created_at DESC, oi.created_at;

-- Grant permissions
GRANT SELECT ON order_details TO authenticated;

-- Step 8: Test the app order creation function again
SELECT '=== TESTING APP ORDER CREATION AGAIN ===' as info;

-- Drop and recreate the test function
DROP FUNCTION IF EXISTS test_app_order_creation();

CREATE OR REPLACE FUNCTION test_app_order_creation()
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    order_id UUID,
    order_number TEXT
) AS $$
DECLARE
    test_order_id UUID;
    test_order_number TEXT;
BEGIN
    -- Test order creation similar to what the app does
    INSERT INTO public.orders (user_id, total, shipping_address, billing_address, payment_method, notes)
    VALUES (
        auth.uid(),
        29.99,
        '{"firstName": "App", "lastName": "Test", "address": "123 App St", "city": "App City", "state": "CA", "zipCode": "12345"}',
        '{"firstName": "App", "lastName": "Test", "address": "123 App St", "city": "App City", "state": "CA", "zipCode": "12345"}',
        'credit_card',
        'App order creation test - fixed'
    ) RETURNING id, order_number INTO test_order_id, test_order_number;
    
    RETURN QUERY SELECT 
        TRUE as success,
        'Order created successfully from app perspective' as message,
        test_order_id as order_id,
        test_order_number as order_number;
        
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Error creating order: ' || SQLERRM as message,
            NULL::UUID as order_id,
            NULL::TEXT as order_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT * FROM test_app_order_creation();

-- Step 9: Show final results
SELECT '=== FINAL ORDER NUMBERS ===' as info;
SELECT order_number, created_at, LENGTH(order_number) as length
FROM public.orders 
WHERE order_number IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5; 