-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view PDF records" ON pdf_records;
DROP POLICY IF EXISTS "Authenticated users can insert PDF records" ON pdf_records;

-- Create more permissive RLS policies
CREATE POLICY "Users can view PDF records" ON pdf_records
    FOR SELECT USING (true);

CREATE POLICY "Users can insert PDF records" ON pdf_records
    FOR INSERT
    WITH CHECK (true);