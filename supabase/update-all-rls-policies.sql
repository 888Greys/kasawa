-- Update all RLS policies to use the custom get_current_user_id() function
-- Run this in Supabase SQL Editor

-- Update cart_items policies
DROP POLICY IF EXISTS "cart_items_select_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_insert_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_update_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_delete_policy" ON cart_items;

CREATE POLICY "cart_items_select_policy" ON cart_items
    FOR SELECT USING (get_current_user_id() = user_id);

CREATE POLICY "cart_items_insert_policy" ON cart_items
    FOR INSERT WITH CHECK (get_current_user_id() = user_id);

CREATE POLICY "cart_items_update_policy" ON cart_items
    FOR UPDATE USING (get_current_user_id() = user_id);

CREATE POLICY "cart_items_delete_policy" ON cart_items
    FOR DELETE USING (get_current_user_id() = user_id);

-- Update orders policies
DROP POLICY IF EXISTS "orders_select_policy" ON orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
DROP POLICY IF EXISTS "orders_update_policy" ON orders;

CREATE POLICY "orders_select_policy" ON orders
    FOR SELECT USING (get_current_user_id() = user_id);

CREATE POLICY "orders_insert_policy" ON orders
    FOR INSERT WITH CHECK (get_current_user_id() = user_id);

CREATE POLICY "orders_update_policy" ON orders
    FOR UPDATE USING (get_current_user_id() = user_id);

-- Update order_items policies
DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_policy" ON order_items;

CREATE POLICY "order_items_select_policy" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = get_current_user_id()
        )
    );

CREATE POLICY "order_items_insert_policy" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = get_current_user_id()
        )
    );

-- Verify the updated policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('cart_items', 'orders', 'order_items')
ORDER BY tablename, policyname; 