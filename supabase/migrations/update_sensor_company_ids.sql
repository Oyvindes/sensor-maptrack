-- This script updates the sensors with the correct company IDs

-- First, let's get the company IDs
-- We'll use a temporary table to store the company IDs
CREATE TEMP TABLE company_mapping (
  company_code TEXT,
  company_id UUID
);

-- Insert the company IDs from the companies table
INSERT INTO company_mapping (company_code, company_id)
SELECT 'system', id FROM public.companies WHERE name = 'System Company'
UNION ALL
SELECT 'company-001', id FROM public.companies WHERE name = 'Acme Corporation'
UNION ALL
SELECT 'company-002', id FROM public.companies WHERE name = 'TechNova Solutions'
UNION ALL
SELECT 'company-003', id FROM public.companies WHERE name = 'Green Energy Ltd'
UNION ALL
SELECT 'company-004', id FROM public.companies WHERE name = 'Briks';

-- Update the sensors with the correct company IDs
UPDATE public.sensors
SET company_id = (SELECT company_id FROM company_mapping WHERE company_code = 'company-001')
WHERE company_id = '11111111-1111-1111-1111-111111111111';

UPDATE public.sensors
SET company_id = (SELECT company_id FROM company_mapping WHERE company_code = 'company-002')
WHERE company_id = '22222222-2222-2222-2222-222222222222';

UPDATE public.sensors
SET company_id = (SELECT company_id FROM company_mapping WHERE company_code = 'company-003')
WHERE company_id = '33333333-3333-3333-3333-333333333333';

UPDATE public.sensors
SET company_id = (SELECT company_id FROM company_mapping WHERE company_code = 'company-004')
WHERE company_id = '44444444-4444-4444-4444-444444444444';

UPDATE public.sensors
SET company_id = (SELECT company_id FROM company_mapping WHERE company_code = 'system')
WHERE company_id = '00000000-0000-0000-0000-000000000000';

-- Drop the temporary table
DROP TABLE company_mapping;

-- Output the updated sensors
SELECT s.id, s.name, s.company_id, c.name as company_name
FROM public.sensors s
JOIN public.companies c ON s.company_id = c.id;