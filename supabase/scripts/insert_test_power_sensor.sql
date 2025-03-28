-- =============================================
-- INSERT TEST POWER SENSOR SCRIPT
-- =============================================
-- This script inserts a test power sensor using the bypass_rls_power_sensor_operation function
-- =============================================

-- First, check if the bypass_rls_power_sensor_operation function exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_proc
        WHERE proname = 'bypass_rls_power_sensor_operation'
    ) THEN
        RAISE NOTICE 'bypass_rls_power_sensor_operation function exists';
    ELSE
        RAISE NOTICE 'bypass_rls_power_sensor_operation function does NOT exist';
        RAISE EXCEPTION 'bypass_rls_power_sensor_operation function not found. Please run the create_bypass_rls_function.sql script first.';
    END IF;
END
$$;

-- Get the first company ID
DO $$
DECLARE
    first_company_id UUID;
    first_folder_id UUID;
    result JSONB;
BEGIN
    -- Get the first company ID
    SELECT id INTO first_company_id FROM public.companies LIMIT 1;
    
    IF first_company_id IS NULL THEN
        RAISE NOTICE 'No companies found in the database. Creating a test company...';
        
        -- Insert a test company if none exists
        INSERT INTO public.companies (name, description)
        VALUES ('Test Company', 'A test company for power sensors')
        RETURNING id INTO first_company_id;
    END IF;
    
    RAISE NOTICE 'Using company ID: %', first_company_id;
    
    -- Get the first folder ID
    SELECT id INTO first_folder_id FROM public.sensor_folders LIMIT 1;
    
    IF first_folder_id IS NULL THEN
        RAISE NOTICE 'No folders found in the database.';
    ELSE
        RAISE NOTICE 'Using folder ID: %', first_folder_id;
    END IF;
    
    -- Create a test power sensor using the bypass_rls_power_sensor_operation function
    SELECT bypass_rls_power_sensor_operation(
        'create',
        jsonb_build_object(
            'name', 'Test Power Sensor ' || NOW(),
            'imei', 'POWER' || FLOOR(RANDOM() * 1000000000)::TEXT,
            'status', 'online',
            'company_id', first_company_id,
            'folder_id', first_folder_id,
            'sensor_type', 'power'
        )
    ) INTO result;
    
    RAISE NOTICE 'Created test power sensor: %', result;
    
    -- Create another test power sensor
    SELECT bypass_rls_power_sensor_operation(
        'create',
        jsonb_build_object(
            'name', 'Kitchen Smart Plug',
            'imei', 'POWER' || FLOOR(RANDOM() * 1000000000)::TEXT,
            'status', 'online',
            'company_id', first_company_id,
            'folder_id', first_folder_id,
            'sensor_type', 'power'
        )
    ) INTO result;
    
    RAISE NOTICE 'Created kitchen smart plug: %', result;
    
    -- Create a third test power sensor
    SELECT bypass_rls_power_sensor_operation(
        'create',
        jsonb_build_object(
            'name', 'Living Room Smart Plug',
            'imei', 'POWER' || FLOOR(RANDOM() * 1000000000)::TEXT,
            'status', 'offline',
            'company_id', first_company_id,
            'folder_id', first_folder_id,
            'sensor_type', 'power'
        )
    ) INTO result;
    
    RAISE NOTICE 'Created living room smart plug: %', result;
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
    sensor_type,
    created_at, 
    updated_at 
FROM public.power_sensors;

-- =============================================
-- SCRIPT COMPLETE
-- =============================================