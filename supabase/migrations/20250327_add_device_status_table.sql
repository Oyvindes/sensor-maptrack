-- Create device_status table to track power state of smart plugs
CREATE TABLE IF NOT EXISTS public.device_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL,
    power_state BOOLEAN NOT NULL DEFAULT false, -- true = on, false = off
    last_toggled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_toggled_by UUID, -- Reference to the user who last toggled the device
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_device_status_device_id ON public.device_status(device_id);

-- Add RLS policies
ALTER TABLE public.device_status ENABLE ROW LEVEL SECURITY;

-- Allow read access to device_status for authenticated users
CREATE POLICY "Allow read access to device_status"
ON public.device_status
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow company admins to manage their company's device status
CREATE POLICY "Allow company admins to manage their device_status"
ON public.device_status
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
COMMENT ON TABLE public.device_status IS 'Tracks power state of smart plug sensors';

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_device_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_device_status_updated_at
BEFORE UPDATE ON public.device_status
FOR EACH ROW
EXECUTE FUNCTION update_device_status_updated_at();

-- Add foreign key constraint
ALTER TABLE public.device_status
ADD CONSTRAINT fk_device_status
FOREIGN KEY (device_id) REFERENCES public.sensors(id) ON DELETE CASCADE;