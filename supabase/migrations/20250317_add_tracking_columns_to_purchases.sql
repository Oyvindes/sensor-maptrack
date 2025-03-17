-- Add tracking columns to purchases table

-- Add tracking_number column
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Add carrier column
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS carrier TEXT;

-- Add shipped_date column
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS shipped_date TIMESTAMPTZ;

-- Add comments for the new columns
COMMENT ON COLUMN purchases.tracking_number IS 'Tracking number for shipped purchases';
COMMENT ON COLUMN purchases.carrier IS 'Shipping carrier (e.g., DHL, FedEx)';
COMMENT ON COLUMN purchases.shipped_date IS 'Date when the purchase was shipped';

-- Create index for tracking_number
CREATE INDEX IF NOT EXISTS purchases_tracking_number_idx ON purchases (tracking_number);