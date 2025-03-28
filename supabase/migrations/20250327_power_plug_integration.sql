-- =============================================
-- POWER PLUG INTEGRATION MIGRATION SCRIPT
-- =============================================
-- This script creates new tables for the NB-IoT smart plug integration:
-- 1. Creates a power_sensors table specifically for power plugs
-- 2. Creates the power_consumption table for energy metrics
-- 3. Creates the power_status table for power state tracking
-- 4. Creates the power_audit_log table for operation logging
-- =============================================

-- =============================================
-- PART 1: CREATE POWER_SENSORS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.power_sensors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  imei TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'offline',
  company_id UUID,
  folder_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_power_sensors_company_id ON public.power_sensors(company_id);
CREATE INDEX IF NOT EXISTS idx_power_sensors_imei ON public.power_sensors(imei);

-- Add RLS policies
ALTER TABLE public.power_sensors ENABLE ROW LEVEL SECURITY;

-- Allow read access to power_sensors for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'power_sensors'
    AND policyname = 'Allow read access to power_sensors'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow read access to power_sensors" ON public.power_sensors FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Allow company admins to manage their company's power sensors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'power_sensors'
    AND policyname = 'Allow company admins to manage their power_sensors'
  ) THEN
    EXECUTE $policy$
    CREATE POLICY "Allow company admins to manage their power_sensors"
    ON public.power_sensors
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
        -- User is a company admin and the sensor belongs to their company
        (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND (is_company_admin = true OR role = 'admin')
          ) AND
          company_id IN (
            SELECT company_id FROM public.users
            WHERE id = auth.uid()
          )
        )
      )
    )
    $policy$;
  END IF;
END
$$;

-- Add comment to explain the table
COMMENT ON TABLE public.power_sensors IS 'Stores information about NB-IoT smart plug sensors';

-- Create a sample power sensor for testing
INSERT INTO public.power_sensors (name, imei, status, company_id)
SELECT 'Test Power Plug', 'POWER123456789', 'online', (SELECT company_id FROM public.users LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM public.power_sensors WHERE imei = 'POWER123456789'
);

-- =============================================
-- PART 2: CREATE POWER_CONSUMPTION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.power_consumption (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  power_sensor_id UUID NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  energy INT4 NOT NULL, -- Energy consumption in watt-hours
  cost NUMERIC(10, 2), -- Cost in local currency
  price_region TEXT, -- Region for price calculation
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Add foreign key constraint
  CONSTRAINT fk_power_sensor FOREIGN KEY (power_sensor_id)
    REFERENCES public.power_sensors(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_power_consumption_sensor_id ON public.power_consumption(power_sensor_id);
CREATE INDEX IF NOT EXISTS idx_power_consumption_timestamp ON public.power_consumption(timestamp);

-- Add RLS policies
ALTER TABLE public.power_consumption ENABLE ROW LEVEL SECURITY;

-- Allow read access to power_consumption for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'power_consumption'
    AND policyname = 'Allow read access to power_consumption'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow read access to power_consumption" ON public.power_consumption FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Allow company admins to manage their company's power consumption data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'power_consumption'
    AND policyname = 'Allow company admins to manage their power_consumption'
  ) THEN
    EXECUTE $policy$
    CREATE POLICY "Allow company admins to manage their power_consumption"
    ON public.power_consumption
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
        -- User is a company admin and the consumption data belongs to their company's sensor
        (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND (is_company_admin = true OR role = 'admin')
          ) AND
          power_sensor_id IN (
            SELECT id FROM public.power_sensors
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
COMMENT ON TABLE public.power_consumption IS 'Stores energy consumption data from smart plug sensors';

-- =============================================
-- PART 3: CREATE POWER_STATUS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.power_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  power_sensor_id UUID NOT NULL,
  power_state BOOLEAN NOT NULL DEFAULT false, -- true = on, false = off
  last_toggled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_toggled_by UUID, -- Reference to the user who last toggled the device
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Add foreign key constraints
  CONSTRAINT fk_power_sensor FOREIGN KEY (power_sensor_id)
    REFERENCES public.power_sensors(id) ON DELETE CASCADE,
  CONSTRAINT fk_toggled_by FOREIGN KEY (last_toggled_by)
    REFERENCES public.users(id) ON DELETE SET NULL
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_power_status_sensor_id ON public.power_status(power_sensor_id);

-- Add RLS policies
ALTER TABLE public.power_status ENABLE ROW LEVEL SECURITY;

-- Allow read access to power_status for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'power_status'
    AND policyname = 'Allow read access to power_status'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow read access to power_status" ON public.power_status FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Allow company admins to manage their company's power status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'power_status'
    AND policyname = 'Allow company admins to manage their power_status'
  ) THEN
    EXECUTE $policy$
    CREATE POLICY "Allow company admins to manage their power_status"
    ON public.power_status
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
        -- User is a company admin and the status belongs to their company's sensor
        (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND (is_company_admin = true OR role = 'admin')
          ) AND
          power_sensor_id IN (
            SELECT id FROM public.power_sensors
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
COMMENT ON TABLE public.power_status IS 'Tracks power state of smart plug sensors';

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_power_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
DROP TRIGGER IF EXISTS update_power_status_updated_at ON public.power_status;
CREATE TRIGGER update_power_status_updated_at
BEFORE UPDATE ON public.power_status
FOR EACH ROW
EXECUTE FUNCTION update_power_status_updated_at();

-- Insert initial power status for each power sensor
INSERT INTO public.power_status (power_sensor_id, power_state)
SELECT id, false FROM public.power_sensors
WHERE NOT EXISTS (
  SELECT 1 FROM public.power_status WHERE power_sensor_id = public.power_sensors.id
);

-- =============================================
-- PART 4: CREATE POWER_AUDIT_LOG TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.power_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  power_sensor_id UUID NOT NULL,
  operation_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'power_on', 'power_off', etc.
  operation_details JSONB DEFAULT '{}'::jsonb, -- Additional details about the operation
  performed_by UUID, -- Reference to the user who performed the operation
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Add foreign key constraints
  CONSTRAINT fk_power_sensor FOREIGN KEY (power_sensor_id)
    REFERENCES public.power_sensors(id) ON DELETE CASCADE,
  CONSTRAINT fk_performed_by FOREIGN KEY (performed_by)
    REFERENCES public.users(id) ON DELETE SET NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_power_audit_sensor_id ON public.power_audit_log(power_sensor_id);
CREATE INDEX IF NOT EXISTS idx_power_audit_operation_type ON public.power_audit_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_power_audit_performed_at ON public.power_audit_log(performed_at);

-- Add RLS policies
ALTER TABLE public.power_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow read access to power_audit_log for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'power_audit_log'
    AND policyname = 'Allow read access to power_audit_log'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow read access to power_audit_log" ON public.power_audit_log FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Allow company admins to insert into their company's power audit log
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'power_audit_log'
    AND policyname = 'Allow company admins to insert into power_audit_log'
  ) THEN
    EXECUTE $policy$
    CREATE POLICY "Allow company admins to insert into power_audit_log"
    ON public.power_audit_log
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
        -- User is a company admin and the audit log belongs to their company's sensor
        (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND (is_company_admin = true OR role = 'admin')
          ) AND
          power_sensor_id IN (
            SELECT id FROM public.power_sensors
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
COMMENT ON TABLE public.power_audit_log IS 'Audit log for all power sensor operations';

-- Create a function to automatically log power sensor operations
CREATE OR REPLACE FUNCTION log_power_sensor_operation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.power_audit_log (
      power_sensor_id, 
      operation_type, 
      operation_details, 
      performed_by
    ) VALUES (
      NEW.id, 
      'create', 
      jsonb_build_object(
        'name', NEW.name,
        'imei', NEW.imei,
        'status', NEW.status,
        'company_id', NEW.company_id
      ),
      auth.uid()
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.power_audit_log (
      power_sensor_id, 
      operation_type, 
      operation_details, 
      performed_by
    ) VALUES (
      NEW.id, 
      'update', 
      jsonb_build_object(
        'old_name', OLD.name,
        'new_name', NEW.name,
        'old_imei', OLD.imei,
        'new_imei', NEW.imei,
        'old_status', OLD.status,
        'new_status', NEW.status
      ),
      auth.uid()
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.power_audit_log (
      power_sensor_id, 
      operation_type, 
      operation_details, 
      performed_by
    ) VALUES (
      OLD.id, 
      'delete', 
      jsonb_build_object(
        'name', OLD.name,
        'imei', OLD.imei,
        'status', OLD.status
      ),
      auth.uid()
    );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a function to log power status changes
CREATE OR REPLACE FUNCTION log_power_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.power_state IS DISTINCT FROM NEW.power_state) THEN
    INSERT INTO public.power_audit_log (
      power_sensor_id, 
      operation_type, 
      operation_details, 
      performed_by
    ) VALUES (
      NEW.power_sensor_id, 
      CASE WHEN NEW.power_state THEN 'power_on' ELSE 'power_off' END, 
      jsonb_build_object(
        'previous_state', OLD.power_state,
        'new_state', NEW.power_state,
        'toggled_at', NEW.last_toggled_at
      ),
      NEW.last_toggled_by
    );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically log operations
DROP TRIGGER IF EXISTS log_power_sensor_insert ON public.power_sensors;
CREATE TRIGGER log_power_sensor_insert
AFTER INSERT ON public.power_sensors
FOR EACH ROW
EXECUTE FUNCTION log_power_sensor_operation();

DROP TRIGGER IF EXISTS log_power_sensor_update ON public.power_sensors;
CREATE TRIGGER log_power_sensor_update
AFTER UPDATE ON public.power_sensors
FOR EACH ROW
EXECUTE FUNCTION log_power_sensor_operation();

DROP TRIGGER IF EXISTS log_power_sensor_delete ON public.power_sensors;
CREATE TRIGGER log_power_sensor_delete
AFTER DELETE ON public.power_sensors
FOR EACH ROW
EXECUTE FUNCTION log_power_sensor_operation();

DROP TRIGGER IF EXISTS log_power_status_update ON public.power_status;
CREATE TRIGGER log_power_status_update
AFTER UPDATE ON public.power_status
FOR EACH ROW
EXECUTE FUNCTION log_power_status_change();

-- =============================================
-- MIGRATION COMPLETE
-- =============================================