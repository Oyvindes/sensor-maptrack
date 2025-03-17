-- Create devices table
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'maintenance', 'warning')),
    company_id UUID REFERENCES public.companies(id),
    location JSONB,
    imei TEXT,
    folder_id UUID REFERENCES public.sensor_folders(id),
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comment to devices table
COMMENT ON TABLE public.devices IS 'Stores information about physical devices';

-- Add RLS policies for devices table
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to devices
CREATE POLICY "Allow read access to devices" 
ON public.devices 
FOR SELECT 
USING (true);

-- Create policy to allow insert/update/delete for authenticated users
CREATE POLICY "Allow full access to authenticated users" 
ON public.devices 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Add folder_id column to tracking_objects table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tracking_objects' 
        AND column_name = 'folder_id'
    ) THEN
        ALTER TABLE public.tracking_objects 
        ADD COLUMN folder_id UUID REFERENCES public.sensor_folders(id);
    END IF;
END $$;

-- Create device_positions table for storing historical position data
CREATE TABLE IF NOT EXISTS public.device_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    speed NUMERIC DEFAULT 0,
    direction NUMERIC DEFAULT 0,
    battery_level NUMERIC DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comment to device_positions table
COMMENT ON TABLE public.device_positions IS 'Stores historical position data for devices';

-- Add RLS policies for device_positions table
ALTER TABLE public.device_positions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to device_positions
CREATE POLICY "Allow read access to device_positions" 
ON public.device_positions 
FOR SELECT 
USING (true);

-- Create policy to allow insert/update/delete for authenticated users
CREATE POLICY "Allow full access to authenticated users" 
ON public.device_positions 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create function to migrate mock devices to the database
CREATE OR REPLACE FUNCTION public.migrate_mock_devices()
RETURNS VOID AS $$
DECLARE
    device_record RECORD;
BEGIN
    -- Insert mock devices if they don't exist
    -- Device 1
    IF NOT EXISTS (SELECT 1 FROM public.devices WHERE name = 'Temperature Sensor 1') THEN
        INSERT INTO public.devices (name, type, status, company_id, location, imei)
        VALUES ('Temperature Sensor 1', 'temperature', 'online', 
                (SELECT id FROM public.companies WHERE name = 'Acme Corp' LIMIT 1),
                '{"lat": 63.4305, "lng": 10.3951}', '123456789012345');
    END IF;

    -- Device 2
    IF NOT EXISTS (SELECT 1 FROM public.devices WHERE name = 'Humidity Sensor 1') THEN
        INSERT INTO public.devices (name, type, status, company_id, location, imei)
        VALUES ('Humidity Sensor 1', 'humidity', 'online', 
                (SELECT id FROM public.companies WHERE name = 'Acme Corp' LIMIT 1),
                '{"lat": 63.4315, "lng": 10.3961}', '223456789012345');
    END IF;

    -- Device 3
    IF NOT EXISTS (SELECT 1 FROM public.devices WHERE name = 'Pressure Sensor 1') THEN
        INSERT INTO public.devices (name, type, status, company_id, location, imei)
        VALUES ('Pressure Sensor 1', 'pressure', 'offline', 
                (SELECT id FROM public.companies WHERE name = 'TechNova' LIMIT 1),
                '{"lat": 63.4325, "lng": 10.3971}', '323456789012345');
    END IF;

    -- Device 4
    IF NOT EXISTS (SELECT 1 FROM public.devices WHERE name = 'Motion Sensor 1') THEN
        INSERT INTO public.devices (name, type, status, company_id, location, imei)
        VALUES ('Motion Sensor 1', 'motion', 'maintenance', 
                (SELECT id FROM public.companies WHERE name = 'Green Energy' LIMIT 1),
                '{"lat": 63.4335, "lng": 10.3981}', '423456789012345');
    END IF;

    -- Add positions for each device
    FOR device_record IN SELECT id FROM public.devices LOOP
        INSERT INTO public.device_positions (device_id, latitude, longitude, speed, direction, battery_level)
        VALUES (
            device_record.id,
            63.4305 + random() * 0.01,
            10.3951 + random() * 0.01,
            random() * 50,
            random() * 360,
            50 + random() * 50
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;