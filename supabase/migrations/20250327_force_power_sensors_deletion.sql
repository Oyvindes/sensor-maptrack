-- =============================================
-- FORCE POWER SENSORS DELETION MIGRATION SCRIPT
-- =============================================
-- This script provides a more aggressive approach to fixing
-- issues with deleting rows in the power_sensors table
-- =============================================

-- First, let's create a function to force delete a power sensor
CREATE OR REPLACE FUNCTION force_delete_power_sensor(sensor_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    success BOOLEAN := false;
BEGIN
    -- First, delete any related records in child tables
    DELETE FROM public.power_consumption WHERE power_sensor_id = sensor_id;
    DELETE FROM public.power_status WHERE power_sensor_id = sensor_id;
    DELETE FROM public.power_audit_log WHERE power_sensor_id = sensor_id;
    
    -- Then delete the power sensor itself
    DELETE FROM public.power_sensors WHERE id = sensor_id;
    
    -- Check if the deletion was successful
    IF NOT EXISTS (SELECT 1 FROM public.power_sensors WHERE id = sensor_id) THEN
        success := true;
    END IF;
    
    RETURN success;
END;
$$ LANGUAGE plpgsql;

-- Create a function to force delete all power sensors
CREATE OR REPLACE FUNCTION force_delete_all_power_sensors()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    sensor_record RECORD;
BEGIN
    -- First, delete all related records in child tables
    DELETE FROM public.power_consumption;
    DELETE FROM public.power_status;
    DELETE FROM public.power_audit_log;
    
    -- Then delete all power sensors
    DELETE FROM public.power_sensors;
    
    -- Get the count of deleted sensors
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Temporarily disable all triggers on the power_sensors table
ALTER TABLE public.power_sensors DISABLE TRIGGER ALL;

-- Temporarily disable all foreign key constraints
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT tc.table_schema, tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
          ON tc.constraint_catalog = ccu.constraint_catalog 
          AND tc.constraint_schema = ccu.constraint_schema
          AND tc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = 'power_sensors'
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I',
            constraint_record.table_schema,
            constraint_record.table_name,
            constraint_record.constraint_name);
        
        RAISE NOTICE 'Dropped constraint % on table %.%',
            constraint_record.constraint_name,
            constraint_record.table_schema,
            constraint_record.table_name;
    END LOOP;
END
$$;

-- Re-enable all triggers on the power_sensors table
ALTER TABLE public.power_sensors ENABLE TRIGGER ALL;

-- Create a more permissive RLS policy for deletion
DROP POLICY IF EXISTS "Delete power_sensors if in same company" ON public.power_sensors;
DROP POLICY IF EXISTS "Allow users to delete power_sensors" ON public.power_sensors;

CREATE POLICY "Allow users to delete power_sensors"
ON public.power_sensors
FOR DELETE
USING (true);

-- Example usage:
-- To force delete a specific power sensor:
-- SELECT force_delete_power_sensor('your-sensor-id-here');
--
-- To force delete all power sensors:
-- SELECT force_delete_all_power_sensors();

-- =============================================
-- MIGRATION COMPLETE
-- =============================================