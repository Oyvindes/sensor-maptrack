-- Script to check the actual values in the purchases table
-- Run this in the Supabase SQL Editor

-- 1. Check all purchases in the database
SELECT 
  id, 
  product_id, 
  status,
  purchased_by,
  company_name,
  purchased_at
FROM purchases
ORDER BY purchased_at DESC;

-- 2. Check all users in the auth.users table
SELECT id, email
FROM auth.users
LIMIT 10;

-- 3. Check all users in the users table (if it exists)
SELECT id, name, email, role
FROM users
LIMIT 10;

-- 4. Update a specific purchase to match a specific user
-- Replace 'purchase-id-here' with the actual purchase ID
-- Replace 'Exact User Name' with the exact name from the user's profile
/*
UPDATE purchases
SET purchased_by = 'Exact User Name'
WHERE id = 'purchase-id-here';
*/

-- 5. Update all purchases to have the same purchased_by value
-- Replace 'Exact User Name' with the exact name from the user's profile
/*
UPDATE purchases
SET purchased_by = 'Exact User Name';
*/