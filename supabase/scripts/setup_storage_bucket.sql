-- Script to set up storage bucket for product images
-- Run this in the Supabase SQL Editor

-- 1. Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- 2. Create a policy to allow authenticated users to view product images
CREATE POLICY "Anyone can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- 3. Create a policy to allow site admins to upload product images
CREATE POLICY "Site admins can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    (auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'master'
    ))
  );

-- 4. Create a policy to allow site admins to update product images
CREATE POLICY "Site admins can update product images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    (auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'master'
    ))
  );

-- 5. Create a policy to allow site admins to delete product images
CREATE POLICY "Site admins can delete product images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    (auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'master'
    ))
  );

-- 6. Handle policy conflicts (in case policies already exist)
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
END $$;

-- 7. Recreate the policies
CREATE POLICY "Anyone can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Site admins can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    (auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'master'
    ))
  );

CREATE POLICY "Site admins can update product images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    (auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'master'
    ))
  );

CREATE POLICY "Site admins can delete product images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    (auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'master'
    ))
  );

-- 8. Verify the bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-images';