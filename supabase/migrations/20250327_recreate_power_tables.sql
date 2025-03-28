-- =============================================
-- RECREATE POWER TABLES MIGRATION SCRIPT
-- =============================================
-- This script drops all tables related to the power plug integration
-- and recreates them from scratch
-- =============================================

-- First, drop all the tables in the correct order to avoid foreign key constraint errors
DROP TABLE IF EXISTS public.power_audit_log;
DROP TABLE IF EXISTS public.power_consumption;
DROP TABLE IF EXISTS public.power_status;
DROP TABLE IF EXISTS public.power_sensors;

-- Now recreate the tables

-- 1. Create the power_sensors table
CREATE TABLE public.power_sensors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  imei TEXT NOT NULL,
  status TEXT DEFAULT 'offline',
  company_id UUID,
  folder_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_power_sensors_company_id ON public.power_sensors(company_id);
CREATE INDEX idx_power_sensors_imei ON public.power_sensors(imei);

-- 2. Create the power_consumption table
CREATE TABLE public.power_consumption (
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
CREATE INDEX idx_power_consumption_sensor_id ON public.power_consumption(power_sensor_id);
CREATE INDEX idx_power_consumption_timestamp ON public.power_consumption(timestamp);

-- 3. Create the power_status table
CREATE TABLE public.power_status (
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
CREATE INDEX idx_power_status_sensor_id ON public.power_status(power_sensor_id);

-- 4. Create the power_audit_log table
CREATE TABLE public.power_audit_log (
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
CREATE INDEX idx_power_audit_sensor_id ON public.power_audit_log(power_sensor_id);
CREATE INDEX idx_power_audit_operation_type ON public.power_audit_log(operation_type);
CREATE INDEX idx_power_audit_performed_at ON public.power_audit_log(performed_at);

-- Create a function to update the updated_at timestamp for power_sensors
CREATE OR REPLACE FUNCTION update_power_sensors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
DROP TRIGGER IF EXISTS update_power_sensors_updated_at ON public.power_sensors;
CREATE TRIGGER update_power_sensors_updated_at
BEFORE UPDATE ON public.power_sensors
FOR EACH ROW
EXECUTE FUNCTION update_power_sensors_updated_at();

-- Create a function to update the updated_at timestamp for power_status
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

-- Add RLS policies to all tables

-- 1. power_sensors table
ALTER TABLE public.power_sensors ENABLE ROW LEVEL SECURITY;

-- Allow read access to power_sensors for all authenticated users
CREATE POLICY "Allow read access to power_sensors"
ON public.power_sensors
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow any authenticated user to insert, update, and delete power sensors
CREATE POLICY "Allow authenticated users to insert power_sensors"
ON public.power_sensors
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update power_sensors"
ON public.power_sensors
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete power_sensors"
ON public.power_sensors
FOR DELETE
USING (auth.role() = 'authenticated');

-- 2. power_consumption table
ALTER TABLE public.power_consumption ENABLE ROW LEVEL SECURITY;

-- Allow read access to power_consumption for all authenticated users
CREATE POLICY "Allow read access to power_consumption"
ON public.power_consumption
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow any authenticated user to insert power consumption data
CREATE POLICY "Allow authenticated users to insert power_consumption"
ON public.power_consumption
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3. power_status table
ALTER TABLE public.power_status ENABLE ROW LEVEL SECURITY;

-- Allow read access to power_status for all authenticated users
CREATE POLICY "Allow read access to power_status"
ON public.power_status
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow any authenticated user to insert and update power status
CREATE POLICY "Allow authenticated users to insert power_status"
ON public.power_status
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update power_status"
ON public.power_status
FOR UPDATE
USING (auth.role() = 'authenticated');

-- 4. power_audit_log table
ALTER TABLE public.power_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow read access to power_audit_log for all authenticated users
CREATE POLICY "Allow read access to power_audit_log"
ON public.power_audit_log
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow any authenticated user to insert into power audit log
CREATE POLICY "Allow authenticated users to insert power_audit_log"
ON public.power_audit_log
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create a sample power sensor for testing
INSERT INTO public.power_sensors (name, imei, status, company_id)
SELECT 'Test Power Plug', 'POWER123456789', 'online', (SELECT id FROM public.companies LIMIT 1)
WHERE EXISTS (SELECT 1 FROM public.companies LIMIT 1);

-- Insert initial power status for the sample power sensor
INSERT INTO public.power_status (power_sensor_id, power_state)
SELECT id, false FROM public.power_sensors
WHERE imei = 'POWER123456789';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================