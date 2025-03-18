-- Add project_start_date and project_end_date columns to sensor_folders table
ALTER TABLE sensor_folders
ADD COLUMN project_start_date DATE,
ADD COLUMN project_end_date DATE;

-- Add comments to explain the columns
COMMENT ON COLUMN sensor_folders.project_start_date IS 'Calendar date when project is scheduled to start';
COMMENT ON COLUMN sensor_folders.project_end_date IS 'Calendar date when project is scheduled to end';