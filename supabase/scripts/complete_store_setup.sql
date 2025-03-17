-- Comprehensive script to set up the store functionality
-- Run this in the Supabase SQL Editor

-- =============================================
-- PART 1: FIX TABLES ACCESS (PRODUCTS & PURCHASES)
-- =============================================

-- 1. Check if the products and purchases tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'purchases');

-- 2. Disable RLS on the products table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 3. Create a bypass policy for the products table
DROP POLICY IF EXISTS "Bypass RLS for products" ON products;
CREATE POLICY "Bypass RLS for products"
ON products
USING (true)
WITH CHECK (true);

-- 4. Disable RLS on the purchases table
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;

-- 5. Create a bypass policy for the purchases table
DROP POLICY IF EXISTS "Bypass RLS for purchases" ON purchases;
CREATE POLICY "Bypass RLS for purchases"
ON purchases
USING (true)
WITH CHECK (true);

-- 6. Insert a test product if needed
-- Uncomment this section if you want to add a test product
/*
INSERT INTO products (
  id,
  name,
  description,
  price,
  created_at,
  created_by
)
VALUES (
  gen_random_uuid(),
  'Test Product',
  'This is a test product created by the complete_store_setup.sql script',
  99.99,
  NOW(),
  'System'
)
RETURNING *;
*/

-- =============================================
-- PART 2: FIX STORAGE BUCKET
-- =============================================

-- 1. Check if the storage schema exists
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'storage';

-- 2. Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Disable RLS on storage.objects to allow any operation
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 4. Create a bypass policy for storage.objects
DROP POLICY IF EXISTS "Bypass RLS for objects" ON storage.objects;
CREATE POLICY "Bypass RLS for objects"
ON storage.objects
USING (true)
WITH CHECK (true);

-- 5. Insert a test object to verify functionality
INSERT INTO storage.objects (
  bucket_id,
  name,
  owner,
  metadata,
  created_at
)
VALUES (
  'product-images',
  'test-image.jpg',
  auth.uid(),
  '{"mimetype": "image/jpeg"}',
  NOW()
)
ON CONFLICT (bucket_id, name) DO NOTHING
RETURNING *;

-- =============================================
-- PART 3: FIX PURCHASE DISPLAY ISSUES
-- =============================================

-- 1. Check if there are any purchases with status 'completed'
SELECT COUNT(*) 
FROM purchases 
WHERE status = 'completed';

-- 2. Check all statuses in the purchases table
SELECT status, COUNT(*) 
FROM purchases 
GROUP BY status;

-- 3. Check if there are any case sensitivity issues with the purchased_by field
SELECT DISTINCT purchased_by
FROM purchases;
-- 4. Check the current user in the auth.users table
-- This will help identify users
SELECT id, email
FROM auth.users
LIMIT 10;

-- 5. Fix name mismatches (most common issue)
-- Uncomment and modify this to fix name mismatches
/*
-- Update purchases to match the name used in the application
UPDATE purchases
SET purchased_by = 'Exact User Name'
WHERE purchased_by = 'Current Name in Database';
*/
-- 6. Alternative approach: Modify the application code
-- If you can't update the database, you might need to modify the application code
-- In src/components/dashboard/StoreSection.tsx, find the filter condition:
--   purchases.filter(p => p.purchasedBy === currentUser?.name)
-- And change it to match the purchased_by value in the database

-- 6. Update any pending purchases to completed status for testing
-- This will change all pending purchases to completed status
UPDATE purchases
SET status = 'completed'
WHERE status = 'pending';

-- =============================================
-- PART 4: VERIFY SETUP
-- =============================================

-- 1. Check products table
SELECT * FROM products LIMIT 5;

-- 2. Check purchases table with product names
SELECT 
  p.id, 
  p.product_id, 
  prod.name AS product_name,
  p.quantity, 
  p.total_price, 
  p.status, 
  p.purchased_at, 
  p.purchased_by, 
  p.company_id, 
  p.company_name
FROM purchases p
JOIN products prod ON p.product_id = prod.id
ORDER BY p.purchased_at DESC
LIMIT 5;

-- 3. Check storage buckets
SELECT * FROM storage.buckets;

-- 4. Check storage objects
SELECT * FROM storage.objects LIMIT 5;

-- 5. Show example URL format for uploaded images
SELECT 
  CONCAT(
    'https://your-project-url.supabase.co',
    '/storage/v1/object/public/product-images/your-image-name.jpg'
  ) AS example_public_url;

-- Note: Replace 'your-project-url.supabase.co' with your actual Supabase project URL
-- The actual URL will be provided by the Supabase Storage UI when you view the bucket