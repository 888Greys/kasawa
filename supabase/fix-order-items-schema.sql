-- Fix order_items table schema to match the OrderService expectations
-- Run this in Supabase SQL Editor

-- Step 1: Check current order_items table structure
SELECT 'Current order_items table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Step 2: Check if price_at_time exists and price_at_purchase doesn't exist
SELECT 'Checking column existence:' as info;
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'order_items' AND column_name = 'price_at_time') 
         THEN 'price_at_time EXISTS' ELSE 'price_at_time DOES NOT EXIST' END as price_at_time_status,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'order_items' AND column_name = 'price_at_purchase') 
         THEN 'price_at_purchase EXISTS' ELSE 'price_at_purchase DOES NOT EXIST' END as price_at_purchase_status;

-- Step 3: Fix the column mismatch
-- If price_at_time exists and price_at_purchase doesn't, rename price_at_time to price_at_purchase
DO $$
BEGIN
    -- Check if price_at_time exists and price_at_purchase doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'order_items' AND column_name = 'price_at_time')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'order_items' AND column_name = 'price_at_purchase') THEN
        
        -- Rename price_at_time to price_at_purchase
        ALTER TABLE order_items RENAME COLUMN price_at_time TO price_at_purchase;
        RAISE NOTICE 'Renamed price_at_time to price_at_purchase';
        
    -- If price_at_purchase doesn't exist and price_at_time doesn't exist, create price_at_purchase
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'order_items' AND column_name = 'price_at_time')
          AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'order_items' AND column_name = 'price_at_purchase') THEN
        
        -- Add price_at_purchase column
        ALTER TABLE order_items ADD COLUMN price_at_purchase DECIMAL(10,2) CHECK (price_at_purchase >= 0);
        RAISE NOTICE 'Added price_at_purchase column';
        
    -- If both exist, drop price_at_time and keep price_at_purchase
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'order_items' AND column_name = 'price_at_time')
          AND EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'order_items' AND column_name = 'price_at_purchase') THEN
        
        -- Drop price_at_time column
        ALTER TABLE order_items DROP COLUMN price_at_time;
        RAISE NOTICE 'Dropped price_at_time column (keeping price_at_purchase)';
        
    ELSE
        RAISE NOTICE 'No changes needed - price_at_purchase column already exists correctly';
    END IF;
END $$;

-- Step 4: Verify the final structure
SELECT 'Final order_items table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Step 5: Test order items insertion
SELECT 'Testing order items insertion...' as info;

-- Create a test order first
INSERT INTO orders (user_id, total, shipping_address, billing_address, payment_method, notes)
VALUES (
    auth.uid(),
    29.99,
    '{"firstName": "Test", "lastName": "User", "address": "123 Test St", "city": "Test City", "state": "CA", "zipCode": "12345"}',
    '{"firstName": "Test", "lastName": "User", "address": "123 Test St", "city": "Test City", "state": "CA", "zipCode": "12345"}',
    'credit_card',
    'Order items schema test'
) RETURNING id, order_number;

-- Test order items insertion with the correct column name
DO $$
DECLARE
    test_order_id UUID;
    test_product_id UUID;
BEGIN
    -- Get the test order ID
    SELECT id INTO test_order_id FROM orders WHERE notes = 'Order items schema test' LIMIT 1;
    
    -- Get a product ID
    SELECT id INTO test_product_id FROM products LIMIT 1;
    
    -- Test inserting order items with price_at_purchase
    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
    VALUES (test_order_id, test_product_id, 2, 14.99);
    
    RAISE NOTICE 'Successfully inserted order item with price_at_purchase: %', test_order_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting order item: %', SQLERRM;
END $$;

-- Step 6: Show test results
SELECT 'Test order items:' as info;
SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase, o.order_number
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.notes = 'Order items schema test'; 