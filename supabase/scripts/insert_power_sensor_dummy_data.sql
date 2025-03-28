-- =============================================
-- POWER SENSORS DUMMY DATA SCRIPT
-- =============================================
-- This script inserts dummy data for power sensors:
-- 1. Inserts power sensors (if they don't already exist)
-- 2. Inserts power status records for each sensor
-- 3. Inserts power consumption data for the past week
-- 4. Inserts some audit log entries
-- =============================================

-- Get a company ID to associate with the sensors
DO $$
DECLARE
    company_uuid UUID;
    admin_user_uuid UUID;
BEGIN
    -- Get the first company ID
    SELECT id INTO company_uuid FROM public.companies LIMIT 1;
    
    -- Get an admin user ID
    SELECT id INTO admin_user_uuid FROM public.users WHERE role = 'admin' LIMIT 1;
    
    -- If no company exists, raise notice
    IF company_uuid IS NULL THEN
        RAISE NOTICE 'No companies found. Using NULL for company_id.';
    END IF;
    
    -- If no admin user exists, raise notice
    IF admin_user_uuid IS NULL THEN
        RAISE NOTICE 'No admin users found. Using NULL for user_id.';
    END IF;

    -- =============================================
    -- PART 1: INSERT POWER SENSORS
    -- =============================================
    
    -- Insert power sensors if they don't already exist
    INSERT INTO public.power_sensors (name, imei, status, company_id)
    SELECT 'New Smart Plughged', '351756051524001', 'online', company_uuid
    WHERE NOT EXISTS (SELECT 1 FROM public.power_sensors WHERE imei = '351756051524001');
    
    INSERT INTO public.power_sensors (name, imei, status, company_id)
    SELECT 'Test Power Sensor 2025-03-27 14:31:51.453398+00', 'POWER49300728', 'online', company_uuid
    WHERE NOT EXISTS (SELECT 1 FROM public.power_sensors WHERE imei = 'POWER49300728');
    
    INSERT INTO public.power_sensors (name, imei, status, company_id)
    SELECT 'Kitchen Smart Plug', 'POWER185184100', 'online', company_uuid
    WHERE NOT EXISTS (SELECT 1 FROM public.power_sensors WHERE imei = 'POWER185184100');
    
    INSERT INTO public.power_sensors (name, imei, status, company_id)
    SELECT 'Living Room Smart Plug', 'POWER666657960', 'offline', company_uuid
    WHERE NOT EXISTS (SELECT 1 FROM public.power_sensors WHERE imei = 'POWER666657960');
    
    INSERT INTO public.power_sensors (name, imei, status, company_id)
    SELECT 'testrsertf', '456234562354', 'offline', company_uuid
    WHERE NOT EXISTS (SELECT 1 FROM public.power_sensors WHERE imei = '456234562354');
    
    INSERT INTO public.power_sensors (name, imei, status, company_id)
    SELECT 'New Smart Plug152ffffffffff', '35175605152400144444444444', 'online', company_uuid
    WHERE NOT EXISTS (SELECT 1 FROM public.power_sensors WHERE imei = '35175605152400144444444444');
    
    -- =============================================
    -- PART 2: INSERT POWER STATUS RECORDS
    -- =============================================
    
    -- Insert power status for each sensor
    INSERT INTO public.power_status (power_sensor_id, power_state, last_toggled_at, last_toggled_by)
    SELECT 
        ps.id, 
        CASE 
            WHEN ps.status = 'online' THEN true 
            ELSE false 
        END,
        NOW() - (RANDOM() * INTERVAL '7 days'),
        admin_user_uuid
    FROM public.power_sensors ps
    WHERE NOT EXISTS (
        SELECT 1 FROM public.power_status 
        WHERE power_sensor_id = ps.id
    );
    
    -- =============================================
    -- PART 3: INSERT POWER CONSUMPTION DATA
    -- =============================================
    
    -- Insert consumption data for Kitchen Smart Plug (more during meal times)
    INSERT INTO public.power_consumption (power_sensor_id, timestamp, energy, cost, price_region)
    SELECT 
        ps.id,
        NOW() - (n * INTERVAL '1 hour'),
        CASE 
            -- Higher consumption during meal times (7-9am, 12-2pm, 6-8pm)
            WHEN EXTRACT(HOUR FROM (NOW() - (n * INTERVAL '1 hour'))) BETWEEN 7 AND 9 
                OR EXTRACT(HOUR FROM (NOW() - (n * INTERVAL '1 hour'))) BETWEEN 12 AND 14
                OR EXTRACT(HOUR FROM (NOW() - (n * INTERVAL '1 hour'))) BETWEEN 18 AND 20
            THEN 100 + (RANDOM() * 400)::INT -- 100-500 Wh
            ELSE 10 + (RANDOM() * 90)::INT -- 10-100 Wh
        END,
        (RANDOM() * 2.0)::NUMERIC(10,2), -- Random cost
        (ARRAY['NO1', 'NO2', 'NO3', 'NO4', 'NO5'])[1 + (RANDOM() * 4)::INT] -- Random price region
    FROM 
        public.power_sensors ps,
        generate_series(1, 168) n -- 7 days * 24 hours
    WHERE 
        ps.name = 'Kitchen Smart Plug';
    
    -- Insert consumption data for Living Room Smart Plug (more in the evening)
    INSERT INTO public.power_consumption (power_sensor_id, timestamp, energy, cost, price_region)
    SELECT 
        ps.id,
        NOW() - (n * INTERVAL '1 hour'),
        CASE 
            -- Higher consumption in the evening (6pm-11pm)
            WHEN EXTRACT(HOUR FROM (NOW() - (n * INTERVAL '1 hour'))) BETWEEN 18 AND 23
            THEN 150 + (RANDOM() * 350)::INT -- 150-500 Wh
            ELSE 20 + (RANDOM() * 80)::INT -- 20-100 Wh
        END,
        (RANDOM() * 2.0)::NUMERIC(10,2), -- Random cost
        (ARRAY['NO1', 'NO2', 'NO3', 'NO4', 'NO5'])[1 + (RANDOM() * 4)::INT] -- Random price region
    FROM 
        public.power_sensors ps,
        generate_series(1, 168) n -- 7 days * 24 hours
    WHERE 
        ps.name = 'Living Room Smart Plug'
        AND RANDOM() > 0.7; -- Only insert some records since it's offline
    
    -- Insert consumption data for other sensors (random patterns)
    INSERT INTO public.power_consumption (power_sensor_id, timestamp, energy, cost, price_region)
    SELECT 
        ps.id,
        NOW() - (n * INTERVAL '1 hour'),
        50 + (RANDOM() * 200)::INT, -- 50-250 Wh
        (RANDOM() * 2.0)::NUMERIC(10,2), -- Random cost
        (ARRAY['NO1', 'NO2', 'NO3', 'NO4', 'NO5'])[1 + (RANDOM() * 4)::INT] -- Random price region
    FROM 
        public.power_sensors ps,
        generate_series(1, 168) n -- 7 days * 24 hours
    WHERE 
        ps.name NOT IN ('Kitchen Smart Plug', 'Living Room Smart Plug')
        AND (ps.status = 'online' OR RANDOM() > 0.7); -- Fewer records for offline sensors
    
    -- =============================================
    -- PART 4: INSERT AUDIT LOG ENTRIES
    -- =============================================
    
    -- Insert some manual power toggle audit entries
    INSERT INTO public.power_audit_log (
        power_sensor_id,
        operation_type,
        operation_details,
        performed_by,
        performed_at
    )
    SELECT 
        ps.id,
        CASE WHEN RANDOM() > 0.5 THEN 'power_on' ELSE 'power_off' END,
        jsonb_build_object(
            'previous_state', CASE WHEN RANDOM() > 0.5 THEN false ELSE true END,
            'toggled_by', 'manual',
            'source', CASE WHEN RANDOM() > 0.5 THEN 'app' ELSE 'web' END
        ),
        admin_user_uuid,
        NOW() - (RANDOM() * INTERVAL '7 days')
    FROM public.power_sensors ps
    CROSS JOIN generate_series(1, 5) -- 5 entries per sensor
    WHERE ps.status = 'online';
    
END $$;

-- =============================================
-- SUMMARY OF INSERTED DATA
-- =============================================
SELECT 'Power Sensors' as table_name, COUNT(*) as record_count FROM public.power_sensors
UNION ALL
SELECT 'Power Status' as table_name, COUNT(*) as record_count FROM public.power_status
UNION ALL
SELECT 'Power Consumption' as table_name, COUNT(*) as record_count FROM public.power_consumption
UNION ALL
SELECT 'Power Audit Log' as table_name, COUNT(*) as record_count FROM public.power_audit_log;

-- =============================================
-- SAMPLE QUERIES FOR TESTING
-- =============================================

-- Get power consumption by sensor for the past day
SELECT 
    ps.name as sensor_name,
    SUM(pc.energy) as total_energy_wh,
    SUM(pc.energy)/1000.0 as total_energy_kwh,
    SUM(pc.cost) as total_cost
FROM 
    public.power_consumption pc
JOIN 
    public.power_sensors ps ON pc.power_sensor_id = ps.id
WHERE 
    pc.timestamp > NOW() - INTERVAL '1 day'
GROUP BY 
    ps.name
ORDER BY 
    total_energy_wh DESC;

-- Get hourly consumption for a specific sensor (Kitchen Smart Plug)
SELECT 
    DATE_TRUNC('hour', pc.timestamp) as hour,
    SUM(pc.energy) as energy_wh,
    SUM(pc.cost) as cost
FROM 
    public.power_consumption pc
JOIN 
    public.power_sensors ps ON pc.power_sensor_id = ps.id
WHERE 
    ps.name = 'Kitchen Smart Plug'
    AND pc.timestamp > NOW() - INTERVAL '1 day'
GROUP BY 
    hour
ORDER BY 
    hour;

-- Get current power status for all sensors
SELECT 
    ps.name as sensor_name,
    ps.status as connection_status,
    pst.power_state as is_powered_on,
    pst.last_toggled_at as last_toggled_at
FROM 
    public.power_sensors ps
LEFT JOIN 
    public.power_status pst ON ps.id = pst.power_sensor_id
ORDER BY 
    ps.name;