-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'master')),
  company_id UUID REFERENCES public.companies(id),
  last_login TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  is_company_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON public.users;
  DROP POLICY IF EXISTS "Users can be inserted by authenticated users with appropriate role" ON public.users;
  DROP POLICY IF EXISTS "Users can be updated by authenticated users with appropriate role" ON public.users;
  DROP POLICY IF EXISTS "Users can be deleted by authenticated users with appropriate role" ON public.users;
  
  -- Create new policies
  CREATE POLICY "Users are viewable by authenticated users" 
    ON public.users FOR SELECT 
    USING (true);

  CREATE POLICY "Users can be inserted by anyone" 
    ON public.users FOR INSERT 
    WITH CHECK (true);

  CREATE POLICY "Users can be updated by anyone" 
    ON public.users FOR UPDATE 
    USING (true);

  CREATE POLICY "Users can be deleted by anyone" 
    ON public.users FOR DELETE 
    USING (true);
END
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

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

-- Insert or update mock users
INSERT INTO public.users (id, name, email, password_hash, role, company_id, last_login, status, is_company_admin, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Master Admin', 'admin@system.com', 'admin123', 'master',
   (SELECT company_id FROM company_mapping WHERE company_code = 'system'),
   NOW(), 'active', true, NOW(), NOW())
ON CONFLICT (email)
DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  last_login = EXCLUDED.last_login,
  status = EXCLUDED.status,
  is_company_admin = EXCLUDED.is_company_admin,
  updated_at = NOW();

INSERT INTO public.users (id, name, email, password_hash, role, company_id, last_login, status, is_company_admin, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'John Doe', 'john.doe@acme.com', 'password123', 'admin',
   (SELECT company_id FROM company_mapping WHERE company_code = 'company-001'),
   '2023-08-15T09:30:00', 'active', true, NOW(), NOW())
ON CONFLICT (email)
DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  last_login = EXCLUDED.last_login,
  status = EXCLUDED.status,
  is_company_admin = EXCLUDED.is_company_admin,
  updated_at = NOW();

INSERT INTO public.users (id, name, email, password_hash, role, company_id, last_login, status, is_company_admin, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Jane Smith', 'jane.smith@acme.com', 'password123', 'user',
   (SELECT company_id FROM company_mapping WHERE company_code = 'company-001'),
   '2023-08-14T14:45:00', 'active', false, NOW(), NOW())
ON CONFLICT (email)
DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  last_login = EXCLUDED.last_login,
  status = EXCLUDED.status,
  is_company_admin = EXCLUDED.is_company_admin,
  updated_at = NOW();

INSERT INTO public.users (id, name, email, password_hash, role, company_id, last_login, status, is_company_admin, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Alice Johnson', 'alice@technova.com', 'password123', 'admin',
   (SELECT company_id FROM company_mapping WHERE company_code = 'company-002'),
   '2023-08-15T11:20:00', 'active', true, NOW(), NOW())
ON CONFLICT (email)
DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  last_login = EXCLUDED.last_login,
  status = EXCLUDED.status,
  is_company_admin = EXCLUDED.is_company_admin,
  updated_at = NOW();

INSERT INTO public.users (id, name, email, password_hash, role, company_id, last_login, status, is_company_admin, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Bob Williams', 'bob@technova.com', 'password123', 'user',
   (SELECT company_id FROM company_mapping WHERE company_code = 'company-002'),
   '2023-08-10T08:15:00', 'inactive', false, NOW(), NOW())
ON CONFLICT (email)
DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  last_login = EXCLUDED.last_login,
  status = EXCLUDED.status,
  is_company_admin = EXCLUDED.is_company_admin,
  updated_at = NOW();

INSERT INTO public.users (id, name, email, password_hash, role, company_id, last_login, status, is_company_admin, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Charlie Brown', 'charlie@greenenergy.com', 'password123', 'admin',
   (SELECT company_id FROM company_mapping WHERE company_code = 'company-003'),
   '2023-08-13T16:30:00', 'active', true, NOW(), NOW())
ON CONFLICT (email)
DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  last_login = EXCLUDED.last_login,
  status = EXCLUDED.status,
  is_company_admin = EXCLUDED.is_company_admin,
  updated_at = NOW();

INSERT INTO public.users (id, name, email, password_hash, role, company_id, last_login, status, is_company_admin, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Oe Briks', 'oe@briks.no', 'Briks42!', 'master',
   (SELECT company_id FROM company_mapping WHERE company_code = 'company-004'),
   NOW(), 'active', true, NOW(), NOW())
ON CONFLICT (email)
DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  last_login = EXCLUDED.last_login,
  status = EXCLUDED.status,
  is_company_admin = EXCLUDED.is_company_admin,
  updated_at = NOW();

INSERT INTO public.users (id, name, email, password_hash, role, company_id, last_login, status, is_company_admin, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Pes Briks', 'pes@briks.no', 'Briks42!', 'master',
   (SELECT company_id FROM company_mapping WHERE company_code = 'company-004'),
   NOW(), 'active', true, NOW(), NOW())
ON CONFLICT (email)
DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  last_login = EXCLUDED.last_login,
  status = EXCLUDED.status,
  is_company_admin = EXCLUDED.is_company_admin,
  updated_at = NOW();

-- Drop the temporary table
DROP TABLE company_mapping;