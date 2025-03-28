-- =============================================
-- POWER SENSOR INTEGRATION MIGRATION SCRIPT (PART 1 & 2)
-- =============================================
-- This script sets up the first two parts of the NB-IoT smart plug integration:
-- 1. Updates the sensors table to support power sensors
-- 2. Creates the energy_data table for power consumption metrics
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

-- Add comment to explain the table
COMMENT ON TABLE public.energy_data IS 'Stores energy consumption data from smart plug sensors';

-- =============================================
-- PARTIAL MIGRATION COMPLETE
-- =============================================