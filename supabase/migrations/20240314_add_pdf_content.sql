-- Add PDF content column to store the actual PDF data
ALTER TABLE pdf_records
ADD COLUMN content_base64 TEXT;

-- Update existing RLS policies to include the new column
DROP POLICY IF EXISTS "Users can view PDF records" ON pdf_records;
DROP POLICY IF EXISTS "Users can insert PDF records" ON pdf_records;

CREATE POLICY "Users can view PDF records" ON pdf_records
    FOR SELECT USING (true);

CREATE POLICY "Users can insert PDF records" ON pdf_records
    FOR INSERT WITH CHECK (true);