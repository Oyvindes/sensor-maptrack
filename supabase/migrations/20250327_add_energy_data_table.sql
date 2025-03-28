-- Create energy_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.energy_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    energy INT4 NOT NULL, -- Energy consumption in watt-hours
    cost NUMERIC(10, 2), -- Cost in local currency
    price_region TEXT, -- Region for price calculation
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_energy_data_device_id ON public.energy_data(device_id);
CREATE INDEX IF NOT EXISTS idx_energy_data_timestamp ON public.energy_data(timestamp);

-- Add RLS policies
ALTER TABLE public.energy_data ENABLE ROW LEVEL SECURITY;

-- Allow read access to energy_data for authenticated users
CREATE POLICY "Allow read access to energy_data"
ON public.energy_data
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow company admins to manage their company's energy data
CREATE POLICY "Allow company admins to manage their energy_data"
ON public.energy_data
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
        -- User is a company admin and the energy data belongs to their company's sensor
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
COMMENT ON TABLE public.energy_data IS 'Stores energy consumption data from smart plug sensors';

-- Add foreign key constraint
ALTER TABLE public.energy_data
ADD CONSTRAINT fk_device
FOREIGN KEY (device_id) REFERENCES public.sensors(id) ON DELETE CASCADE;