-- Script to check and fix database issues
-- Run this in the Supabase SQL Editor

-- 1. Check if the products table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'products'
);

-- 2. Check the structure of the products table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'products'
ORDER BY ordinal_position;

-- 3. Check if RLS is enabled on the products table
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'products';

-- 4. Check existing RLS policies on the products table
SELECT * FROM pg_policies
WHERE tablename = 'products';

-- 5. Check the current user's role and authentication status
SELECT auth.uid() as user_id, auth.role() as user_role;

-- 6. Check if the user exists in auth.users
SELECT id, email, role
FROM auth.users
WHERE id = auth.uid();

-- 7. IMPORTANT: Disable RLS on the products table temporarily
-- This will allow operations regardless of policies
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 8. Create a bypass policy for the products table
-- This policy allows all operations for all users
DROP POLICY IF EXISTS "Bypass RLS for products" ON products;
CREATE POLICY "Bypass RLS for products"
ON products
USING (true)
WITH CHECK (true);

-- 9. Check if there are any products in the table
SELECT COUNT(*) FROM products;

-- 10. Try to insert a test product directly
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
  'This is a test product created by the check_and_fix_db.sql script',
  99.99,
  NOW(),
  'System'
)
RETURNING *;

-- 11. OPTIONAL: Re-enable RLS if you want to use policies later
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;