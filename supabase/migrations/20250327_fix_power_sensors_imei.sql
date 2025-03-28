-- =============================================
-- FIX POWER SENSORS IMEI MIGRATION SCRIPT
-- =============================================
-- This script modifies the power_sensors table to make IMEI a unique key
-- and creates a function to fetch power sensors by IMEI
-- =============================================

-- First, let's check if there are any duplicate IMEIs
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT imei, COUNT(*) as count
        FROM public.power_sensors
        GROUP BY imei
        HAVING COUNT(*) > 1
    ) as duplicates;

    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Found % IMEIs with duplicates. Will need to handle these before making IMEI unique.', duplicate_count;
    ELSE
        RAISE NOTICE 'No duplicate IMEIs found. Safe to proceed with making IMEI unique.';
    END IF;
END
$$;

-- Remove the unique constraint on IMEI if it exists
ALTER TABLE public.power_sensors DROP CONSTRAINT IF EXISTS power_sensors_imei_key;

-- Add a unique constraint on IMEI
ALTER TABLE public.power_sensors ADD CONSTRAINT power_sensors_imei_key UNIQUE (imei);

-- Create an index on IMEI for faster lookups
DROP INDEX IF EXISTS idx_power_sensors_imei;
CREATE INDEX idx_power_sensors_imei ON public.power_sensors(imei);

-- Create a function to fetch power sensors by IMEI
CREATE OR REPLACE FUNCTION get_power_sensor_by_imei(sensor_imei TEXT)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', id,
        'name', name,
        'imei', imei,
        'status', status,
        'company_id', company_id,
        'folder_id', folder_id,
        'created_at', created_at,
        'updated_at', updated_at
    ) INTO result
    FROM power_sensors
    WHERE imei = sensor_imei;
    
    RETURN COALESCE(result, '{}'::JSONB);
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION get_power_sensor_by_imei TO authenticated;
GRANT EXECUTE ON FUNCTION get_power_sensor_by_imei TO anon;
GRANT EXECUTE ON FUNCTION get_power_sensor_by_imei TO service_role;

-- Create a function to fetch all power sensors without company filtering
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

-- =============================================
-- MIGRATION COMPLETE
-- =============================================