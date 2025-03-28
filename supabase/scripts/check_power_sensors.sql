-- =============================================
-- CHECK POWER SENSORS SCRIPT
-- =============================================
-- This script checks if there are any power sensors in the database
-- and provides diagnostic information
-- =============================================

-- Check if the power_sensors table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'power_sensors'
    ) THEN
        RAISE NOTICE 'power_sensors table exists';
    ELSE
        RAISE NOTICE 'power_sensors table does not exist';
    END IF;
END
$$;

-- Count the number of power sensors
SELECT COUNT(*) AS power_sensor_count FROM public.power_sensors;

-- List all power sensors
SELECT 
    id, 
    name, 
    imei, 
    status, 
    company_id, 
    folder_id, 
    created_at, 
    updated_at 
FROM public.power_sensors;

-- Check if the get_all_power_sensors function exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_proc
        WHERE proname = 'get_all_power_sensors'
    ) THEN
        RAISE NOTICE 'get_all_power_sensors function exists';
    ELSE
        RAISE NOTICE 'get_all_power_sensors function does not exist';
    END IF;
END
$$;

-- Test the get_all_power_sensors function if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_proc
        WHERE proname = 'get_all_power_sensors'
    ) THEN
        RAISE NOTICE 'Testing get_all_power_sensors function:';
        PERFORM get_all_power_sensors();
    END IF;
END
$$;

-- Check if there are any RLS policies on the power_sensors table
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies
WHERE tablename = 'power_sensors';

-- Check if there are any foreign key constraints on the power_sensors table
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE
    tc.table_name = 'power_sensors'
    AND tc.constraint_type = 'FOREIGN KEY';

-- Check if there are any triggers on the power_sensors table
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'power_sensors';

-- Check if there are any indexes on the power_sensors table
SELECT
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'power_sensors';

-- Check if there are any power_sensors with a sensorType field
SELECT 
    id, 
    name, 
    imei, 
    status, 
    company_id, 
    folder_id, 
    created_at, 
    updated_at 
FROM public.power_sensors
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'power_sensors' 
    AND column_name = 'sensor_type'
) AND sensor_type = 'power';

-- Check if there are any regular sensors with sensorType = 'power'
SELECT 
    id, 
    name, 
    imei, 
    status, 
    company_id, 
    folder_id, 
    updated_at 
FROM public.sensors
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sensors' 
    AND column_name = 'sensor_type'
) AND sensor_type = 'power';

-- =============================================
-- DIAGNOSTIC COMPLETE
-- =============================================