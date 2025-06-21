-- Enhance orders table for complete checkout system
-- Run this in Supabase SQL Editor

-- Add additional fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(50) UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);

-- Rename total_amount to total for consistency
ALTER TABLE orders RENAME COLUMN total_amount TO total;

-- Create a function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                     LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0') || '-' ||
                     LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0') || '-' ||
                     LPAD(NEW.id::TEXT, 8, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order numbers
DROP TRIGGER IF EXISTS generate_order_number_trigger ON orders;
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Update RLS policies to use the custom function
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (get_current_user_id() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (get_current_user_id() = user_id);

CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (get_current_user_id() = user_id);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position; 