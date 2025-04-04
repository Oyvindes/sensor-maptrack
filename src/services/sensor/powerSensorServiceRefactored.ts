/**
 * Power Sensor Service (Refactored)
 * This service handles all operations related to power sensors using the standardized database service
 */

import { createDatabaseService } from '@/services/database/databaseService';
import { 
  PowerSensor, 
  PowerStatus, 
  PowerConsumptionData,
  PowerSensorSaveResult,
  PowerSensorDeleteResult,
  PowerToggleResult,
  DataOperationResult,
  DatabaseFilter
} from '@/types/sensorTypes';
import { toast } from 'sonner';
import { getCurrentUser } from '@/services/authService';
import { getApiUrl } from '@/utils/apiUtils';
import { mapCompanyIdToUUID, mapCompanyUUIDToId } from '@/utils/uuidUtils';
import { DatabaseResult } from '@/utils/databaseUtils';
import { supabase } from '@/integrations/supabase/client';

// Create database services for each table
const powerSensorDb = createDatabaseService<PowerSensor>('power_sensors', 'id', 'PowerSensorService');
const powerStatusDb = createDatabaseService<PowerStatus>('power_status', 'id', 'PowerStatusService');
const powerConsumptionDb = createDatabaseService<PowerConsumptionData>('power_consumption', 'id', 'PowerConsumptionService');
const powerAuditLogDb = createDatabaseService<any>('power_audit_log', 'id', 'PowerAuditLogService');

/**
 * Check if a string is a valid UUID
 * @param str The string to check
 * @returns True if the string is a valid UUID, false otherwise
 */
function isValidUUID(str: string): boolean {
  if (!str) return false;
  
  // UUID v4 regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
}

/**
 * Fetch power consumption data for a specific device
 * @param sensorId The ID of the power sensor to fetch consumption data for
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Promise with the power consumption data
 */
export const fetchPowerConsumption = async (
  sensorId: string,
  startDate?: Date,
  endDate?: Date
): Promise<PowerConsumptionData[]> => {
  try {
    // Build filters
    const filters: DatabaseFilter[] = [{ column: 'power_sensor_id', value: sensorId }];
    
    if (startDate) {
      filters.push({ 
        column: 'timestamp', 
        value: startDate.toISOString(),
        operator: 'gte' 
      });
    }
    
    if (endDate) {
      filters.push({ 
        column: 'timestamp', 
        value: endDate.toISOString(),
        operator: 'lte' 
      });
    }
    
    // Query the database
    const result = await powerConsumptionDb.getAll({
      filters: filters,
      orderBy: { column: 'timestamp', ascending: false }
    });
    
    if (!result.success) {
      console.error('Error fetching power consumption data:', result.error);
      toast.error('Failed to load power consumption data');
      return [];
    }
    
    return result.data || [];
  } catch (error) {
    console.error('Unexpected error in fetchPowerConsumption:', error);
    toast.error('Failed to load power consumption data');
    return [];
  }
};

/**
 * Fetch the current power status
 * @param sensorId The ID of the power sensor to fetch status for
 * @returns Promise with the power status
 */
export const fetchPowerStatus = async (
  sensorId: string
): Promise<PowerStatus | null> => {
  try {
    // Query the database
    const result = await powerStatusDb.getAll({
      filters: [{ column: 'power_sensor_id', value: sensorId }],
      orderBy: { column: 'updated_at', ascending: false },
      limit: 1
    });
    
    if (!result.success) {
      console.error('Error fetching power status:', result.error);
      toast.error('Failed to load power status');
      return null;
    }
    
    // If no records found, create a new one with default values
    if (!result.data || result.data.length === 0) {
      console.log(`No power status found for sensor ${sensorId}, creating new one`);
      const newStatus = await createPowerStatus(sensorId);
      return newStatus;
    }
    
    // Return the most recent power status
    return result.data[0];
  } catch (error) {
    console.error('Unexpected error in fetchPowerStatus:', error);
    toast.error('Failed to load power status');
    return null;
  }
};

/**
 * Create a new power status record with default values
 * @param sensorId The ID of the power sensor to create status for
 * @returns Promise with the created power status
 */
export const createPowerStatus = async (
  sensorId: string
): Promise<PowerStatus | null> => {
  try {
    const result = await powerStatusDb.create({
      power_sensor_id: sensorId,
      power_state: false,
      last_toggled_at: new Date().toISOString(),
      last_toggled_by: null
    });
    
    if (!result.success) {
      console.error('Error creating power status:', result.error);
      toast.error('Failed to create power status');
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.error('Unexpected error in createPowerStatus:', error);
    toast.error('Failed to create power status');
    return null;
  }
};

/**
 * Toggle the power state of a device
 * @param sensorId The ID of the power sensor to toggle
 * @param userId The ID of the user performing the toggle
 * @returns Promise with the updated power status
 */
export const togglePower = async (
  sensorId: string,
  userId: string
): Promise<PowerToggleResult> => {
  try {
    // First, get the current status
    const currentStatus = await fetchPowerStatus(sensorId);
    if (!currentStatus) {
      return {
        success: false,
        status: null,
        message: 'Failed to fetch current power status'
      };
    }
    
    // Toggle the power state
    const newPowerState = !currentStatus.power_state;
    
    // Update the status
    const result = await powerStatusDb.update(currentStatus.id, {
      power_state: newPowerState,
      last_toggled_at: new Date().toISOString(),
      last_toggled_by: isValidUUID(userId) ? userId : null
    });
    
    if (!result.success) {
      console.error('Error toggling power:', result.error);
      return {
        success: false,
        status: null,
        message: `Failed to toggle power: ${result.error}`
      };
    }
    
    // Get the updated status from the result
    const updatedStatus = result.data;
    
    if (!updatedStatus) {
      console.error('No updated status returned after toggle');
      return {
        success: false,
        status: null,
        message: 'Failed to get updated status after toggle'
      };
    }
    
    // Log the operation to the audit log
    await logPowerOperation(
      sensorId,
      newPowerState ? 'power_on' : 'power_off',
      { previous_state: currentStatus.power_state },
      userId
    );
    
    // Send HTTP POST to toggle power (as per requirements)
    try {
      console.log(`Sending power toggle request for sensor ${sensorId}, state: ${newPowerState}`);
      
      // Get the full API URL using the utility function
      const apiUrl = getApiUrl('/api/device/power-toggle');
      console.log(`Sending request to: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sensorId,
          powerState: newPowerState,
          imei: await getPowerSensorImei(sensorId)
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error sending power toggle command (${response.status} ${response.statusText}):`, errorText);
        toast.warning(`Device state updated in database, but remote command failed: ${response.status} ${response.statusText}`);
        return {
          success: true,
          status: updatedStatus,
          message: `Device power ${newPowerState ? 'turned on' : 'turned off'} in database, but remote command failed`
        };
      }
      
      // Parse the response to check if Node-RED forwarding was successful
      const responseData = await response.json();
      
      if (responseData.nodeRedForwarded) {
        if (responseData.nodeRedSuccess) {
          toast.success(`Command successfully sent to device via Node-RED`);
        } else {
          toast.warning(`Device state updated in database, but Node-RED command failed: ${responseData.deviceResponse?.error || 'Unknown error'}`);
        }
      }
    } catch (apiError) {
      console.error('Error sending power toggle command:', apiError);
      toast.warning(`Device state updated in database, but remote command failed: ${apiError.message || 'Connection error'}`);
    }
    
    return {
      success: true,
      status: updatedStatus,
      message: `Device power ${newPowerState ? 'turned on' : 'turned off'} successfully`
    };
  } catch (error) {
    console.error('Unexpected error in togglePower:', error);
    return {
      success: false,
      status: null,
      message: 'An unexpected error occurred while toggling power'
    };
  }
};

/**
 * Get the IMEI of a power sensor by its ID
 * @param sensorId The ID of the power sensor
 * @returns Promise with the power sensor IMEI
 */
export const getPowerSensorImei = async (sensorId: string): Promise<string | null> => {
  try {
    const result = await powerSensorDb.getById(sensorId, 'imei');
    
    if (!result.success || !result.data) {
      console.error('Error fetching power sensor IMEI:', result.error);
      return null;
    }
    
    return result.data.imei;
  } catch (error) {
    console.error('Unexpected error in getPowerSensorImei:', error);
    return null;
  }
};

/**
 * Log a power operation to the audit log
 * @param sensorId The ID of the power sensor
 * @param operationType The type of operation
 * @param operationDetails Additional details about the operation
 * @param userId The ID of the user performing the operation
 */
export const logPowerOperation = async (
  sensorId: string,
  operationType: string,
  operationDetails: any,
  userId: string
): Promise<void> => {
  try {
    await powerAuditLogDb.create({
      power_sensor_id: sensorId,
      operation_type: operationType,
      operation_details: operationDetails,
      performed_by: isValidUUID(userId) ? userId : null
    });
  } catch (error) {
    console.error('Error logging power operation:', error);
  }
};

/**
 * Fetch all power sensors
 * @returns Promise with the power sensors
 */
export const fetchPowerSensors = async (): Promise<PowerSensor[]> => {
  try {
    // Get the current user's company ID
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error('No current user found when fetching power sensors');
      toast.error('Failed to load power sensors: No current user');
      return [];
    }
    
    console.log('Fetching power sensors for user:', currentUser.id);
    
    try {
      // First try using the get_all_power_sensors function which bypasses RLS
      const result = await powerSensorDb.callFunction<any[]>('get_all_power_sensors');
      
      if (result.success && result.data && result.data.length > 0) {
        console.log('Successfully fetched power sensors using get_all_power_sensors:', result.data);
        
        // Map company IDs
        const formattedSensors: PowerSensor[] = result.data.map(sensor => ({
          id: sensor.id,
          name: sensor.name,
          imei: sensor.imei || '',
          status: sensor.status as 'online' | 'offline' | 'warning',
          lastUpdated: new Date(sensor.updated_at).toISOString(),
          companyId: sensor.company_id ? mapCompanyUUIDToId(sensor.company_id) : undefined,
          folderId: sensor.folder_id,
          sensorType: 'power' as const
        }));
        
        console.log('Formatted power sensors from get_all_power_sensors:', formattedSensors);
        return formattedSensors;
      } else {
        console.log('No results from get_all_power_sensors or error occurred:', result.error);
        
        // Fall back to the original method if the RPC call fails
        // Get the user's company ID
        const userResult = await customQuery<{ company_id: string }>(
          async () => {
            const { data, error } = await supabase
              .from('users')
              .select('company_id')
              .eq('id', currentUser.id)
              .single();
            return { data, error };
          },
          'getUserCompanyId'
        );
        
        if (!userResult.success || !userResult.data) {
          console.error('Error fetching user company ID:', userResult.error);
          toast.error('Failed to load power sensors: Could not determine company');
          return [];
        }
        
        const companyId = userResult.data.company_id;
        console.log('User company ID:', companyId);
        
        // Fetch power sensors for this company
        const sensorsResult = await customQuery<any[]>(
          async () => {
            let query = supabase
              .from('power_sensors')
              .select('id, name, imei, status, folder_id, company_id, created_at, updated_at, sensor_type');
            
            if (companyId) {
              query = query.eq('company_id', companyId);
            }
            
            const { data, error } = await query;
            return { data, error };
          },
          'fetchPowerSensors'
        );
        
        if (!sensorsResult.success) {
          console.error('Error fetching power sensors:', sensorsResult.error);
          toast.error('Failed to load power sensors');
          return [];
        }
        
        // Map the database results to PowerSensor format
        const formattedSensors: PowerSensor[] = sensorsResult.data.map(sensor => ({
          id: sensor.id,
          name: sensor.name,
          imei: sensor.imei || '',
          status: sensor.status as 'online' | 'offline' | 'warning',
          lastUpdated: new Date(sensor.updated_at).toISOString(),
          companyId: sensor.company_id ? mapCompanyUUIDToId(sensor.company_id) : undefined,
          folderId: sensor.folder_id,
          sensorType: 'power' as const
        }));
        
        console.log('Formatted power sensors from direct query:', formattedSensors);
        return formattedSensors;
      }
    } catch (innerError) {
      console.error('Error in power sensor fetch operations:', innerError);
      toast.error('Failed to load power sensors');
      return [];
    }
  } catch (error) {
    console.error('Unexpected error in fetchPowerSensors:', error);
    toast.error('Failed to load power sensors');
    return [];
  }
};

/**
 * Helper function for custom queries
 */
async function customQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  operationName: string
): Promise<DatabaseResult<T>> {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      console.error(`Error in ${operationName}:`, error);
      return {
        data: null,
        error: error.message || String(error),
        success: false
      };
    }
    
    return {
      data: data as T,
      error: null,
      success: true
    };
  } catch (error) {
    console.error(`Unexpected error in ${operationName}:`, error);
    return {
      data: null,
      error: error instanceof Error ? error.message : String(error),
      success: false
    };
  }
}

/**
 * Save a power sensor to the database
 * @param sensor The sensor data to save
 * @returns Promise with the result of the save operation
 */
export const savePowerSensor = async (
  sensor: Partial<PowerSensor> & { id: string }
): Promise<PowerSensorSaveResult> => {
  try {
    const isNewSensor = sensor.id.startsWith('sensor-') || sensor.id.startsWith('temp-');
    
    // Get the current user's company ID if not provided
    let companyId = sensor.companyId;
    if (!companyId) {
      const userCompanyId = await getCurrentUserCompanyId();
      if (userCompanyId) {
        companyId = mapCompanyUUIDToId(userCompanyId);
      } else {
        // Try to get the first company from the database
        const companiesResult = await customQuery<{ id: string }>(
          async () => {
            const { data, error } = await supabase
              .from('companies')
              .select('id')
              .limit(1)
              .single();
            return { data, error };
          },
          'getFirstCompany'
        );
        
        if (companiesResult.success && companiesResult.data) {
          companyId = mapCompanyUUIDToId(companiesResult.data.id);
        }
      }
    }
    
    // If we still don't have a company ID, return an error
    if (!companyId) {
      return {
        success: false,
        message: 'Failed to determine company ID. Please select a company.'
      };
    }
    
    // Prepare sensor data
    const sensorData = {
      id: isNewSensor ? undefined : sensor.id,
      name: sensor.name,
      status: sensor.status,
      imei: sensor.imei || 'POWER' + Date.now().toString(),
      company_id: mapCompanyIdToUUID(companyId),
      folder_id: sensor.folderId || null,
      sensor_type: 'power' // Always set the sensor_type to 'power'
    };
    
    console.log('Saving power sensor with data:', JSON.stringify(sensorData, null, 2));
    
    // Use the bypass_rls_power_sensor_operation function to avoid RLS issues
    const operation = isNewSensor ? 'create' : 'update';
    const result = await powerSensorDb.callFunction<{ id: string }>(
      'bypass_rls_power_sensor_operation',
      {
        operation: operation,
        sensor_data: sensorData
      }
    );
    
    if (!result.success || !result.data || !result.data.id) {
      console.error(`Error in ${operation}PowerSensor:`, result.error);
      return {
        success: false,
        message: `Failed to save power sensor: ${result.error || 'No result returned'}`
      };
    }
    
    // If this is a new sensor, create a default power status
    if (isNewSensor && result.data.id) {
      await createPowerStatus(result.data.id);
    }
    
    // Create a complete PowerSensor object
    const savedSensor: PowerSensor = {
      id: result.data.id,
      name: sensor.name || 'New Power Sensor',
      imei: sensor.imei || 'POWER' + Date.now().toString(),
      status: sensor.status || 'offline',
      companyId: companyId,
      folderId: sensor.folderId,
      lastUpdated: new Date().toISOString(),
      sensorType: 'power'
    };
    
    return {
      success: true,
      data: savedSensor,
      message: isNewSensor ? 'Power sensor created successfully' : 'Power sensor updated successfully'
    };
  } catch (error) {
    console.error('Unexpected error in savePowerSensor:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while saving the power sensor'
    };
  }
};

/**
 * Get the current user's company ID
 * @returns Promise with the current user's company ID
 */
export const getCurrentUserCompanyId = async (): Promise<string | null> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error('No current user found');
      return null;
    }
    
    const result = await customQuery<{ company_id: string }>(
      async () => {
        const { data, error } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', currentUser.id)
          .single();
        return { data, error };
      },
      'getCurrentUserCompanyId'
    );
    
    if (!result.success || !result.data) {
      console.error('Error fetching user company ID:', result.error);
      return null;
    }
    
    return result.data.company_id;
  } catch (error) {
    console.error('Error getting current user company ID:', error);
    return null;
  }
};

/**
 * Delete a power sensor from the database
 * @param sensorId The ID of the power sensor to delete
 * @returns Promise with the result of the delete operation
 */
export const deletePowerSensor = async (
  sensorId: string
): Promise<PowerSensorDeleteResult> => {
  try {
    console.log('Deleting power sensor with ID:', sensorId);
    
    // First, delete any related power status records
    await customQuery(
      async () => {
        const { error } = await supabase
          .from('power_status')
          .delete()
          .eq('power_sensor_id', sensorId);
        return { data: null, error };
      },
      'deleteRelatedPowerStatus'
    );
    
    // Delete any power consumption records
    await customQuery(
      async () => {
        const { error } = await supabase
          .from('power_consumption')
          .delete()
          .eq('power_sensor_id', sensorId);
        return { data: null, error };
      },
      'deleteRelatedPowerConsumption'
    );
    
    // Delete any audit log records
    await customQuery(
      async () => {
        const { error } = await supabase
          .from('power_audit_log')
          .delete()
          .eq('power_sensor_id', sensorId);
        return { data: null, error };
      },
      'deleteRelatedPowerAuditLog'
    );
    
    // Use the bypass_rls_power_sensor_operation function to delete the sensor
    const result = await powerSensorDb.callFunction<any>(
      'bypass_rls_power_sensor_operation',
      {
        operation: 'delete',
        sensor_data: { id: sensorId }
      }
    );
    
    if (!result.success) {
      console.error('Error deleting power sensor:', result.error);
      return {
        success: false,
        message: `Failed to delete power sensor: ${result.error}`
      };
    }
    
    return {
      success: true,
      message: 'Power sensor deleted successfully'
    };
  } catch (error) {
    console.error('Unexpected error in deletePowerSensor:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while deleting the power sensor'
    };
  }
};