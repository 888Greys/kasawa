-- Fix for Step 13: Create order details view with correct column names
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

-- Grant permissions for the view
GRANT SELECT ON order_details TO authenticated; 