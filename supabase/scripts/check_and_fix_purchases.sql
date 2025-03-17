-- Script to check and fix purchases in the database
-- Run this in the Supabase SQL Editor

-- 1. Check the purchases table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'purchases'
ORDER BY ordinal_position;

-- 2. Check all purchases in the database
SELECT 
  id, 
  product_id, 
  quantity, 
  total_price, 
  status, 
  purchased_at, 
  purchased_by, 
  company_id, 
  company_name
FROM purchases
ORDER BY purchased_at DESC;

-- 3. Check if there are any purchases with status 'completed'
SELECT COUNT(*) 
FROM purchases 
WHERE status = 'completed';

-- 4. Check if there are any purchases with other statuses
SELECT status, COUNT(*) 
FROM purchases 
GROUP BY status;

-- 5. Check the current user's purchases
-- Replace 'your-username' with the actual username
SELECT * 
FROM purchases 
WHERE purchased_by = 'your-username';

-- 6. Check if there are any case sensitivity issues with the purchased_by field
-- This will show all unique purchased_by values
SELECT DISTINCT purchased_by 
FROM purchases;

-- 7. Fix any purchases with incorrect status
-- Uncomment and modify this if needed
/*
UPDATE purchases
SET status = 'completed'
WHERE id = 'specific-purchase-id';
*/

-- 8. Disable RLS on the purchases table if not already done
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;

-- 9. Create a bypass policy for the purchases table
DROP POLICY IF EXISTS "Bypass RLS for purchases" ON purchases;
CREATE POLICY "Bypass RLS for purchases"
ON purchases
USING (true)
WITH CHECK (true);

-- 10. Insert a test purchase to verify functionality
-- Uncomment and modify this if needed
/*
INSERT INTO purchases (
  id,
  product_id,
  quantity,
  total_price,
  status,
  purchased_at,
  purchased_by,
  company_id,
  company_name
)
VALUES (
  gen_random_uuid(),
  'product-id-here',
  1,
  99.99,
  'completed',
  NOW(),
  'your-username',
  'company-id-here',
  'Company Name'
)
RETURNING *;
*/