-- Script to fix purchases for a specific admin
-- Run this in the Supabase SQL Editor

-- 1. First, check the current user's name and company ID
-- Replace 'admin-email@example.com' with the actual admin's email
SELECT id, name, email, company_id
FROM users
WHERE email = 'tommy@servicealliansen.no';

-- 2. Check all purchases in the database
SELECT 
  id, 
  product_id, 
  status,
  purchased_by,
  company_id,
  company_name
FROM purchases
ORDER BY purchased_at DESC;

-- 3. Update all purchases to match the admin's name and company ID
-- Replace 'Tommy Indergaard' with the exact name from step 1
-- Replace 'c36b5e75-f4f6-41b0-9552-8d2685bbe23f' with the company_id from step 1
UPDATE purchases
SET 
  purchased_by = 'Tommy Indergaard',
  company_id = 'c36b5e75-f4f6-41b0-9552-8d2685bbe23f',
  company_name = 'Service Alliansen'
WHERE status = 'completed';

-- 4. Verify the changes
SELECT 
  id, 
  product_id, 
  status,
  purchased_by,
  company_id,
  company_name
FROM purchases
ORDER BY purchased_at DESC;