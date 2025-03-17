-- Create purchases table for the store functionality
-- This file should be run AFTER the products table is created

-- First check if products table exists, if not, raise an error
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products') THEN
    RAISE EXCEPTION 'Products table does not exist. Please run the products migration first.';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'packaging', 'sent', 'invoiced', 'completed')),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  purchased_by TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  company_name TEXT NOT NULL,
  updated_at TIMESTAMPTZ,
  notes TEXT
);

-- Add RLS (Row Level Security) policies
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own company's purchases
CREATE POLICY "Users can view their company's purchases" ON purchases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::uuid
      AND users.company_id::uuid = purchases.company_id
    )
  );

-- Policy: Site admins can view all purchases
CREATE POLICY "Site admins can view all purchases" ON purchases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::uuid
      AND users.role = 'master'
    )
  );

-- Policy: Users can create purchases for their own company
CREATE POLICY "Users can create purchases for their company" ON purchases
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::uuid
      AND users.company_id::uuid = purchases.company_id
    )
  );

-- Policy: Only site admins can update purchase status
CREATE POLICY "Site admins can update purchase status" ON purchases
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::uuid
      AND users.role = 'master'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::uuid
      AND users.role = 'master'
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS purchases_product_id_idx ON purchases (product_id);
CREATE INDEX IF NOT EXISTS purchases_company_id_idx ON purchases (company_id);
CREATE INDEX IF NOT EXISTS purchases_status_idx ON purchases (status);
CREATE INDEX IF NOT EXISTS purchases_purchased_at_idx ON purchases (purchased_at);

-- Add triggers for updated_at
CREATE TRIGGER update_purchases_updated_at
BEFORE UPDATE ON purchases
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add comments
COMMENT ON TABLE purchases IS 'Store purchases made by company admins';
COMMENT ON COLUMN purchases.id IS 'Unique identifier for the purchase';
COMMENT ON COLUMN purchases.product_id IS 'Reference to the purchased product';
COMMENT ON COLUMN purchases.quantity IS 'Number of items purchased';
COMMENT ON COLUMN purchases.total_price IS 'Total price of the purchase';
COMMENT ON COLUMN purchases.status IS 'Current status of the purchase (pending, in_progress, packaging, sent, invoiced, completed)';
COMMENT ON COLUMN purchases.purchased_at IS 'Timestamp when the purchase was made';
COMMENT ON COLUMN purchases.purchased_by IS 'User who made the purchase';
COMMENT ON COLUMN purchases.company_id IS 'Company ID that made the purchase';
COMMENT ON COLUMN purchases.company_name IS 'Company name that made the purchase';
COMMENT ON COLUMN purchases.updated_at IS 'Timestamp when the purchase was last updated';
COMMENT ON COLUMN purchases.notes IS 'Additional notes for the purchase';