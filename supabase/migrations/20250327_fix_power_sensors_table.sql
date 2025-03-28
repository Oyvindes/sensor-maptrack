-- =============================================
-- FIX POWER SENSORS TABLE MIGRATION SCRIPT
-- =============================================
-- This script adds the sensor_type column to the power_sensors table if it doesn't exist
-- =============================================

-- Check if the sensor_type column exists in the power_sensors table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'power_sensors' 
        AND column_name = 'sensor_type'
    ) THEN
        -- Add the sensor_type column to the power_sensors table
        ALTER TABLE public.power_sensors ADD COLUMN sensor_type TEXT DEFAULT 'power';
        
        RAISE NOTICE 'Added sensor_type column to power_sensors table with default value ''power''';
    ELSE
        RAISE NOTICE 'sensor_type column already exists in power_sensors table';
    END IF;
END
$$;

-- Update all existing power sensors to have sensor_type = 'power'
UPDATE public.power_sensors
SET sensor_type = 'power'
WHERE sensor_type IS NULL OR sensor_type != 'power';

-- Create or replace the get_all_power_sensors function to include the sensor_type field
CREATE OR REPLACE FUNCTION get_all_power_sensors()
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'name', name,
            'imei', imei,
            'status', status,
            'company_id', company_id,
            'folder_id', folder_id,
            'sensor_type', sensor_type,
            'created_at', created_at,
            'updated_at', updated_at
        )
    ) INTO result
    FROM power_sensors;
    
    RETURN COALESCE(result, '[]'::JSONB);
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION get_all_power_sensors TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_power_sensors TO anon;
GRANT EXECUTE ON FUNCTION get_all_power_sensors TO service_role;

-- Create indexes for better performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'power_sensors_pkey'
    ) THEN
        CREATE UNIQUE INDEX power_sensors_pkey ON public.power_sensors USING btree (id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'power_sensors_imei_key'
    ) THEN
        CREATE UNIQUE INDEX power_sensors_imei_key ON public.power_sensors USING btree (imei);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_power_sensors_company_id'
    ) THEN
        CREATE INDEX idx_power_sensors_company_id ON public.power_sensors USING btree (company_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_power_sensors_imei'
    ) THEN
        CREATE INDEX idx_power_sensors_imei ON public.power_sensors USING btree (imei);
    END IF;
END
$$;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================