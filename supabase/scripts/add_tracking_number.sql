-- Script to add tracking number to purchases table
-- Run this in the Supabase SQL Editor

-- 1. Add tracking_number column to purchases table
ALTER TABLE purchases
ADD COLUMN tracking_number TEXT;

-- 2. Add carrier column to purchases table
ALTER TABLE purchases
ADD COLUMN carrier TEXT;

-- 3. Add shipped_date column to purchases table
ALTER TABLE purchases
ADD COLUMN shipped_date TIMESTAMP WITH TIME ZONE;

-- 4. Check the updated schema
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'purchases';

-- 5. Update some existing purchases with tracking information (for testing)
UPDATE purchases
SET 
  tracking_number = 'TN123456789',
  carrier = 'DHL',
  shipped_date = NOW()
WHERE 
  status = 'sent' OR status = 'completed';