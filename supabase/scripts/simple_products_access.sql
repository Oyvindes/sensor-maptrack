-- Simple script to allow any authenticated user to access the products table
-- Run this in the Supabase SQL Editor

-- 1. Enable RLS on the products table if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Only site admins can create products" ON products;
DROP POLICY IF EXISTS "Only site admins can update products" ON products;
DROP POLICY IF EXISTS "Only site admins can delete products" ON products;
DROP POLICY IF EXISTS "Anyone can create products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;

-- 3. Create simple permissive policies
-- Allow anyone to view products
CREATE POLICY "Anyone can view products"
ON products FOR SELECT
USING (true);

-- Allow any authenticated user to create products
CREATE POLICY "Anyone can create products"
ON products FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow any authenticated user to update products
CREATE POLICY "Anyone can update products"
ON products FOR UPDATE
USING (auth.role() = 'authenticated');

-- Allow any authenticated user to delete products
CREATE POLICY "Anyone can delete products"
ON products FOR DELETE
USING (auth.role() = 'authenticated');

-- 4. Verify your user is authenticated
SELECT auth.uid(), auth.role();