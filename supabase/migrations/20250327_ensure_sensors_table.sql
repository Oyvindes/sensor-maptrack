-- Ensure the sensors table exists with proper constraints
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check if the sensors table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'sensors'
  ) INTO table_exists;

  IF NOT table_exists THEN
    -- Create the sensors table if it doesn't exist
    CREATE TABLE public.sensors (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      imei TEXT UNIQUE,
      type TEXT DEFAULT 'sensor',
      status TEXT DEFAULT 'offline',
      company_id UUID,
      folder_id UUID,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Add indexes
    CREATE INDEX IF NOT EXISTS idx_sensors_company_id ON public.sensors(company_id);
    CREATE INDEX IF NOT EXISTS idx_sensors_imei ON public.sensors(imei);
    
    -- Enable RLS
    ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;

    -- Add comment
    COMMENT ON TABLE public.sensors IS 'Stores sensor information including power sensors';
  ELSE
    -- If the table exists but doesn't have a primary key, add it
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public'
      AND table_name = 'sensors'
      AND constraint_type = 'PRIMARY KEY'
    ) THEN
      -- Add a primary key constraint
      ALTER TABLE public.sensors ADD PRIMARY KEY (id);
    END IF;

    -- If the table exists but imei column doesn't have a unique constraint, add it
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public'
      AND table_name = 'sensors'
      AND constraint_type = 'UNIQUE'
      AND constraint_name LIKE '%imei%'
    ) THEN
      -- Add a unique constraint on imei if it doesn't exist
      BEGIN
        ALTER TABLE public.sensors ADD CONSTRAINT sensors_imei_unique UNIQUE (imei);
      EXCEPTION WHEN others THEN
        -- If there's an error (like duplicate values), log it but continue
        RAISE NOTICE 'Could not add unique constraint to imei column: %', SQLERRM;
      END;
    END IF;

    -- If the type column doesn't exist, add it
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'sensors'
      AND column_name = 'type'
    ) THEN
      ALTER TABLE public.sensors ADD COLUMN type TEXT DEFAULT 'sensor';
    END IF;
  END IF;
END
$$;

-- Create a sample power sensor for testing if none exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.sensors
    WHERE type = 'power'
  ) THEN
    INSERT INTO public.sensors (
      name,
      imei,
      type,
      status
    ) VALUES (
      'Test Power Sensor',
      'POWER123456789',
      'power',
      'online'
    );
  END IF;
END
$$;