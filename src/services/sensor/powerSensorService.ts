import { supabase } from '@/integrations/supabase/client';
import { SensorData } from '@/components/SensorCard';
import { toast } from 'sonner';
import { safeQuery } from '@/utils/databaseUtils';
import { mapCompanyIdToUUID, mapCompanyIdToUUIDSync, mapCompanyUUIDToId } from '@/utils/uuidUtils';
import { getCurrentUser } from '@/services/authService';
import { getApiUrl } from '@/utils/apiUtils';

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
 * Interface for power consumption data
 */
export interface PowerConsumptionData {
  id: string;
  power_sensor_id: string;
  timestamp: string;
  energy: number;
  cost: number | null;
  price_region: string | null;
  created_at: string;
}

/**
 * Interface for power status
 */
export interface PowerStatus {
  id: string;
  power_sensor_id: string;
  power_state: boolean;
  last_toggled_at: string;
  last_toggled_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for power sensor
 */
export interface PowerSensor {
  id: string;
  name: string;
  imei: string;
  status: string;
  company_id: string | null;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
  sensor_type: string;
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
    let query = supabase
      .from('power_consumption')
      .select('*')
      .eq('power_sensor_id', sensorId)
      .order('timestamp', { ascending: false });

    // Add date filters if provided
    if (startDate) {
      query = query.gte('timestamp', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('timestamp', endDate.toISOString());
    }

    const result = await safeQuery<PowerConsumptionData[]>(
      async () => {
        const { data, error } = await query;
        return { data: data || [], error };
      },
      'fetchPowerConsumption'
    );

    if (result.error) {
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
    const result = await safeQuery<PowerStatus[]>(
      async () => {
        const { data, error } = await supabase
          .from('power_status')
          .select('*')
          .eq('power_sensor_id', sensorId)
          .order('updated_at', { ascending: false })
          .limit(1);
        
        return { data, error };
      },
      'fetchPowerStatus'
    );

    if (result.error) {
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
    const result = await safeQuery<PowerStatus>(
      async () => {
        const { data, error } = await supabase
          .from('power_status')
          .insert({
            power_sensor_id: sensorId,
            power_state: false,
            last_toggled_at: new Date().toISOString(),
            last_toggled_by: null
          })
          .select()
          .single();
        
        return { data, error };
      },
      'createPowerStatus'
    );

    if (result.error) {
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
): Promise<{ success: boolean; status: PowerStatus | null; message: string }> => {
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
    
    const result = await safeQuery<PowerStatus[]>(
      async () => {
        const { data, error } = await supabase
          .from('power_status')
          .update({
            power_state: newPowerState,
            last_toggled_at: new Date().toISOString(),
            last_toggled_by: isValidUUID(userId) ? userId : null
          })
          .eq('id', currentStatus.id)
          .select();
        
        return { data, error };
      },
      'togglePower'
    );

    if (result.error) {
      console.error('Error toggling power:', result.error);
      return {
        success: false,
        status: null,
        message: `Failed to toggle power: ${String(result.error)}`
      };
    }

    // Get the updated status from the result
    const updatedStatus = result.data && result.data.length > 0 ? result.data[0] : null;
    
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
        return;
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
    const result = await safeQuery<{ imei: string }>(
      async () => {
        const { data, error } = await supabase
          .from('power_sensors')
          .select('imei')
          .eq('id', sensorId)
          .single();
        
        return { data, error };
      },
      'getPowerSensorImei'
    );

    if (result.error || !result.data) {
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
    await safeQuery(
      async () => {
        const { error } = await supabase
          .from('power_audit_log')
          .insert({
            power_sensor_id: sensorId,
            operation_type: operationType,
            operation_details: operationDetails,
            performed_by: isValidUUID(userId) ? userId : null
          });
        
        return { data: null, error };
      },
      'logPowerOperation'
    );
  } catch (error) {
    console.error('Error logging power operation:', error);
  }
};

/**
 * Fetch all power sensors
 * @returns Promise with the power sensors
 */
export const fetchPowerSensors = async (): Promise<SensorData[]> => {
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
      const { data: allSensorsData, error: allSensorsError } = await supabase.rpc('get_all_power_sensors');
      
      if (!allSensorsError && allSensorsData && Array.isArray(allSensorsData) && allSensorsData.length > 0) {
        console.log('Successfully fetched power sensors using get_all_power_sensors:', allSensorsData);
        
        // Map the database results to SensorData format
        const formattedSensors: SensorData[] = allSensorsData.map((sensor) => {
          return {
            id: sensor.id,
            name: sensor.name,
            imei: sensor.imei || undefined,
            status: sensor.status as 'online' | 'offline' | 'warning',
            values: [],
            lastUpdated: new Date(sensor.updated_at).toLocaleString(),
            folderId: sensor.folder_id || undefined,
            companyId: sensor.company_id ? mapCompanyUUIDToId(sensor.company_id) : undefined,
            sensorType: sensor.sensor_type || 'power' // Use the sensor_type field or default to 'power'
          };
        });

        console.log('Formatted power sensors from get_all_power_sensors:', formattedSensors);
        return formattedSensors;
      } else {
        console.log('No results from get_all_power_sensors or error occurred:', allSensorsError);
        
        // Fall back to the original method if the RPC call fails
        // Get the user's company ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', currentUser.id)
          .single();

        if (userError || !userData) {
          console.error('Error fetching user company ID:', userError);
          toast.error('Failed to load power sensors: Could not determine company');
          return [];
        }

        const companyId = userData.company_id;
        console.log('User company ID:', companyId);

        // Fetch power sensors for this company
        const result = await safeQuery<any[]>(
          async () => {
            const query = supabase
              .from('power_sensors')
              .select(`
                id,
                name,
                imei,
                status,
                folder_id,
                company_id,
                created_at,
                updated_at,
                sensor_type
              `);
            
            // If we have a company ID, filter by it
            if (companyId) {
              query.eq('company_id', companyId);
            }
            
            const { data, error } = await query;
            
            // Log the raw data for debugging
            console.log('Raw power sensors data from direct query:', data);
            
            return { data: data || [], error };
          },
          'fetchPowerSensors'
        );

        if (result.error) {
          console.error('Error fetching power sensors:', result.error);
          toast.error('Failed to load power sensors');
          return [];
        }

        // Map the database results to SensorData format
        const formattedSensors: SensorData[] = result.data.map((sensor) => {
          return {
            id: sensor.id,
            name: sensor.name,
            imei: sensor.imei || undefined,
            status: sensor.status as 'online' | 'offline' | 'warning',
            values: [],
            lastUpdated: new Date(sensor.updated_at).toLocaleString(),
            folderId: sensor.folder_id || undefined,
            companyId: sensor.company_id ? mapCompanyUUIDToId(sensor.company_id) : undefined,
            sensorType: sensor.sensor_type || 'power' // Use the sensor_type field or default to 'power'
          };
        });

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
 * Save a power sensor to the database
 * @param sensor The sensor data to save
 * @returns Promise with the result of the save operation
 */
export const savePowerSensor = async (
  sensor: SensorData & {
    folderId?: string;
    companyId?: string;
    imei?: string;
  }
): Promise<{ success: boolean; data?: SensorData; message: string }> => {
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
        const { data, error } = await supabase
          .from('companies')
          .select('id')
          .limit(1)
          .single();
        
        if (!error && data) {
          companyId = mapCompanyUUIDToId(data.id);
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
      company_id: mapCompanyIdToUUIDSync(companyId),
      folder_id: sensor.folderId || null,
      sensor_type: 'power' // Always set the sensor_type to 'power'
    };

    console.log('Saving power sensor with data:', JSON.stringify(sensorData, null, 2));

    // Use the bypass_rls_power_sensor_operation function to avoid RLS issues
    const operation = isNewSensor ? 'create' : 'update';
    const { data: result, error } = await supabase.rpc(
      'bypass_rls_power_sensor_operation',
      {
        operation: operation,
        sensor_data: sensorData
      }
    );

    if (error) {
      console.error(`Error in ${operation}PowerSensor:`, error);
      return {
        success: false,
        message: `Failed to save power sensor: ${error.message}`
      };
    }

    if (!result || !result.id) {
      console.error(`No result returned from ${operation}PowerSensor`);
      return {
        success: false,
        message: `Failed to save power sensor: No result returned`
      };
    }

    // If this is a new sensor, create a default power status
    if (isNewSensor && result.id) {
      await createPowerStatus(result.id);
    }

    return {
      success: true,
      data: {
        ...sensor,
        id: result.id,
        companyId: companyId,
        sensorType: 'power'
      },
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

    const { data, error } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', currentUser.id)
      .single();

    if (error || !data) {
      console.error('Error fetching user company ID:', error);
      return null;
    }

    return data.company_id;
  } catch (error) {
    console.error('Error getting current user company ID:', error);
    return null;
  }
};

/**
 * Bulk import power sensors
 * @param sensors Array of sensor data to import
 * @returns Promise with the result of the import operation
 */
export const bulkImportPowerSensors = async (
  sensors: Array<{
    name: string;
    imei: string;
    companyId: string;
    folderId?: string;
  }>
): Promise<{ success: boolean; message: string; imported: number; failed: number }> => {
  let imported = 0;
  let failed = 0;

  try {
    for (const sensor of sensors) {
      // Create a new sensor object
      const newSensor: SensorData & { 
        folderId?: string; 
        companyId?: string; 
        imei?: string 
      } = {
        id: `sensor-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: sensor.name,
        imei: sensor.imei,
        status: 'offline', // Default status
        values: [],
        lastUpdated: new Date().toLocaleString(),
        companyId: sensor.companyId,
        folderId: sensor.folderId,
        sensorType: 'power'
      };

      // Save the sensor
      const result = await savePowerSensor(newSensor);
      
      if (result.success) {
        imported++;
      } else {
        failed++;
        console.error(`Failed to import sensor ${sensor.name} (${sensor.imei}):`, result.message);
      }
    }

    return {
      success: imported > 0,
      message: `Imported ${imported} power sensors successfully. ${failed > 0 ? `Failed to import ${failed} sensors.` : ''}`,
      imported,
      failed
    };
  } catch (error) {
    console.error('Unexpected error in bulkImportPowerSensors:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while importing power sensors',
      imported,
      failed: sensors.length - imported
    };
  }
};

/**
 * Delete a power sensor from the database
 * @param sensorId The ID of the power sensor to delete
 * @returns Promise with the result of the delete operation
 */
export const deletePowerSensor = async (
  sensorId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Deleting power sensor with ID:', sensorId);
    
    // First, delete any related power status records
    const { error: statusError } = await supabase
      .from('power_status')
      .delete()
      .eq('power_sensor_id', sensorId);
    
    if (statusError) {
      console.error('Error deleting power status records:', statusError);
      // Continue with deletion even if status deletion fails
    }
    
    // Delete any power consumption records
    const { error: consumptionError } = await supabase
      .from('power_consumption')
      .delete()
      .eq('power_sensor_id', sensorId);
    
    if (consumptionError) {
      console.error('Error deleting power consumption records:', consumptionError);
      // Continue with deletion even if consumption deletion fails
    }
    
    // Delete any audit log records
    const { error: auditError } = await supabase
      .from('power_audit_log')
      .delete()
      .eq('power_sensor_id', sensorId);
    
    if (auditError) {
      console.error('Error deleting power audit log records:', auditError);
      // Continue with deletion even if audit log deletion fails
    }
    
    // Use the bypass_rls_power_sensor_operation function to delete the sensor
    const { data: result, error } = await supabase.rpc(
      'bypass_rls_power_sensor_operation',
      {
        operation: 'delete',
        sensor_data: { id: sensorId }
      }
    );
    
    if (error) {
      console.error('Error deleting power sensor:', error);
      return {
        success: false,
        message: `Failed to delete power sensor: ${error.message}`
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