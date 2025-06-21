-- Migration: Add cart and orders tables
-- This migration creates tables for persistent cart and order management

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    shipping_address JSONB,
    billing_address JSONB,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10,2) NOT NULL CHECK (price_at_purchase >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Create function to generate order numbers
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

-- Create trigger to auto-generate order numbers
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Cart items policies
CREATE POLICY "Users can view their own cart items" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Order items policies (users can only view items from their orders)
CREATE POLICY "Users can view items from their orders" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert items to their orders" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Create a view for order details with product information
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON cart_items TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT SELECT ON order_details TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 