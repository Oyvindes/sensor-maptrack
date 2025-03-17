-- Script to remove restrictive storage policies and replace with more permissive ones
-- Run this in the Supabase SQL Editor

-- 1. Create the product-images bucket if it doesn't exist (with public access)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if they exist
DO $$
BEGIN
  -- Drop existing policies if they exist
  BEGIN
    DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
  EXCEPTION
    WHEN undefined_object THEN
      RAISE NOTICE 'Policy "Anyone can view product images" does not exist, skipping.';
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Site admins can upload product images" ON storage.objects;
  EXCEPTION
    WHEN undefined_object THEN
      RAISE NOTICE 'Policy "Site admins can upload product images" does not exist, skipping.';
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Site admins can update product images" ON storage.objects;
  EXCEPTION
    WHEN undefined_object THEN
      RAISE NOTICE 'Policy "Site admins can update product images" does not exist, skipping.';
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Site admins can delete product images" ON storage.objects;
  EXCEPTION
    WHEN undefined_object THEN
      RAISE NOTICE 'Policy "Site admins can delete product images" does not exist, skipping.';
  END;

  BEGIN
    DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;
  EXCEPTION
    WHEN undefined_object THEN
      RAISE NOTICE 'Policy "Anyone can upload product images" does not exist, skipping.';
  END;

  BEGIN
    DROP POLICY IF EXISTS "Anyone can update product images" ON storage.objects;
  EXCEPTION
    WHEN undefined_object THEN
      RAISE NOTICE 'Policy "Anyone can update product images" does not exist, skipping.';
  END;

  BEGIN
    DROP POLICY IF EXISTS "Anyone can delete product images" ON storage.objects;
  EXCEPTION
    WHEN undefined_object THEN
      RAISE NOTICE 'Policy "Anyone can delete product images" does not exist, skipping.';
  END;
END $$;

-- 3. Create new permissive policies that allow any authenticated user to perform operations

-- Policy for viewing images (public)
CREATE POLICY "Anyone can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Policy for uploading images (any authenticated user)
CREATE POLICY "Anyone can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );

-- Policy for updating images (any authenticated user)
CREATE POLICY "Anyone can update product images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );

-- Policy for deleting images (any authenticated user)
CREATE POLICY "Anyone can delete product images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );

-- 4. Verify the bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- Note: The storage.policies table doesn't exist in this Supabase instance
-- Policies are created directly on the tables