-- Add report_type column to pdf_records table
ALTER TABLE pdf_records ADD COLUMN IF NOT EXISTS report_type TEXT DEFAULT 'pdf';

-- Add comment to the column
COMMENT ON COLUMN pdf_records.report_type IS 'Type of report (pdf or html)';