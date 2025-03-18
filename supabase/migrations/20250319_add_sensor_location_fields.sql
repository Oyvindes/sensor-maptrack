-- Add sensor_locations and sensor_zones columns to sensor_folders table
ALTER TABLE sensor_folders
ADD COLUMN sensor_locations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN sensor_zones JSONB DEFAULT '{}'::jsonb;

-- Add comment to explain the columns
COMMENT ON COLUMN sensor_folders.sensor_locations IS 'JSON mapping of sensor IMEI to location name (e.g., livingroom, kitchen)';
COMMENT ON COLUMN sensor_folders.sensor_zones IS 'JSON mapping of sensor IMEI to zone type (wet or dry)';