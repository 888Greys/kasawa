-- Fix order_items table: Add missing price_at_purchase column
-- Run this in Supabase SQL Editor

-- Check what columns exist in order_items table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Add missing price_at_purchase column to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS price_at_purchase DECIMAL(10,2) CHECK (price_at_purchase >= 0);

-- Now create the order_details view with the correct columns
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
    p.image_url as product_image,
    p.category as product_category
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
ORDER BY o.created_at DESC, oi.created_at;

-- Grant permissions
GRANT SELECT ON order_details TO authenticated; 