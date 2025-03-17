-- Script to fix purchase names in the database
-- Run this in the Supabase SQL Editor

-- 1. Check the current user in the auth.users table
-- Replace 'your-email@example.com' with your actual email
SELECT id, email
FROM auth.users
WHERE email = 'your-email@example.com';

-- Note: It appears the auth.users table doesn't have a 'name' column
-- The user's name might be stored elsewhere or derived from other data

-- 2. Check all distinct purchased_by values in the purchases table
SELECT DISTINCT purchased_by 
FROM purchases;

-- 3. Check the current user in the application
-- Since the auth.users table doesn't have a name column, we need to check where the user's name is stored
-- It might be in a separate profile table or in the application code

-- 4. Update purchases to match the user's name in the application
-- Replace 'Your Exact Name' with the name used in the application
-- Replace 'Tommy Indergaard' with the current purchased_by value
UPDATE purchases
SET purchased_by = 'Your Exact Name'
WHERE purchased_by = 'Tommy Indergaard';

-- 5. Verify the changes
SELECT id, product_id, purchased_by, status
FROM purchases
ORDER BY purchased_at DESC;

-- 6. Alternative approach: Modify the application code
-- If you can't update the database, you might need to modify the application code
-- In src/components/dashboard/StoreSection.tsx, find the filter condition:
--   purchases.filter(p => p.purchasedBy === currentUser?.name)
-- And change it to:
--   purchases.filter(p => p.purchasedBy === "Tommy Indergaard")

-- 6. Check if there are any purchases with the completed status
SELECT COUNT(*) 
FROM purchases 
WHERE status = 'completed';

-- 7. Update all purchases to completed status for testing
-- Uncomment this if you want to change all purchases to completed
/*
UPDATE purchases
SET status = 'completed';
*/