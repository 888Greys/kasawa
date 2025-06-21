-- Add featured field to products table
-- Run this in Supabase SQL Editor

-- Add the featured column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Update some products to be featured (you can modify these as needed)
UPDATE products 
SET featured = true 
WHERE name IN ('OG Kush Premium Flower', 'Sour Diesel Sativa', 'Live Resin Concentrate')
OR id IN (
  SELECT id FROM products 
  WHERE category = 'flower' 
  LIMIT 2
);

-- Verify the changes
SELECT id, name, featured FROM products ORDER BY featured DESC, name; 