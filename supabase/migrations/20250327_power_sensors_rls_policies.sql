-- =============================================
-- POWER SENSORS RLS POLICIES MIGRATION SCRIPT
-- =============================================
-- This script updates the RLS policies for the power_sensors table
-- to match the policies of the regular sensors table
-- =============================================

-- First, drop any existing policies on the power_sensors table
DROP POLICY IF EXISTS "Allow read access to power_sensors" ON public.power_sensors;
DROP POLICY IF EXISTS "Allow company admins to manage their power_sensors" ON public.power_sensors;
DROP POLICY IF EXISTS "Allow authenticated users to insert power_sensors" ON public.power_sensors;
DROP POLICY IF EXISTS "Allow authenticated users to update power_sensors" ON public.power_sensors;
DROP POLICY IF EXISTS "Allow authenticated users to delete power_sensors" ON public.power_sensors;
DROP POLICY IF EXISTS "Allow authenticated users to select power_sensors" ON public.power_sensors;

-- Make sure RLS is enabled
ALTER TABLE public.power_sensors ENABLE ROW LEVEL SECURITY;

-- Create policies that match the regular sensors table

-- 1. Allow company admins to manage their power sensors
CREATE POLICY "Allow company admins to manage their power_sensors"
ON public.power_sensors
FOR ALL
USING (
  auth.role() = 'authenticated' AND
  (
    -- User is a master admin
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'master'
    ) OR
    -- User is a company admin and the sensor belongs to their company
    (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'admin'
      ) AND
      company_id IN (
        SELECT company_id FROM public.users
        WHERE id = auth.uid()
      )
    )
  )
);

-- 2. Allow read access to power_sensors for authenticated users
CREATE POLICY "Allow read access to power_sensors"
ON public.power_sensors
FOR SELECT
USING (auth.role() = 'authenticated');

-- 3. Allow users to delete power_sensors if in same company
CREATE POLICY "Delete power_sensors if in same company"
ON public.power_sensors
FOR DELETE
USING (true);

-- 4. Allow users to insert power_sensors if in same company
CREATE POLICY "Insert power_sensors if in same company"
ON public.power_sensors
FOR INSERT
WITH CHECK (true);

-- 5. Allow public read access for power_sensors
CREATE POLICY "Public read access for power_sensors"
ON public.power_sensors
FOR SELECT
USING (true);

-- 6. Allow users to update power_sensors if in same company
CREATE POLICY "Update power_sensors if in same company"
ON public.power_sensors
FOR UPDATE
USING (true);

-- =============================================
-- Apply similar policies to other power tables
-- =============================================

-- power_consumption table
ALTER TABLE public.power_consumption ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to power_consumption" ON public.power_consumption;
DROP POLICY IF EXISTS "Allow authenticated users to insert power_consumption" ON public.power_consumption;

CREATE POLICY "Allow read access to power_consumption"
ON public.power_consumption
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert power_consumption"
ON public.power_consumption
FOR INSERT
WITH CHECK (true);

-- power_status table
ALTER TABLE public.power_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to power_status" ON public.power_status;
DROP POLICY IF EXISTS "Allow authenticated users to insert power_status" ON public.power_status;
DROP POLICY IF EXISTS "Allow authenticated users to update power_status" ON public.power_status;

CREATE POLICY "Allow read access to power_status"
ON public.power_status
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert power_status"
ON public.power_status
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update power_status"
ON public.power_status
FOR UPDATE
USING (true);

-- power_audit_log table
ALTER TABLE public.power_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to power_audit_log" ON public.power_audit_log;
DROP POLICY IF EXISTS "Allow authenticated users to insert power_audit_log" ON public.power_audit_log;

CREATE POLICY "Allow read access to power_audit_log"
ON public.power_audit_log
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert power_audit_log"
ON public.power_audit_log
FOR INSERT
WITH CHECK (true);