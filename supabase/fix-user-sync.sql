-- Fix user synchronization between auth.users and public.users
-- Run this in Supabase SQL Editor

-- Step 1: Check current users table structure
SELECT 'Current users table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 2: Create or update the users table to match auth.users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create a function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger to automatically create user records
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 5: Create a function to sync existing users
CREATE OR REPLACE FUNCTION sync_existing_users()
RETURNS INTEGER AS $$
DECLARE
    user_count INTEGER := 0;
BEGIN
    INSERT INTO public.users (id, email, created_at, updated_at)
    SELECT 
        au.id,
        au.email,
        au.created_at,
        au.updated_at
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    GET DIAGNOSTICS user_count = ROW_COUNT;
    RETURN user_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Sync existing users
SELECT 'Syncing existing users...' as info;
SELECT sync_existing_users() as users_synced;

-- Step 7: Update the orders table foreign key to reference auth.users instead
-- First, let's check the current foreign key
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='orders';

-- Step 8: Drop the existing foreign key constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Step 9: Add new foreign key constraint to auth.users
ALTER TABLE orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 10: Update RLS policies to use auth.users
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Step 11: Update cart_items foreign key as well
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;
ALTER TABLE cart_items 
ADD CONSTRAINT cart_items_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 12: Update cart_items RLS policies
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

CREATE POLICY "Users can view own cart items" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Step 13: Test the fix
SELECT 'Testing order creation for current user...' as info;

-- Get current user ID
SELECT auth.uid() as current_user_id;

-- Test order creation
INSERT INTO orders (user_id, total, shipping_address, billing_address, payment_method, notes)
VALUES (
    auth.uid(),
    29.99,
    '{"test": true}',
    '{"test": true}',
    'credit_card',
    'User sync test order'
) RETURNING id, order_number;

-- Step 14: Show final structure
SELECT 'Final users table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT 'Final orders table foreign keys:' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='orders'; 