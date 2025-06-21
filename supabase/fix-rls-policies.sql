-- Fix RLS Policies for cart_items table
-- Run this in Supabase SQL Editor

-- First, let's check the current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'cart_items';

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;

-- Recreate policies with proper auth.uid() checks
CREATE POLICY "Users can view their own cart items" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Also fix orders policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;

CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Fix order_items policies
DROP POLICY IF EXISTS "Users can view items from their orders" ON order_items;
DROP POLICY IF EXISTS "Users can insert items to their orders" ON order_items;

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

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('cart_items', 'orders', 'order_items')
ORDER BY tablename, policyname; 