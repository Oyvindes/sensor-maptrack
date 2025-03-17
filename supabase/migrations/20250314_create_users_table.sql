-- Create users table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_users_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the users table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'users'
  ) THEN
    -- Create the users table
    CREATE TABLE public.users (
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
    CREATE POLICY "Users are viewable by authenticated users" 
      ON public.users FOR SELECT 
      USING (auth.role() = 'authenticated');

    CREATE POLICY "Users can be inserted by authenticated users with appropriate role" 
      ON public.users FOR INSERT 
      WITH CHECK (auth.role() = 'authenticated' AND (
        auth.uid() IN (
          SELECT id FROM public.users WHERE role = 'master'
        ) OR (
          auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin' AND is_company_admin = true
          ) AND NEW.company_id = (
            SELECT company_id FROM public.users WHERE id = auth.uid()
          )
        )
      ));

    CREATE POLICY "Users can be updated by authenticated users with appropriate role" 
      ON public.users FOR UPDATE 
      USING (auth.role() = 'authenticated' AND (
        auth.uid() IN (
          SELECT id FROM public.users WHERE role = 'master'
        ) OR (
          auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin' AND is_company_admin = true
          ) AND users.company_id = (
            SELECT company_id FROM public.users WHERE id = auth.uid()
          )
        ) OR auth.uid() = id
      ));

    CREATE POLICY "Users can be deleted by authenticated users with appropriate role" 
      ON public.users FOR DELETE 
      USING (auth.role() = 'authenticated' AND (
        auth.uid() IN (
          SELECT id FROM public.users WHERE role = 'master'
        ) OR (
          auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin' AND is_company_admin = true
          ) AND users.company_id = (
            SELECT company_id FROM public.users WHERE id = auth.uid()
          )
        )
      ));

    -- Create indexes
    CREATE INDEX idx_users_email ON public.users(email);
    CREATE INDEX idx_users_company_id ON public.users(company_id);
    CREATE INDEX idx_users_role ON public.users(role);
  END IF;
END;
$$;