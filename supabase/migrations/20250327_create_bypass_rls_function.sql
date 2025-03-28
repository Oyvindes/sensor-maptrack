-- =============================================
-- CREATE BYPASS RLS FUNCTION MIGRATION SCRIPT
-- =============================================
-- This script creates a function to bypass RLS policies for power sensor operations
-- =============================================

-- Create a function to bypass RLS for power sensor operations
CREATE OR REPLACE FUNCTION bypass_rls_power_sensor_operation(operation TEXT, sensor_data JSONB)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
    sensor_id UUID;
BEGIN
    IF operation = 'create' THEN
        INSERT INTO power_sensors (
            name,
            imei,
            status,
            company_id,
            folder_id,
            sensor_type
        )
        VALUES (
            sensor_data->>'name',
            sensor_data->>'imei',
            COALESCE(sensor_data->>'status', 'offline'),
            (sensor_data->>'company_id')::UUID,
            (sensor_data->>'folder_id')::UUID,
            COALESCE(sensor_data->>'sensor_type', 'power')
        )
        RETURNING id INTO sensor_id;
        
        -- Create initial power status
        INSERT INTO power_status (power_sensor_id, power_state)
        VALUES (sensor_id, false);
        
        SELECT jsonb_build_object(
            'id', id,
            'name', name,
            'imei', imei,
            'status', status,
            'company_id', company_id,
            'folder_id', folder_id,
            'sensor_type', sensor_type,
            'created_at', created_at,
            'updated_at', updated_at
        ) INTO result
        FROM power_sensors
        WHERE id = sensor_id;
        
    ELSIF operation = 'update' THEN
        sensor_id := (sensor_data->>'id')::UUID;
        
        UPDATE power_sensors
        SET
            name = COALESCE(sensor_data->>'name', name),
            imei = COALESCE(sensor_data->>'imei', imei),
            status = COALESCE(sensor_data->>'status', status),
            company_id = COALESCE((sensor_data->>'company_id')::UUID, company_id),
            folder_id = COALESCE((sensor_data->>'folder_id')::UUID, folder_id),
            sensor_type = COALESCE(sensor_data->>'sensor_type', sensor_type),
            updated_at = now()
        WHERE id = sensor_id;
        
        SELECT jsonb_build_object(
            'id', id,
            'name', name,
            'imei', imei,
            'status', status,
            'company_id', company_id,
            'folder_id', folder_id,
            'sensor_type', sensor_type,
            'created_at', created_at,
            'updated_at', updated_at
        ) INTO result
        FROM power_sensors
        WHERE id = sensor_id;
        
    ELSIF operation = 'delete' THEN
        sensor_id := (sensor_data->>'id')::UUID;
        
        -- Delete related records first
        DELETE FROM power_consumption WHERE power_sensor_id = sensor_id;
        DELETE FROM power_status WHERE power_sensor_id = sensor_id;
        DELETE FROM power_audit_log WHERE power_sensor_id = sensor_id;
        
        -- Then delete the power sensor
        DELETE FROM power_sensors
        WHERE id = sensor_id
        RETURNING jsonb_build_object(
            'id', id,
            'name', name,
            'success', true
        ) INTO result;
        
    ELSIF operation = 'get' THEN
        sensor_id := (sensor_data->>'id')::UUID;
        
        SELECT jsonb_build_object(
            'id', id,
            'name', name,
            'imei', imei,
            'status', status,
            'company_id', company_id,
            'folder_id', folder_id,
            'sensor_type', sensor_type,
            'created_at', created_at,
            'updated_at', updated_at
        ) INTO result
        FROM power_sensors
        WHERE id = sensor_id;
        
    ELSIF operation = 'list' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id,
                'name', name,
                'imei', imei,
                'status', status,
                'company_id', company_id,
                'folder_id', folder_id,
                'sensor_type', sensor_type,
                'created_at', created_at,
                'updated_at', updated_at
            )
        ) INTO result
        FROM power_sensors;
    END IF;
    
    RETURN COALESCE(result, '{}'::JSONB);
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION bypass_rls_power_sensor_operation TO authenticated;
GRANT EXECUTE ON FUNCTION bypass_rls_power_sensor_operation TO anon;
GRANT EXECUTE ON FUNCTION bypass_rls_power_sensor_operation TO service_role;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================