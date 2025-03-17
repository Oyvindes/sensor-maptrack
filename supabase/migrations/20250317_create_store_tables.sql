-- Combined migration file for store functionality
-- This file creates both the products and purchases tables in the correct order

-- First, create the products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NOT NULL,
  updated_at TIMESTAMPTZ
);

-- Add RLS (Row Level Security) policies for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Only site-wide admins can insert/update/delete products
CREATE POLICY "Site admins can manage products" ON products
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

-- Policy: All authenticated users can view products
CREATE POLICY "All authenticated users can view products" ON products
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
  );

-- Add indexes for products
CREATE INDEX IF NOT EXISTS products_name_idx ON products (name);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at);

-- Add triggers for updated_at in products
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add comments for products table
COMMENT ON TABLE products IS 'Store products that can be purchased by admins';
COMMENT ON COLUMN products.id IS 'Unique identifier for the product';
COMMENT ON COLUMN products.name IS 'Product name';
COMMENT ON COLUMN products.description IS 'Product description';
COMMENT ON COLUMN products.price IS 'Product price';
COMMENT ON COLUMN products.image_url IS 'URL to the product image';
COMMENT ON COLUMN products.created_at IS 'Timestamp when the product was created';
COMMENT ON COLUMN products.created_by IS 'User who created the product';
COMMENT ON COLUMN products.updated_at IS 'Timestamp when the product was last updated';

-- Now, create the purchases table
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
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  order_details TEXT,
  updated_at TIMESTAMPTZ,
  notes TEXT
);

-- Add RLS (Row Level Security) policies for purchases
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

-- Add indexes for purchases
CREATE INDEX IF NOT EXISTS purchases_product_id_idx ON purchases (product_id);
CREATE INDEX IF NOT EXISTS purchases_company_id_idx ON purchases (company_id);
CREATE INDEX IF NOT EXISTS purchases_status_idx ON purchases (status);
CREATE INDEX IF NOT EXISTS purchases_purchased_at_idx ON purchases (purchased_at);

-- Add triggers for updated_at in purchases
CREATE TRIGGER update_purchases_updated_at
BEFORE UPDATE ON purchases
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add comments for purchases table
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
COMMENT ON COLUMN purchases.shipping_address IS 'Shipping address for the purchase';
COMMENT ON COLUMN purchases.shipping_city IS 'Shipping city for the purchase';
COMMENT ON COLUMN purchases.shipping_postal_code IS 'Shipping postal code for the purchase';
COMMENT ON COLUMN purchases.shipping_country IS 'Shipping country for the purchase';
COMMENT ON COLUMN purchases.contact_email IS 'Contact email for the purchase';
COMMENT ON COLUMN purchases.contact_phone IS 'Contact phone for the purchase';
COMMENT ON COLUMN purchases.order_details IS 'Additional order details for the purchase';
COMMENT ON COLUMN purchases.updated_at IS 'Timestamp when the purchase was last updated';
COMMENT ON COLUMN purchases.notes IS 'Additional notes for the purchase';