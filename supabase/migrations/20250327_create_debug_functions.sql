-- =============================================
-- CREATE DEBUG FUNCTIONS MIGRATION SCRIPT
-- =============================================
-- This script creates helper functions for debugging
-- =============================================

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = table_name
    ) INTO table_exists;
    
    RETURN table_exists;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION check_table_exists TO authenticated;
GRANT EXECUTE ON FUNCTION check_table_exists TO anon;
GRANT EXECUTE ON FUNCTION check_table_exists TO service_role;

-- Function to get the count of rows in a table
CREATE OR REPLACE FUNCTION get_table_count(table_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    row_count INTEGER;
    query TEXT;
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = table_name
    ) THEN
        RETURN 0;
    END IF;
    
    -- Construct the query dynamically
    query := 'SELECT COUNT(*) FROM public.' || quote_ident(table_name);
    
    -- Execute the query
    EXECUTE query INTO row_count;
    
    RETURN row_count;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_table_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_count TO anon;
GRANT EXECUTE ON FUNCTION get_table_count TO service_role;

-- Function to create the check_table_exists function from JavaScript
CREATE OR REPLACE FUNCTION create_check_table_exists_function()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Drop the function if it exists
    DROP FUNCTION IF EXISTS check_table_exists(TEXT);
    
    -- Create the function
    EXECUTE '
    CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $func$
    DECLARE
        table_exists BOOLEAN;
    BEGIN
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = ''public'' 
            AND table_name = table_name
        ) INTO table_exists;
        
        RETURN table_exists;
    END;
    $func$;
    ';
    
    -- Grant execute permission on the function
    EXECUTE 'GRANT EXECUTE ON FUNCTION check_table_exists TO authenticated;';
    EXECUTE 'GRANT EXECUTE ON FUNCTION check_table_exists TO anon;';
    EXECUTE 'GRANT EXECUTE ON FUNCTION check_table_exists TO service_role;';
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_check_table_exists_function TO authenticated;
GRANT EXECUTE ON FUNCTION create_check_table_exists_function TO anon;
GRANT EXECUTE ON FUNCTION create_check_table_exists_function TO service_role;

-- Function to create the get_table_count function from JavaScript
CREATE OR REPLACE FUNCTION create_get_table_count_function()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Drop the function if it exists
    DROP FUNCTION IF EXISTS get_table_count(TEXT);
    
    -- Create the function
    EXECUTE '
    CREATE OR REPLACE FUNCTION get_table_count(table_name TEXT)
    RETURNS INTEGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $func$
    DECLARE
        row_count INTEGER;
        query TEXT;
    BEGIN
        -- Check if the table exists
        IF NOT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = ''public'' 
            AND table_name = table_name
        ) THEN
            RETURN 0;
        END IF;
        
        -- Construct the query dynamically
        query := ''SELECT COUNT(*) FROM public.'' || quote_ident(table_name);
        
        -- Execute the query
        EXECUTE query INTO row_count;
        
        RETURN row_count;
    END;
    $func$;
    ';
    
    -- Grant execute permission on the function
    EXECUTE 'GRANT EXECUTE ON FUNCTION get_table_count TO authenticated;';
    EXECUTE 'GRANT EXECUTE ON FUNCTION get_table_count TO anon;';
    EXECUTE 'GRANT EXECUTE ON FUNCTION get_table_count TO service_role;';
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_get_table_count_function TO authenticated;
GRANT EXECUTE ON FUNCTION create_get_table_count_function TO anon;
GRANT EXECUTE ON FUNCTION create_get_table_count_function TO service_role;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================