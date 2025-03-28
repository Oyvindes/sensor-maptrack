-- =============================================
-- UPDATE POWER SENSORS RLS POLICY
-- =============================================
-- This script updates the RLS policy for the power_sensors table
-- to allow any authenticated user to insert new power sensors
-- =============================================

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow company admins to manage their power_sensors" ON public.power_sensors;

-- Create a more permissive policy for INSERT
CREATE POLICY "Allow authenticated users to insert power_sensors"
ON public.power_sensors
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create a policy for UPDATE and DELETE that requires company admin
CREATE POLICY "Allow company admins to update and delete their power_sensors"
ON public.power_sensors
FOR UPDATE
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
);

-- Create a policy for DELETE that requires company admin
CREATE POLICY "Allow company admins to delete their power_sensors"
ON public.power_sensors
FOR DELETE
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
);

-- Create a policy for SELECT that allows any authenticated user
CREATE POLICY "Allow authenticated users to select power_sensors"
ON public.power_sensors
FOR SELECT
USING (auth.role() = 'authenticated');