-- This script verifies and enhances database security by ensuring proper RLS policies are in place

-- Function to check if RLS is enabled for a table
CREATE OR REPLACE FUNCTION check_rls_enabled(table_name text)
RETURNS boolean AS $$
DECLARE
  is_enabled boolean;
BEGIN
  SELECT relrowsecurity INTO is_enabled
  FROM pg_class
  WHERE oid = (table_name::regclass);
  
  RETURN is_enabled;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all tables if not already enabled
DO $$
DECLARE
  table_record record;
BEGIN
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN ('schema_migrations', 'schema_version')
  LOOP
    IF NOT check_rls_enabled('public.' || table_record.tablename) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
      RAISE NOTICE 'Enabled RLS on table: %', table_record.tablename;
    END IF;
  END LOOP;
END;
$$;

-- Verify and create RLS policies for sensors table
DO $$
BEGIN
  -- Allow read access to sensors for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sensors' 
    AND schemaname = 'public' 
    AND policyname = 'Allow read access to sensors'
  ) THEN
    CREATE POLICY "Allow read access to sensors" 
    ON public.sensors 
    FOR SELECT 
    USING (auth.role() = 'authenticated');
    
    RAISE NOTICE 'Created read policy for sensors table';
  END IF;
  
  -- Allow company admins to manage their company's sensors
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sensors' 
    AND schemaname = 'public' 
    AND policyname = 'Allow company admins to manage their sensors'
  ) THEN
    CREATE POLICY "Allow company admins to manage their sensors" 
    ON public.sensors 
    FOR ALL 
    USING (
      auth.role() = 'authenticated' AND 
      (
        -- User is a master admin
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'master'
        ) OR 
        -- User is a company admin and the sensor belongs to their company
        (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
          ) AND 
          company_id IN (
            SELECT company_id FROM public.users 
            WHERE id = auth.uid()
          )
        )
      )
    );
    
    RAISE NOTICE 'Created management policy for sensors table';
  END IF;
END;
$$;

-- Verify and create RLS policies for devices table
DO $$
BEGIN
  -- Allow read access to devices for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'devices' 
    AND schemaname = 'public' 
    AND policyname = 'Allow read access to devices'
  ) THEN
    CREATE POLICY "Allow read access to devices" 
    ON public.devices 
    FOR SELECT 
    USING (auth.role() = 'authenticated');
    
    RAISE NOTICE 'Created read policy for devices table';
  END IF;
  
  -- Allow company admins to manage their company's devices
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'devices' 
    AND schemaname = 'public' 
    AND policyname = 'Allow company admins to manage their devices'
  ) THEN
    CREATE POLICY "Allow company admins to manage their devices" 
    ON public.devices 
    FOR ALL 
    USING (
      auth.role() = 'authenticated' AND 
      (
        -- User is a master admin
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'master'
        ) OR 
        -- User is a company admin and the device belongs to their company
        (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
          ) AND 
          company_id IN (
            SELECT company_id FROM public.users 
            WHERE id = auth.uid()
          )
        )
      )
    );
    
    RAISE NOTICE 'Created management policy for devices table';
  END IF;
END;
$$;

-- Verify and create RLS policies for tracking_objects table
DO $$
BEGIN
  -- Allow read access to tracking_objects for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tracking_objects' 
    AND schemaname = 'public' 
    AND policyname = 'Allow read access to tracking_objects'
  ) THEN
    CREATE POLICY "Allow read access to tracking_objects" 
    ON public.tracking_objects 
    FOR SELECT 
    USING (auth.role() = 'authenticated');
    
    RAISE NOTICE 'Created read policy for tracking_objects table';
  END IF;
  
  -- Allow company admins to manage their company's tracking objects
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tracking_objects' 
    AND schemaname = 'public' 
    AND policyname = 'Allow company admins to manage their tracking_objects'
  ) THEN
    CREATE POLICY "Allow company admins to manage their tracking_objects" 
    ON public.tracking_objects 
    FOR ALL 
    USING (
      auth.role() = 'authenticated' AND 
      (
        -- User is a master admin
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'master'
        ) OR 
        -- User is a company admin and the tracking object belongs to their company
        (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
          ) AND 
          company_id IN (
            SELECT company_id FROM public.users 
            WHERE id = auth.uid()
          )
        )
      )
    );
    
    RAISE NOTICE 'Created management policy for tracking_objects table';
  END IF;
END;
$$;

-- Verify and create RLS policies for sensor_folders table
DO $$
BEGIN
  -- Allow read access to sensor_folders for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sensor_folders' 
    AND schemaname = 'public' 
    AND policyname = 'Allow read access to sensor_folders'
  ) THEN
    CREATE POLICY "Allow read access to sensor_folders" 
    ON public.sensor_folders 
    FOR SELECT 
    USING (auth.role() = 'authenticated');
    
    RAISE NOTICE 'Created read policy for sensor_folders table';
  END IF;
  
  -- Allow company admins to manage their company's folders
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sensor_folders' 
    AND schemaname = 'public' 
    AND policyname = 'Allow company admins to manage their folders'
  ) THEN
    CREATE POLICY "Allow company admins to manage their folders" 
    ON public.sensor_folders 
    FOR ALL 
    USING (
      auth.role() = 'authenticated' AND 
      (
        -- User is a master admin
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'master'
        ) OR 
        -- User is a company admin and the folder belongs to their company
        (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
          ) AND 
          company_id IN (
            SELECT company_id FROM public.users 
            WHERE id = auth.uid()
          )
        )
      )
    );
    
    RAISE NOTICE 'Created management policy for sensor_folders table';
  END IF;
END;
$$;

-- Verify and create RLS policies for sensor_values table
DO $$
BEGIN
  -- Allow read access to sensor_values for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sensor_values' 
    AND schemaname = 'public' 
    AND policyname = 'Allow read access to sensor_values'
  ) THEN
    CREATE POLICY "Allow read access to sensor_values" 
    ON public.sensor_values 
    FOR SELECT 
    USING (auth.role() = 'authenticated');
    
    RAISE NOTICE 'Created read policy for sensor_values table';
  END IF;
  
  -- Allow company admins to manage their company's sensor values
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sensor_values' 
    AND schemaname = 'public' 
    AND policyname = 'Allow company admins to manage their sensor_values'
  ) THEN
    CREATE POLICY "Allow company admins to manage their sensor_values" 
    ON public.sensor_values 
    FOR ALL 
    USING (
      auth.role() = 'authenticated' AND 
      (
        -- User is a master admin
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'master'
        ) OR 
        -- User is a company admin and the sensor value belongs to their company's sensor
        (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
          ) AND 
          sensor_imei IN (
            SELECT imei FROM public.sensors 
            WHERE company_id IN (
              SELECT company_id FROM public.users 
              WHERE id = auth.uid()
            )
          )
        )
      )
    );
    
    RAISE NOTICE 'Created management policy for sensor_values table';
  END IF;
END;
$$;

-- Verify and create RLS policies for device_positions table
DO $$
BEGIN
  -- Allow read access to device_positions for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'device_positions' 
    AND schemaname = 'public' 
    AND policyname = 'Allow read access to device_positions'
  ) THEN
    CREATE POLICY "Allow read access to device_positions" 
    ON public.device_positions 
    FOR SELECT 
    USING (auth.role() = 'authenticated');
    
    RAISE NOTICE 'Created read policy for device_positions table';
  END IF;
  
  -- Allow company admins to manage their company's device positions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'device_positions' 
    AND schemaname = 'public' 
    AND policyname = 'Allow company admins to manage their device_positions'
  ) THEN
    CREATE POLICY "Allow company admins to manage their device_positions" 
    ON public.device_positions 
    FOR ALL 
    USING (
      auth.role() = 'authenticated' AND 
      (
        -- User is a master admin
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'master'
        ) OR 
        -- User is a company admin and the device position belongs to their company's device
        (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
          ) AND 
          device_id IN (
            SELECT id FROM public.devices 
            WHERE company_id IN (
              SELECT company_id FROM public.users 
              WHERE id = auth.uid()
            )
          )
        )
      )
    );
    
    RAISE NOTICE 'Created management policy for device_positions table';
  END IF;
END;
$$;

-- Print a summary of all RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM 
  pg_policies
WHERE 
  schemaname = 'public'
ORDER BY 
  tablename, 
  policyname;