-- This migration changes the project_start_date and project_end_date columns
-- from date type to timestamptz type to store both date and time information

-- First, alter the project_start_date column
ALTER TABLE sensor_folders
ALTER COLUMN project_start_date TYPE timestamptz
USING project_start_date::timestamptz AT TIME ZONE 'UTC';

-- Then, alter the project_end_date column
ALTER TABLE sensor_folders
ALTER COLUMN project_end_date TYPE timestamptz
USING project_end_date::timestamptz AT TIME ZONE 'UTC';

-- Add a comment to explain the change
COMMENT ON COLUMN sensor_folders.project_start_date IS 'Project start date and time (timestamp with timezone)';
COMMENT ON COLUMN sensor_folders.project_end_date IS 'Project end date and time (timestamp with timezone)';

-- Set the timezone to UTC for consistency
SET timezone = 'UTC';