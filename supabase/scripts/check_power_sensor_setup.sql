-- =============================================
-- POWER SENSOR INTEGRATION DIAGNOSTIC SCRIPT
-- =============================================
-- This script checks the setup of the power sensor integration:
-- 1. Checks if all required tables exist
-- 2. Checks table structures
-- 3. Checks RLS policies
-- 4. Checks foreign key constraints
-- 5. Checks sample data
-- =============================================

-- =============================================
-- PART 1: CHECK TABLES EXISTENCE
-- =============================================
-- 1. CHECKING TABLE EXISTENCE
-- -------------------------------------------------------

-- Check if power_sensors table exists
SELECT 'power_sensors_table_exists' AS check_name, EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'power_sensors'
) AS result;

-- Check if power_consumption table exists
SELECT 'power_consumption_table_exists' AS check_name, EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'power_consumption'
) AS result;

-- Check if power_status table exists
SELECT 'power_status_table_exists' AS check_name, EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'power_status'
) AS result;

-- Check if power_audit_log table exists
SELECT 'power_audit_log_table_exists' AS check_name, EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'power_audit_log'
) AS result;

-- =============================================
-- PART 2: CHECK TABLE STRUCTURES
-- =============================================
-- 2. CHECKING TABLE STRUCTURES
-- -------------------------------------------------------

-- Check power_sensors table structure
SELECT 'power_sensors_columns' AS check_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'power_sensors'
ORDER BY ordinal_position;

-- Check power_consumption table structure
SELECT 'power_consumption_columns' AS check_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'power_consumption'
ORDER BY ordinal_position;

-- Check power_status table structure
SELECT 'power_status_columns' AS check_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'power_status'
ORDER BY ordinal_position;

-- Check power_audit_log table structure
SELECT 'power_audit_log_columns' AS check_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'power_audit_log'
ORDER BY ordinal_position;

-- =============================================
-- PART 3: CHECK RLS POLICIES
-- =============================================
-- 3. CHECKING RLS POLICIES
-- -------------------------------------------------------

-- Check if RLS is enabled for power_sensors
SELECT 'power_sensors_rls_enabled' AS check_name, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'power_sensors';

-- Check RLS policies for power_sensors
SELECT 'power_sensors_rls_policies' AS check_name, policyname, permissive, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'power_sensors';

-- Check if RLS is enabled for power_consumption
SELECT 'power_consumption_rls_enabled' AS check_name, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'power_consumption';

-- Check RLS policies for power_consumption
SELECT 'power_consumption_rls_policies' AS check_name, policyname, permissive, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'power_consumption';

-- Check if RLS is enabled for power_status
SELECT 'power_status_rls_enabled' AS check_name, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'power_status';

-- Check RLS policies for power_status
SELECT 'power_status_rls_policies' AS check_name, policyname, permissive, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'power_status';

-- Check if RLS is enabled for power_audit_log
SELECT 'power_audit_log_rls_enabled' AS check_name, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'power_audit_log';

-- Check RLS policies for power_audit_log
SELECT 'power_audit_log_rls_policies' AS check_name, policyname, permissive, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'power_audit_log';

-- =============================================
-- PART 4: CHECK FOREIGN KEY CONSTRAINTS
-- =============================================
-- 4. CHECKING FOREIGN KEY CONSTRAINTS
-- -------------------------------------------------------

-- Check foreign key constraints for power_consumption
SELECT 'power_consumption_foreign_keys' AS check_name,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'power_consumption';

-- Check foreign key constraints for power_status
SELECT 'power_status_foreign_keys' AS check_name,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'power_status';

-- Check foreign key constraints for power_audit_log
SELECT 'power_audit_log_foreign_keys' AS check_name,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'power_audit_log';

-- =============================================
-- PART 5: CHECK SAMPLE DATA
-- =============================================
-- 5. CHECKING SAMPLE DATA
-- -------------------------------------------------------

-- Check if there are any power sensors
SELECT 'power_sensors_count' AS check_name, COUNT(*) AS result FROM public.power_sensors;

-- Check sample power sensors
SELECT 'power_sensors_sample' AS check_name, id, name, imei, status, company_id, folder_id, created_at, updated_at 
FROM public.power_sensors 
LIMIT 5;

-- Check if there are any power consumption records
SELECT 'power_consumption_count' AS check_name, COUNT(*) AS result FROM public.power_consumption;

-- Check sample power consumption records
SELECT 'power_consumption_sample' AS check_name, id, power_sensor_id, timestamp, energy, cost, price_region, created_at 
FROM public.power_consumption 
LIMIT 5;

-- Check if there are any power status records
SELECT 'power_status_count' AS check_name, COUNT(*) AS result FROM public.power_status;

-- Check sample power status records
SELECT 'power_status_sample' AS check_name, id, power_sensor_id, power_state, last_toggled_at, last_toggled_by, created_at, updated_at 
FROM public.power_status 
LIMIT 5;

-- Check if there are any power audit log records
SELECT 'power_audit_log_count' AS check_name, COUNT(*) AS result FROM public.power_audit_log;

-- Check sample power audit log records
SELECT 'power_audit_log_sample' AS check_name, id, power_sensor_id, operation_type, operation_details, performed_by, performed_at 
FROM public.power_audit_log 
LIMIT 5;

-- =============================================
-- PART 6: CHECK TRIGGERS
-- =============================================
-- 6. CHECKING TRIGGERS
-- -------------------------------------------------------

-- Check triggers on power_sensors
SELECT 'power_sensors_triggers' AS check_name, trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'power_sensors'
AND trigger_schema = 'public';

-- Check triggers on power_status
SELECT 'power_status_triggers' AS check_name, trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'power_status'
AND trigger_schema = 'public';

-- =============================================
-- PART 7: CHECK INDEXES
-- =============================================
-- 7. CHECKING INDEXES
-- -------------------------------------------------------

-- Check indexes on power_sensors
SELECT 'power_sensors_indexes' AS check_name,
    i.relname AS index_name,
    a.attname AS column_name
FROM
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
WHERE
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND a.attnum = ANY(ix.indkey)
    AND t.relkind = 'r'
    AND t.relname = 'power_sensors'
ORDER BY
    i.relname;

-- Check indexes on power_consumption
SELECT 'power_consumption_indexes' AS check_name,
    i.relname AS index_name,
    a.attname AS column_name
FROM
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
WHERE
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND a.attnum = ANY(ix.indkey)
    AND t.relkind = 'r'
    AND t.relname = 'power_consumption'
ORDER BY
    i.relname;

-- Check indexes on power_status
SELECT 'power_status_indexes' AS check_name,
    i.relname AS index_name,
    a.attname AS column_name
FROM
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
WHERE
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND a.attnum = ANY(ix.indkey)
    AND t.relkind = 'r'
    AND t.relname = 'power_status'
ORDER BY
    i.relname;

-- Check indexes on power_audit_log
SELECT 'power_audit_log_indexes' AS check_name,
    i.relname AS index_name,
    a.attname AS column_name
FROM
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
WHERE
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND a.attnum = ANY(ix.indkey)
    AND t.relkind = 'r'
    AND t.relname = 'power_audit_log'
ORDER BY
    i.relname;

-- =============================================
-- PART 8: COMPARE WITH REGULAR SENSORS TABLE
-- =============================================
-- 8. COMPARING WITH REGULAR SENSORS TABLE
-- -------------------------------------------------------

-- Check regular sensors table structure
SELECT 'sensors_columns' AS check_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'sensors'
ORDER BY ordinal_position;

-- Check RLS policies for regular sensors
SELECT 'sensors_rls_policies' AS check_name, policyname, permissive, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'sensors';

-- =============================================
-- DIAGNOSTIC COMPLETE
-- =============================================