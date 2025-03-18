-- Create enum type for insurance companies
CREATE TYPE insurance_company AS ENUM (
    'Gjensidige',
    'If',
    'Tryg',
    'SpareBank 1',
    'Storebrand',
    'Fremtind',
    'Eika Forsikring',
    'KLP',
    'Protector Forsikring',
    'Frende Forsikring',
    'DNB Forsikring'
);

-- Add insurance_company column to sensor_folders table
ALTER TABLE sensor_folders
ADD COLUMN insurance_company insurance_company;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their company's folders" ON sensor_folders;
DROP POLICY IF EXISTS "Company admins can update their company's folders" ON sensor_folders;

-- Create new policies
CREATE POLICY "Users can view their company's folders"
ON sensor_folders
FOR SELECT
USING (
    auth.uid() IN (
        SELECT id FROM users
        WHERE company_id = sensor_folders.company_id
    )
);

CREATE POLICY "Company admins can update their company's folders"
ON sensor_folders
FOR UPDATE
USING (
    auth.uid() IN (
        SELECT id FROM users
        WHERE company_id = sensor_folders.company_id
        AND (is_company_admin = true OR role = 'admin')
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM users
        WHERE company_id = sensor_folders.company_id
        AND (is_company_admin = true OR role = 'admin')
    )
);