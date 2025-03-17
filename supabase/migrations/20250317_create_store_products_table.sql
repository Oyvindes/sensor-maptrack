-- Create products table for the store functionality
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

-- Add RLS (Row Level Security) policies
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

-- Add indexes
CREATE INDEX IF NOT EXISTS products_name_idx ON products (name);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at);

-- Add triggers for updated_at
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

-- Add comments
COMMENT ON TABLE products IS 'Store products that can be purchased by admins';
COMMENT ON COLUMN products.id IS 'Unique identifier for the product';
COMMENT ON COLUMN products.name IS 'Product name';
COMMENT ON COLUMN products.description IS 'Product description';
COMMENT ON COLUMN products.price IS 'Product price';
COMMENT ON COLUMN products.image_url IS 'URL to the product image';
COMMENT ON COLUMN products.created_at IS 'Timestamp when the product was created';
COMMENT ON COLUMN products.created_by IS 'User who created the product';
COMMENT ON COLUMN products.updated_at IS 'Timestamp when the product was last updated';