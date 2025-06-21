-- Clean up all RLS policies and recreate them properly
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies for cart_items, orders, and order_items
DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

DROP POLICY IF EXISTS "Users can view items from their orders" ON order_items;
DROP POLICY IF EXISTS "Users can insert items to their orders" ON order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;

-- Create clean, single policies for cart_items
CREATE POLICY "cart_items_select_policy" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_items_insert_policy" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_items_update_policy" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_items_delete_policy" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Create clean, single policies for orders
CREATE POLICY "orders_select_policy" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_policy" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_policy" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Create clean, single policies for order_items
CREATE POLICY "order_items_select_policy" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "order_items_insert_policy" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Verify the clean policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('cart_items', 'orders', 'order_items')
ORDER BY tablename, policyname; 