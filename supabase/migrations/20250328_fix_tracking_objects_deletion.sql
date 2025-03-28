-- =============================================
-- FIX TRACKING OBJECTS DELETION MIGRATION SCRIPT
-- =============================================
-- This script adds proper foreign key constraints and triggers
-- to ensure that tracking objects are deleted when their
-- corresponding devices are deleted
-- =============================================

-- First, check if there are any orphaned tracking objects
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphaned_count
    FROM public.tracking_objects to_obj
    LEFT JOIN public.devices d ON to_obj.id = d.id
    WHERE d.id IS NULL;

    IF orphaned_count > 0 THEN
        RAISE NOTICE 'Found % orphaned tracking objects without corresponding devices', orphaned_count;
    ELSE
        RAISE NOTICE 'No orphaned tracking objects found';
    END IF;
END
$$;

-- Delete any orphaned tracking objects
DELETE FROM public.tracking_objects
WHERE id NOT IN (SELECT id FROM public.devices);

-- Add a foreign key constraint to ensure tracking_objects are linked to devices
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_tracking_objects_device'
        AND table_name = 'tracking_objects'
    ) THEN
        ALTER TABLE public.tracking_objects
        ADD CONSTRAINT fk_tracking_objects_device
        FOREIGN KEY (id)
        REFERENCES public.devices(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint for tracking_objects to devices';
    ELSE
        RAISE NOTICE 'Foreign key constraint for tracking_objects to devices already exists';
    END IF;
END
$$;

-- Create a trigger function to automatically delete tracking objects when devices are deleted
DO $$
BEGIN
    EXECUTE '
    CREATE OR REPLACE FUNCTION delete_tracking_object_on_device_delete()
    RETURNS TRIGGER AS $BODY$
    BEGIN
        DELETE FROM public.tracking_objects WHERE id = OLD.id;
        RETURN OLD;
    END;
    $BODY$ LANGUAGE plpgsql;
    ';
    
    RAISE NOTICE 'Created delete_tracking_object_on_device_delete function';
END
$$;

-- Create a trigger to automatically delete tracking objects when devices are deleted
DROP TRIGGER IF EXISTS delete_tracking_object_trigger ON public.devices;
CREATE TRIGGER delete_tracking_object_trigger
BEFORE DELETE ON public.devices
FOR EACH ROW
EXECUTE FUNCTION delete_tracking_object_on_device_delete();

-- Log a notice about the trigger creation
DO $$
BEGIN
    RAISE NOTICE 'Created delete_tracking_object_trigger on devices table';
END
$$;

-- Create a trigger function to automatically delete device positions when devices are deleted
DO $$
BEGIN
    EXECUTE '
    CREATE OR REPLACE FUNCTION delete_device_positions_on_device_delete()
    RETURNS TRIGGER AS $BODY$
    BEGIN
        DELETE FROM public.device_positions WHERE device_id = OLD.id;
        RETURN OLD;
    END;
    $BODY$ LANGUAGE plpgsql;
    ';
    
    RAISE NOTICE 'Created delete_device_positions_on_device_delete function';
END
$$;

-- Create a trigger to automatically delete device positions when devices are deleted
DROP TRIGGER IF EXISTS delete_device_positions_trigger ON public.devices;
CREATE TRIGGER delete_device_positions_trigger
BEFORE DELETE ON public.devices
FOR EACH ROW
EXECUTE FUNCTION delete_device_positions_on_device_delete();

-- Log a notice about the trigger creation
DO $$
BEGIN
    RAISE NOTICE 'Created delete_device_positions_trigger on devices table';
END
$$;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================