-- =============================================
-- POWER SENSOR INTEGRATION MIGRATION SCRIPT
-- =============================================
-- This script sets up all necessary database objects for the NB-IoT smart plug integration:
-- 1. Updates the sensors table to support power sensors
-- 2. Creates the energy_data table for power consumption metrics
-- 3. Creates the device_status table for power state tracking
-- 4. Creates the device_audit_log table for comprehensive operation logging
-- =============================================

-- =============================================
-- PART 1: UPDATE SENSORS TABLE
-- =============================================

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_sensors_company_id ON public.sensors(company_id);
CREATE INDEX IF NOT EXISTS idx_sensors_imei ON public.sensors(imei);

-- Add comment to explain the table
COMMENT ON TABLE public.sensors IS 'Stores sensor information including power sensors';

-- Create a sample power sensor for testing if none exists
INSERT INTO public.sensors (name, imei, sensor_type, status)
SELECT 'Test Power Sensor', 'POWER123456789', 'power', 'online'
WHERE NOT EXISTS (
  SELECT 1 FROM public.sensors WHERE sensor_type = 'power'
);

-- =============================================
-- PART 2: CREATE ENERGY_DATA TABLE
-- =============================================
-- Create energy_data table
CREATE TABLE IF NOT EXISTS public.energy_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_imei TEXT NOT NULL, -- Reference to sensors.imei
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  energy INT4 NOT NULL, -- Energy consumption in watt-hours
  cost NUMERIC(10, 2), -- Cost in local currency
  price_region TEXT, -- Region for price calculation
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_energy_data_device_imei ON public.energy_data(device_imei);
CREATE INDEX IF NOT EXISTS idx_energy_data_timestamp ON public.energy_data(timestamp);

-- Add RLS policies
ALTER TABLE public.energy_data ENABLE ROW LEVEL SECURITY;

-- Allow read access to energy_data for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'energy_data'
    AND policyname = 'Allow read access to energy_data'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow read access to energy_data" ON public.energy_data FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Allow company admins to manage their company's energy data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'energy_data'
    AND policyname = 'Allow company admins to manage their energy_data'
  ) THEN
    EXECUTE $policy$
    CREATE POLICY "Allow company admins to manage their energy_data"
    ON public.energy_data
    FOR ALL
    USING (
      auth.role() = 'authenticated' AND
      (
        -- User is a system admin
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid()
          AND role = 'admin'
        ) OR
        -- User is a company admin and the energy data belongs to their company's sensor
        (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND (is_company_admin = true OR role = 'admin')
          ) AND
          device_imei IN (
            SELECT imei FROM public.sensors
            WHERE company_id IN (
              SELECT company_id FROM public.users
              WHERE id = auth.uid()
            )
          )
        )
      )
    )
    $policy$;
  END IF;
END
$$;

-- Add comment to explain the table
COMMENT ON TABLE public.energy_data IS 'Stores energy consumption data from smart plug sensors';

-- =============================================
-- PART 3: CREATE DEVICE_STATUS TABLE
-- =============================================
-- Create device_status table to track power state of smart plugs
CREATE TABLE IF NOT EXISTS public.device_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_imei TEXT NOT NULL, -- Reference to sensors.imei
  power_state BOOLEAN NOT NULL DEFAULT false, -- true = on, false = off
  last_toggled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_toggled_by UUID, -- Reference to the user who last toggled the device
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_device_status_device_imei ON public.device_status(device_imei);

-- Add RLS policies
ALTER TABLE public.device_status ENABLE ROW LEVEL SECURITY;

-- Allow read access to device_status for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'device_status'
    AND policyname = 'Allow read access to device_status'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow read access to device_status" ON public.device_status FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Allow company admins to manage their company's device status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'device_status'
    AND policyname = 'Allow company admins to manage their device_status'
  ) THEN
    EXECUTE $policy$
    CREATE POLICY "Allow company admins to manage their device_status"
    ON public.device_status
    FOR ALL
    USING (
      auth.role() = 'authenticated' AND
      (
        -- User is a system admin
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid()
          AND role = 'admin'
        ) OR
        -- User is a company admin and the device belongs to their company
        (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND (is_company_admin = true OR role = 'admin')
          ) AND
          device_imei IN (
            SELECT imei FROM public.sensors
            WHERE company_id IN (
              SELECT company_id FROM public.users
              WHERE id = auth.uid()
            )
          )
        )
      )
    )
    $policy$;
  END IF;
END
$$;

-- Add comment to explain the table
COMMENT ON TABLE public.device_status IS 'Tracks power state of smart plug sensors';

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_device_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
DROP TRIGGER IF EXISTS update_device_status_updated_at ON public.device_status;
CREATE TRIGGER update_device_status_updated_at
BEFORE UPDATE ON public.device_status
FOR EACH ROW
EXECUTE FUNCTION update_device_status_updated_at();

-- =============================================
-- PART 4: CREATE DEVICE_AUDIT_LOG TABLE
-- =============================================
-- Create device_audit_log table to track all device operations
CREATE TABLE IF NOT EXISTS public.device_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_imei TEXT NOT NULL, -- Reference to sensors.imei
  operation_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'power_on', 'power_off', etc.
  operation_details JSONB DEFAULT '{}'::jsonb, -- Additional details about the operation
  performed_by UUID, -- Reference to the user who performed the operation
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Add foreign key constraint to link to users table
  CONSTRAINT fk_audit_user FOREIGN KEY (performed_by)
    REFERENCES public.users(id) ON DELETE SET NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_device_audit_device_imei ON public.device_audit_log(device_imei);
CREATE INDEX IF NOT EXISTS idx_device_audit_operation_type ON public.device_audit_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_device_audit_performed_at ON public.device_audit_log(performed_at);

-- Add RLS policies
ALTER TABLE public.device_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow read access to device_audit_log for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'device_audit_log'
    AND policyname = 'Allow read access to device_audit_log'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow read access to device_audit_log" ON public.device_audit_log FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Allow company admins to insert into their company's device audit log
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'device_audit_log'
    AND policyname = 'Allow company admins to insert into device_audit_log'
  ) THEN
    EXECUTE $policy$
    CREATE POLICY "Allow company admins to insert into device_audit_log"
    ON public.device_audit_log
    FOR INSERT
    WITH CHECK (
      auth.role() = 'authenticated' AND
      (
        -- User is a system admin
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid()
          AND role = 'admin'
        ) OR
        -- User is a company admin and the device belongs to their company
        (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND (is_company_admin = true OR role = 'admin')
          ) AND
          device_imei IN (
            SELECT imei FROM public.sensors
            WHERE company_id IN (
              SELECT company_id FROM public.users
              WHERE id = auth.uid()
            )
          )
        )
      )
    )
    $policy$;
  END IF;
END
$$;

-- Add comment to explain the table
COMMENT ON TABLE public.device_audit_log IS 'Audit log for all device operations';

-- Create a function to automatically log device operations
CREATE OR REPLACE FUNCTION log_device_operation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.device_audit_log (
      device_imei, 
      operation_type, 
      operation_details, 
      performed_by
    ) VALUES (
      NEW.imei, 
      'create', 
      jsonb_build_object(
        'name', NEW.name,
        'sensor_type', NEW.sensor_type,
        'status', NEW.status,
        'company_id', NEW.company_id
      ),
      auth.uid()
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.device_audit_log (
      device_imei, 
      operation_type, 
      operation_details, 
      performed_by
    ) VALUES (
      NEW.imei, 
      'update', 
      jsonb_build_object(
        'old_name', OLD.name,
        'new_name', NEW.name,
        'old_sensor_type', OLD.sensor_type,
        'new_sensor_type', NEW.sensor_type,
        'old_status', OLD.status,
        'new_status', NEW.status
      ),
      auth.uid()
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.device_audit_log (
      device_imei, 
      operation_type, 
      operation_details, 
      performed_by
    ) VALUES (
      OLD.imei, 
      'delete', 
      jsonb_build_object(
        'name', OLD.name,
        'sensor_type', OLD.sensor_type,
        'status', OLD.status
      ),
      auth.uid()
    );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically log device operations
DROP TRIGGER IF EXISTS log_device_insert ON public.sensors;
CREATE TRIGGER log_device_insert
AFTER INSERT ON public.sensors
FOR EACH ROW
WHEN (NEW.sensor_type = 'power')
EXECUTE FUNCTION log_device_operation();

DROP TRIGGER IF EXISTS log_device_update ON public.sensors;
CREATE TRIGGER log_device_update
AFTER UPDATE ON public.sensors
FOR EACH ROW
WHEN (NEW.sensor_type = 'power' OR OLD.sensor_type = 'power')
EXECUTE FUNCTION log_device_operation();

DROP TRIGGER IF EXISTS log_device_delete ON public.sensors;
CREATE TRIGGER log_device_delete
AFTER DELETE ON public.sensors
FOR EACH ROW
WHEN (OLD.sensor_type = 'power')
EXECUTE FUNCTION log_device_operation();

-- =============================================
-- PART 5: ADD FOREIGN KEY CONSTRAINTS
-- =============================================
-- Now that all tables are created, add the foreign key constraints
-- These are added last to avoid dependency issues

-- Add foreign key constraint to energy_data table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
    AND table_name = 'energy_data'
    AND constraint_name = 'fk_device'
  ) THEN
    ALTER TABLE public.energy_data
    ADD CONSTRAINT fk_device
    FOREIGN KEY (device_imei) REFERENCES public.sensors(imei) ON DELETE CASCADE;
  END IF;
END
$$;

-- Add foreign key constraint to device_status table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
    AND table_name = 'device_status'
    AND constraint_name = 'fk_device_status'
  ) THEN
    ALTER TABLE public.device_status
    ADD CONSTRAINT fk_device_status
    FOREIGN KEY (device_imei) REFERENCES public.sensors(imei) ON DELETE CASCADE;
  END IF;
END
$$;

-- Add foreign key constraint to device_audit_log table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
    AND table_name = 'device_audit_log'
    AND constraint_name = 'fk_device_audit'
  ) THEN
    ALTER TABLE public.device_audit_log
    ADD CONSTRAINT fk_device_audit
    FOREIGN KEY (device_imei) REFERENCES public.sensors(imei) ON DELETE CASCADE;
  END IF;
END
$$;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================