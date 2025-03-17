-- Script to fix Row Level Security (RLS) policies for the products table
-- Run this in the Supabase SQL Editor

-- 1. Enable RLS on the products table if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Only site admins can create products" ON products;
DROP POLICY IF EXISTS "Only site admins can update products" ON products;
DROP POLICY IF EXISTS "Only site admins can delete products" ON products;

-- 3. Create policy to allow anyone to view products
CREATE POLICY "Anyone can view products"
ON products FOR SELECT
USING (true);

-- 4. Create policy to allow site admins to create products
-- This policy allows any user with role 'master' to create products
CREATE POLICY "Only site admins can create products"
ON products FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'master'
  )
);

-- 5. Create policy to allow site admins to update products
CREATE POLICY "Only site admins can update products"
ON products FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'master'
  )
);

-- 6. Create policy to allow site admins to delete products
CREATE POLICY "Only site admins can delete products"
ON products FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'master'
  )
);

-- 7. Alternative: Create permissive policies that allow any authenticated user to manage products
-- Uncomment these if you want to allow any user to create/update/delete products

/*
DROP POLICY IF EXISTS "Anyone can create products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;

CREATE POLICY "Anyone can create products"
ON products FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone can update products"
ON products FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can delete products"
ON products FOR DELETE
USING (auth.role() = 'authenticated');
*/

-- 8. Check if your user has the 'master' role
-- Replace 'your-email@example.com' with your actual email
SELECT id, email, role FROM auth.users WHERE email = 'your-email@example.com';

-- 9. Update your user role to 'master' if needed
-- Replace 'your-user-id' with your actual user ID from the query above
-- UPDATE auth.users SET role = 'master' WHERE id = 'your-user-id';