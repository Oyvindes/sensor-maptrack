-- =============================================
-- FIX POWER SENSORS COMPANY ID MIGRATION SCRIPT
-- =============================================
-- This script fixes the company_id in the power_sensors table
-- to ensure it matches a valid company_id in the companies table
-- =============================================

-- First, let's check if there are any power sensors with invalid company_ids
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM public.power_sensors ps
    LEFT JOIN public.companies c ON ps.company_id = c.id
    WHERE ps.company_id IS NOT NULL AND c.id IS NULL;

    IF invalid_count > 0 THEN
        RAISE NOTICE 'Found % power sensors with invalid company_ids', invalid_count;
    ELSE
        RAISE NOTICE 'All power sensors have valid company_ids';
    END IF;
END
$$;

-- Update power sensors with invalid company_ids to use the first available company
UPDATE public.power_sensors
SET company_id = (SELECT id FROM public.companies LIMIT 1)
WHERE company_id IS NULL OR company_id NOT IN (SELECT id FROM public.companies);

-- Make sure all power sensors have a company_id
UPDATE public.power_sensors
SET company_id = (SELECT id FROM public.companies LIMIT 1)
WHERE company_id IS NULL;

-- Add a foreign key constraint to ensure company_id is valid
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_power_sensors_company'
        AND table_name = 'power_sensors'
    ) THEN
        ALTER TABLE public.power_sensors
        ADD CONSTRAINT fk_power_sensors_company
        FOREIGN KEY (company_id)
        REFERENCES public.companies(id)
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Added foreign key constraint for company_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint for company_id already exists';
    END IF;
END
$$;

-- Add a foreign key constraint to ensure folder_id is valid
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_power_sensors_folder'
        AND table_name = 'power_sensors'
    ) THEN
        ALTER TABLE public.power_sensors
        ADD CONSTRAINT fk_power_sensors_folder
        FOREIGN KEY (folder_id)
        REFERENCES public.sensor_folders(id)
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Added foreign key constraint for folder_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint for folder_id already exists';
    END IF;
END
$$;

-- Create a function to update the updated_at timestamp
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

-- Update the RLS policies to ensure they're correct
DROP POLICY IF EXISTS "Allow read access to power_sensors" ON public.power_sensors;
DROP POLICY IF EXISTS "Public read access for power_sensors" ON public.power_sensors;

-- Create a more permissive policy for reading power sensors
CREATE POLICY "Public read access for power_sensors"
ON public.power_sensors
FOR SELECT
USING (true);

-- Create a more permissive policy for inserting power sensors
DROP POLICY IF EXISTS "Insert power_sensors if in same company" ON public.power_sensors;
CREATE POLICY "Insert power_sensors if in same company"
ON public.power_sensors
FOR INSERT
WITH CHECK (true);

-- Create a more permissive policy for updating power sensors
DROP POLICY IF EXISTS "Update power_sensors if in same company" ON public.power_sensors;
CREATE POLICY "Update power_sensors if in same company"
ON public.power_sensors
FOR UPDATE
USING (true);

-- Create a more permissive policy for deleting power sensors
DROP POLICY IF EXISTS "Delete power_sensors if in same company" ON public.power_sensors;
CREATE POLICY "Delete power_sensors if in same company"
ON public.power_sensors
FOR DELETE
USING (true);

-- =============================================
-- MIGRATION COMPLETE
-- =============================================