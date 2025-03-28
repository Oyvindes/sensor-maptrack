-- Create device_audit_log table to track all device operations
CREATE TABLE IF NOT EXISTS public.device_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL,
    operation_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'power_on', 'power_off', etc.
    operation_details JSONB DEFAULT '{}'::jsonb, -- Additional details about the operation
    performed_by UUID, -- Reference to the user who performed the operation
    performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Add foreign key constraint to link to users table
    CONSTRAINT fk_audit_user FOREIGN KEY (performed_by)
        REFERENCES public.users(id) ON DELETE SET NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_device_audit_device_id ON public.device_audit_log(device_id);
CREATE INDEX IF NOT EXISTS idx_device_audit_operation_type ON public.device_audit_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_device_audit_performed_at ON public.device_audit_log(performed_at);

-- Add RLS policies
ALTER TABLE public.device_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow read access to device_audit_log for authenticated users
CREATE POLICY "Allow read access to device_audit_log"
ON public.device_audit_log
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow company admins to insert into their company's device audit log
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
            device_id IN (
                SELECT id FROM public.sensors
                WHERE company_id IN (
                    SELECT company_id FROM public.users
                    WHERE id = auth.uid()
                )
            )
        )
    )
);

-- Add comment to explain the table
COMMENT ON TABLE public.device_audit_log IS 'Audit log for all device operations';

-- Create a function to automatically log device operations
CREATE OR REPLACE FUNCTION log_device_operation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.device_audit_log (
            device_id, 
            operation_type, 
            operation_details, 
            performed_by
        ) VALUES (
            NEW.id, 
            'create', 
            jsonb_build_object(
                'name', NEW.name,
                'type', NEW.type,
                'status', NEW.status,
                'company_id', NEW.company_id
            ),
            auth.uid()
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.device_audit_log (
            device_id, 
            operation_type, 
            operation_details, 
            performed_by
        ) VALUES (
            NEW.id, 
            'update', 
            jsonb_build_object(
                'old_name', OLD.name,
                'new_name', NEW.name,
                'old_type', OLD.type,
                'new_type', NEW.type,
                'old_status', OLD.status,
                'new_status', NEW.status
            ),
            auth.uid()
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.device_audit_log (
            device_id, 
            operation_type, 
            operation_details, 
            performed_by
        ) VALUES (
            OLD.id, 
            'delete', 
            jsonb_build_object(
                'name', OLD.name,
                'type', OLD.type,
                'status', OLD.status
            ),
            auth.uid()
        );
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically log device operations
CREATE TRIGGER log_device_insert
AFTER INSERT ON public.sensors
FOR EACH ROW
WHEN (NEW.type = 'power')
EXECUTE FUNCTION log_device_operation();

CREATE TRIGGER log_device_update
AFTER UPDATE ON public.sensors
FOR EACH ROW
WHEN (NEW.type = 'power' OR OLD.type = 'power')
EXECUTE FUNCTION log_device_operation();

CREATE TRIGGER log_device_delete
AFTER DELETE ON public.sensors
FOR EACH ROW
WHEN (OLD.type = 'power')
EXECUTE FUNCTION log_device_operation();

-- Add foreign key constraint
ALTER TABLE public.device_audit_log
ADD CONSTRAINT fk_device_audit
FOREIGN KEY (device_id) REFERENCES public.sensors(id) ON DELETE CASCADE;