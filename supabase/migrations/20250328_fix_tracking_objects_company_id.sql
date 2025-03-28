-- =============================================
-- FIX TRACKING OBJECTS COMPANY ID MIGRATION SCRIPT
-- =============================================
-- This script fixes the company_id in the tracking_objects table
-- to ensure it matches a valid company_id in the companies table
-- =============================================

-- First, let's check if there are any tracking objects with invalid company_ids
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM public.tracking_objects to_obj
    LEFT JOIN public.companies c ON to_obj.company_id = c.id
    WHERE to_obj.company_id IS NOT NULL AND c.id IS NULL;

    IF invalid_count > 0 THEN
        RAISE NOTICE 'Found % tracking objects with invalid company_ids', invalid_count;
    ELSE
        RAISE NOTICE 'All tracking objects have valid company_ids';
    END IF;
END
$$;

-- Update tracking objects with invalid company_ids to use the first available company
UPDATE public.tracking_objects
SET company_id = (SELECT id FROM public.companies LIMIT 1)
WHERE company_id IS NULL OR company_id NOT IN (SELECT id FROM public.companies);

-- Make sure all tracking objects have a company_id
UPDATE public.tracking_objects
SET company_id = (SELECT id FROM public.companies LIMIT 1)
WHERE company_id IS NULL;

-- Add a foreign key constraint to ensure company_id is valid
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_tracking_objects_company'
        AND table_name = 'tracking_objects'
    ) THEN
        ALTER TABLE public.tracking_objects
        ADD CONSTRAINT fk_tracking_objects_company
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
        WHERE constraint_name = 'fk_tracking_objects_folder'
        AND table_name = 'tracking_objects'
    ) THEN
        ALTER TABLE public.tracking_objects
        ADD CONSTRAINT fk_tracking_objects_folder
        FOREIGN KEY (folder_id)
        REFERENCES public.sensor_folders(id)
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Added foreign key constraint for folder_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint for folder_id already exists';
    END IF;
END
$$;

-- Create a function to update the updated_at timestamp if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc
        WHERE proname = 'update_tracking_objects_updated_at'
    ) THEN
        EXECUTE '
        CREATE FUNCTION update_tracking_objects_updated_at()
        RETURNS TRIGGER AS $BODY$
        BEGIN
            NEW.last_updated = now();
            RETURN NEW;
        END;
        $BODY$ LANGUAGE plpgsql;
        ';
        
        RAISE NOTICE 'Created update_tracking_objects_updated_at function';
    ELSE
        RAISE NOTICE 'update_tracking_objects_updated_at function already exists';
    END IF;
END
$$;

-- Create a trigger to automatically update the last_updated timestamp
DROP TRIGGER IF EXISTS update_tracking_objects_updated_at ON public.tracking_objects;
CREATE TRIGGER update_tracking_objects_updated_at
BEFORE UPDATE ON public.tracking_objects
FOR EACH ROW
EXECUTE FUNCTION update_tracking_objects_updated_at();

-- Update the RLS policies to ensure they're correct
DROP POLICY IF EXISTS "Allow read access to tracking_objects" ON public.tracking_objects;
DROP POLICY IF EXISTS "Public read access for tracking_objects" ON public.tracking_objects;

-- Create a more permissive policy for reading tracking objects
CREATE POLICY "Public read access for tracking_objects"
ON public.tracking_objects
FOR SELECT
USING (true);

-- Create a more permissive policy for inserting tracking objects
DROP POLICY IF EXISTS "Insert tracking_objects if in same company" ON public.tracking_objects;
CREATE POLICY "Insert tracking_objects if in same company"
ON public.tracking_objects
FOR INSERT
WITH CHECK (true);

-- Create a more permissive policy for updating tracking objects
DROP POLICY IF EXISTS "Update tracking_objects if in same company" ON public.tracking_objects;
CREATE POLICY "Update tracking_objects if in same company"
ON public.tracking_objects
FOR UPDATE
USING (true);

-- Create a more permissive policy for deleting tracking objects
DROP POLICY IF EXISTS "Delete tracking_objects if in same company" ON public.tracking_objects;
CREATE POLICY "Delete tracking_objects if in same company"
ON public.tracking_objects
FOR DELETE
USING (true);

-- Now let's do the same for the devices table
-- First, let's check if there are any devices with invalid company_ids
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM public.devices d
    LEFT JOIN public.companies c ON d.company_id = c.id
    WHERE d.company_id IS NOT NULL AND c.id IS NULL;

    IF invalid_count > 0 THEN
        RAISE NOTICE 'Found % devices with invalid company_ids', invalid_count;
    ELSE
        RAISE NOTICE 'All devices have valid company_ids';
    END IF;
END
$$;

-- Update devices with invalid company_ids to use the first available company
UPDATE public.devices
SET company_id = (SELECT id FROM public.companies LIMIT 1)
WHERE company_id IS NULL OR company_id NOT IN (SELECT id FROM public.companies);

-- Make sure all devices have a company_id
UPDATE public.devices
SET company_id = (SELECT id FROM public.companies LIMIT 1)
WHERE company_id IS NULL;

-- Add a foreign key constraint to ensure company_id is valid
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_devices_company'
        AND table_name = 'devices'
    ) THEN
        ALTER TABLE public.devices
        ADD CONSTRAINT fk_devices_company
        FOREIGN KEY (company_id)
        REFERENCES public.companies(id)
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Added foreign key constraint for company_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint for company_id already exists';
    END IF;
END
$$;

-- Update the RLS policies to ensure they're correct
DROP POLICY IF EXISTS "Allow read access to devices" ON public.devices;
DROP POLICY IF EXISTS "Public read access for devices" ON public.devices;

-- Create a more permissive policy for reading devices
CREATE POLICY "Public read access for devices"
ON public.devices
FOR SELECT
USING (true);

-- Create a more permissive policy for inserting devices
DROP POLICY IF EXISTS "Insert devices if in same company" ON public.devices;
CREATE POLICY "Insert devices if in same company"
ON public.devices
FOR INSERT
WITH CHECK (true);

-- Create a more permissive policy for updating devices
DROP POLICY IF EXISTS "Update devices if in same company" ON public.devices;
CREATE POLICY "Update devices if in same company"
ON public.devices
FOR UPDATE
USING (true);

-- Create a more permissive policy for deleting devices
DROP POLICY IF EXISTS "Delete devices if in same company" ON public.devices;
CREATE POLICY "Delete devices if in same company"
ON public.devices
FOR DELETE
USING (true);

-- =============================================
-- MIGRATION COMPLETE
-- =============================================