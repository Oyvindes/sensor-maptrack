-- Create PDF records table
CREATE TABLE pdf_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    folder_id UUID REFERENCES sensor_folders(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    creator_name TEXT
);

-- Add RLS policies
ALTER TABLE pdf_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view PDF records" ON pdf_records
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert PDF records" ON pdf_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');