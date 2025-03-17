-- Simple SQL script to add order references to purchases table
-- Copy and paste this entire script into the Supabase SQL Editor

-- Add customer_reference column for customer-provided reference numbers
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS customer_reference TEXT;

-- Add order_reference column for system-generated reference numbers
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS order_reference TEXT;

-- Create a function to generate a unique order reference
CREATE OR REPLACE FUNCTION generate_order_reference()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  company_prefix TEXT;
BEGIN
  -- Extract year and month for the reference (format: YYMM)
  year_part := to_char(NEW.purchased_at, 'YYMM');
  
  -- Get company prefix (first 3 letters of company name, uppercase)
  company_prefix := upper(substring(NEW.company_name, 1, 3));
  
  -- Get the next sequence number for this year/month
  SELECT COALESCE(MAX(SUBSTRING(order_reference, 10)::INTEGER), 0) + 1 INTO sequence_num
  FROM purchases
  WHERE order_reference LIKE year_part || '-' || company_prefix || '-%';
  
  -- Format: YYMM-CCC-NNNN (Year/Month-CompanyPrefix-SequenceNumber)
  NEW.order_reference := year_part || '-' || company_prefix || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate order_reference for new purchases
CREATE OR REPLACE TRIGGER set_order_reference
BEFORE INSERT ON purchases
FOR EACH ROW
WHEN (NEW.order_reference IS NULL)
EXECUTE FUNCTION generate_order_reference();

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS purchases_customer_reference_idx ON purchases (customer_reference);
CREATE INDEX IF NOT EXISTS purchases_order_reference_idx ON purchases (order_reference);

-- Add comments for the new columns
COMMENT ON COLUMN purchases.customer_reference IS 'Customer-provided reference number for invoicing';
COMMENT ON COLUMN purchases.order_reference IS 'System-generated unique order reference (format: YYMM-CCC-NNNN)';

-- Update existing purchases to have an order reference
-- This will generate references for all existing purchases that don't have one
DO $$
DECLARE
  purchase_record RECORD;
  year_part TEXT;
  company_prefix TEXT;
  sequence_num INTEGER;
  new_reference TEXT;
BEGIN
  FOR purchase_record IN 
    SELECT * FROM purchases 
    WHERE order_reference IS NULL
    ORDER BY purchased_at
  LOOP
    -- Extract year and month
    year_part := to_char(purchase_record.purchased_at, 'YYMM');
    
    -- Get company prefix
    company_prefix := upper(substring(purchase_record.company_name, 1, 3));
    
    -- Get next sequence number
    SELECT COALESCE(MAX(SUBSTRING(order_reference, 10)::INTEGER), 0) + 1 INTO sequence_num
    FROM purchases
    WHERE order_reference LIKE year_part || '-' || company_prefix || '-%';
    
    -- Create reference
    new_reference := year_part || '-' || company_prefix || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    -- Update the purchase
    UPDATE purchases 
    SET order_reference = new_reference
    WHERE id = purchase_record.id;
    
    RAISE NOTICE 'Updated purchase % with reference %', purchase_record.id, new_reference;
  END LOOP;
END;
$$;

-- Verify the columns were added
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM 
  information_schema.columns 
WHERE 
  table_name = 'purchases' 
  AND column_name IN ('customer_reference', 'order_reference');