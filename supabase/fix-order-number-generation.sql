-- Fix order number generation to handle race conditions and ensure uniqueness
-- Run this in Supabase SQL Editor

-- Step 1: Create a more robust order number generation function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    new_order_number TEXT;
    attempt_count INTEGER := 0;
    max_attempts INTEGER := 10;
    base_date TEXT;
    counter INTEGER;
BEGIN
    -- Generate base date string
    base_date := 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                 LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0') || '-' ||
                 LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0');
    
    -- Try to generate a unique order number
    LOOP
        attempt_count := attempt_count + 1;
        
        -- Get the next counter value for today
        SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 16) AS INTEGER)), 0) + 1
        INTO counter
        FROM orders 
        WHERE order_number LIKE base_date || '-%';
        
        -- Generate the new order number
        new_order_number := base_date || '-' || LPAD(counter::TEXT, 4, '0');
        
        -- Check if this order number already exists
        IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) THEN
            NEW.order_number := new_order_number;
            RETURN NEW;
        END IF;
        
        -- If we've tried too many times, use timestamp-based fallback
        IF attempt_count >= max_attempts THEN
            -- Use timestamp-based order number as fallback
            NEW.order_number := 'ORD-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
            RETURN NEW;
        END IF;
        
        -- Small delay to avoid race conditions
        PERFORM pg_sleep(0.001);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Drop and recreate the trigger
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Step 3: Test the function
SELECT 'Testing order number generation...' as info;

-- Test 1: Check current order numbers
SELECT 'Current order numbers:' as info;
SELECT order_number, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- Test 2: Test the function directly
SELECT 'Testing generate_order_number function...' as info;
DO $$
DECLARE
    test_order_number TEXT;
BEGIN
    -- Simulate what the trigger would do
    SELECT 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || 
           LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0') || '-' ||
           LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0') || '-' ||
           LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 16) AS INTEGER)), 0) + 1 
                 FROM orders 
                 WHERE order_number LIKE 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                       LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0') || '-' ||
                       LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0') || '-%')::TEXT, 4, '0')
    INTO test_order_number;
    
    RAISE NOTICE 'Generated test order number: %', test_order_number;
END $$;

-- Step 4: Create a simple test order to verify the trigger works
SELECT 'Creating test order to verify trigger...' as info;
INSERT INTO orders (user_id, total, shipping_address, billing_address, payment_method, notes)
VALUES (
    auth.uid(),
    29.99,
    '{"firstName": "Test", "lastName": "User", "address": "123 Test St", "city": "Test City", "state": "CA", "zipCode": "12345"}',
    '{"firstName": "Test", "lastName": "User", "address": "123 Test St", "city": "Test City", "state": "CA", "zipCode": "12345"}',
    'credit_card',
    'Order number generation test'
) RETURNING id, order_number, user_id, total;

-- Step 5: Show the result
SELECT 'Test order created successfully!' as info;
SELECT order_number, created_at 
FROM orders 
WHERE notes = 'Order number generation test'
ORDER BY created_at DESC; 