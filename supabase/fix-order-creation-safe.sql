-- Safe fix for order creation issues
-- Run this in Supabase SQL Editor

-- First, let's check the current state of our tables
SELECT 'Current orders table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

SELECT 'Current order_items table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Step 1: Fix the orders table structure
-- Add missing columns and fix data types
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Handle total_amount to total rename safely
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'orders' AND column_name = 'total_amount')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'orders' AND column_name = 'total') THEN
        ALTER TABLE orders RENAME COLUMN total_amount TO total;
    END IF;
END $$;

-- Handle shipping_address type conversion safely
DO $$
BEGIN
    -- Check if shipping_address exists and is TEXT type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'orders' AND column_name = 'shipping_address' 
               AND data_type = 'text') THEN
        -- Convert to JSONB
        ALTER TABLE orders ALTER COLUMN shipping_address TYPE JSONB USING shipping_address::jsonb;
    END IF;
END $$;

-- Step 2: Fix the order_items table structure
-- Add price_at_purchase column if it doesn't exist
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS price_at_purchase DECIMAL(10,2) CHECK (price_at_purchase >= 0);

-- Handle price_at_time to price_at_purchase rename safely
DO $$
BEGIN
    -- Only rename if price_at_time exists and price_at_purchase doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'order_items' AND column_name = 'price_at_time')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'order_items' AND column_name = 'price_at_purchase') THEN
        ALTER TABLE order_items RENAME COLUMN price_at_time TO price_at_purchase;
    END IF;
END $$;

-- Step 3: Create the order number generation function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                       LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0') || '-' ||
                       LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0') || '-' ||
                       LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 16) AS INTEGER)), 0) + 1 
                             FROM orders 
                             WHERE order_number LIKE 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                                   LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0') || '-' ||
                                   LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0') || '-%')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger for order number generation
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Step 5: Create the custom user ID function for RLS
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Drop and recreate RLS policies for orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (get_current_user_id() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (get_current_user_id() = user_id);

CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (get_current_user_id() = user_id);

-- Step 7: Drop and recreate RLS policies for order_items
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;

CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = get_current_user_id()
        )
    );

CREATE POLICY "Users can insert own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = get_current_user_id()
        )
    );

-- Step 8: Create the order_details view
DROP VIEW IF EXISTS order_details;

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
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
ORDER BY o.created_at DESC, oi.created_at;

-- Step 9: Grant permissions
GRANT SELECT ON order_details TO authenticated;

-- Step 10: Show final structure
SELECT 'Final orders table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

SELECT 'Final order_items table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Step 11: Test the functions
SELECT get_current_user_id() as current_user_id; 