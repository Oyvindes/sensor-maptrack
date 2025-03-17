-- Script to check and fix storage issues
-- Run this in the Supabase SQL Editor

-- 1. Check if the storage extension is installed
SELECT * FROM pg_extension WHERE extname = 'pg_net';
SELECT * FROM pg_extension WHERE extname = 'storage';

-- 2. Check if the storage schema exists
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'storage';

-- 3. Check if the storage.buckets table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'storage' 
  AND table_name = 'buckets'
);

-- 4. Check if the storage.objects table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'storage' 
  AND table_name = 'objects'
);

-- 5. Check existing buckets
SELECT * FROM storage.buckets;

-- 6. Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- 7. Disable RLS on storage.objects to allow any operation
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 8. Create a bypass policy for storage.objects
DROP POLICY IF EXISTS "Bypass RLS for objects" ON storage.objects;
CREATE POLICY "Bypass RLS for objects"
ON storage.objects
USING (true)
WITH CHECK (true);

-- 9. Check if there are any objects in the storage
SELECT * FROM storage.objects LIMIT 10;

-- 10. Insert a test object to verify functionality
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

-- 11. Get information about the test object
SELECT
  storage.buckets.public,
  storage.objects.bucket_id,
  storage.objects.name,
  CONCAT(
    'https://your-project-url.supabase.co',
    '/storage/v1/object/public/',
    storage.objects.bucket_id,
    '/',
    storage.objects.name
  ) AS example_public_url
FROM storage.objects
JOIN storage.buckets ON storage.objects.bucket_id = storage.buckets.id
WHERE storage.objects.bucket_id = 'product-images'
AND storage.objects.name = 'test-image.jpg';

-- Note: Replace 'your-project-url.supabase.co' with your actual Supabase project URL
-- The actual URL will be provided by the Supabase Storage UI when you view the bucket