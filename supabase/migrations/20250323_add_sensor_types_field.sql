-- Add sensor_types column to sensor_folders table
ALTER TABLE sensor_folders
ADD COLUMN sensor_types JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN sensor_folders.sensor_types IS 'JSON mapping of sensor IMEI to material type (wood or concrete)';