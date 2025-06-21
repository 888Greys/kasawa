-- Fix orders table: Add missing columns and rename total_amount to total
-- Run this in Supabase SQL Editor

-- Add missing columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Rename total_amount to total to match our expected schema
ALTER TABLE orders RENAME COLUMN total_amount TO total;

-- Update the order number generation function to work with the new column
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

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Now create the order_details view
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