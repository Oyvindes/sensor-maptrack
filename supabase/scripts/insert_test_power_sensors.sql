-- =============================================
-- INSERT TEST POWER SENSORS SCRIPT
-- =============================================
-- This script directly inserts test power sensors into the database
-- bypassing all RLS policies and TypeScript code
-- =============================================

-- First, let's check if there are any power sensors already
DO $$
DECLARE
    sensor_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO sensor_count FROM public.power_sensors;
    RAISE NOTICE 'Found % existing power sensors', sensor_count;
END
$$;

-- Get the first company ID
DO $$
DECLARE
    first_company_id UUID;
    first_user_id UUID;
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
    
    -- Get the first user ID
    SELECT id INTO first_user_id FROM public.users LIMIT 1;
    
    IF first_user_id IS NULL THEN
        RAISE NOTICE 'No users found in the database.';
    ELSE
        RAISE NOTICE 'Using user ID: %', first_user_id;
    END IF;
    
    -- Insert test power sensors if they don't already exist
    IF NOT EXISTS (SELECT 1 FROM public.power_sensors WHERE imei = 'POWER123456789') THEN
        INSERT INTO public.power_sensors (name, imei, status, company_id)
        VALUES ('Test Power Plug 1', 'POWER123456789', 'online', first_company_id);
        
        RAISE NOTICE 'Inserted Test Power Plug 1';
    ELSE
        RAISE NOTICE 'Test Power Plug 1 already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.power_sensors WHERE imei = 'POWER987654321') THEN
        INSERT INTO public.power_sensors (name, imei, status, company_id)
        VALUES ('Test Power Plug 2', 'POWER987654321', 'offline', first_company_id);
        
        RAISE NOTICE 'Inserted Test Power Plug 2';
    ELSE
        RAISE NOTICE 'Test Power Plug 2 already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.power_sensors WHERE imei = 'POWER555555555') THEN
        INSERT INTO public.power_sensors (name, imei, status, company_id)
        VALUES ('Smart Plug Kitchen', 'POWER555555555', 'online', first_company_id);
        
        RAISE NOTICE 'Inserted Smart Plug Kitchen';
    ELSE
        RAISE NOTICE 'Smart Plug Kitchen already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.power_sensors WHERE imei = 'POWER666666666') THEN
        INSERT INTO public.power_sensors (name, imei, status, company_id)
        VALUES ('Smart Plug Living Room', 'POWER666666666', 'online', first_company_id);
        
        RAISE NOTICE 'Inserted Smart Plug Living Room';
    ELSE
        RAISE NOTICE 'Smart Plug Living Room already exists';
    END IF;
    
    -- Insert power status for each sensor if it doesn't exist
    FOR sensor_id IN SELECT id FROM public.power_sensors LOOP
        IF NOT EXISTS (SELECT 1 FROM public.power_status WHERE power_sensor_id = sensor_id) THEN
            INSERT INTO public.power_status (power_sensor_id, power_state, last_toggled_at, last_toggled_by)
            VALUES (sensor_id, FALSE, NOW(), first_user_id);
            
            RAISE NOTICE 'Inserted power status for sensor %', sensor_id;
        ELSE
            RAISE NOTICE 'Power status for sensor % already exists', sensor_id;
        END IF;
    END LOOP;
    
    -- Insert some test power consumption data
    FOR sensor_id IN SELECT id FROM public.power_sensors LOOP
        -- Only insert if there's no consumption data for this sensor
        IF NOT EXISTS (SELECT 1 FROM public.power_consumption WHERE power_sensor_id = sensor_id) THEN
            -- Insert data for the last 24 hours, one entry per hour
            FOR i IN 0..23 LOOP
                INSERT INTO public.power_consumption (
                    power_sensor_id, 
                    timestamp, 
                    energy, 
                    cost, 
                    price_region
                )
                VALUES (
                    sensor_id, 
                    NOW() - (i || ' hours')::INTERVAL, 
                    FLOOR(RANDOM() * 100 + 50)::INT, -- Random energy between 50 and 150
                    (RANDOM() * 2 + 0.5)::NUMERIC(10,2), -- Random cost between 0.5 and 2.5
                    'Europe/Oslo'
                );
            END LOOP;
            
            RAISE NOTICE 'Inserted 24 hours of consumption data for sensor %', sensor_id;
        ELSE
            RAISE NOTICE 'Consumption data for sensor % already exists', sensor_id;
        END IF;
    END LOOP;
END
$$;

-- Verify the data was inserted
SELECT 'Power Sensors:' AS table_name, COUNT(*) AS record_count FROM public.power_sensors
UNION ALL
SELECT 'Power Status:', COUNT(*) FROM public.power_status
UNION ALL
SELECT 'Power Consumption:', COUNT(*) FROM public.power_consumption;

-- Create a function to get all power sensors (if it doesn't exist)
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