import { supabase } from '@/integrations/supabase/client';
import { SensorData, SensorDataValues } from '@/components/SensorCard';
import { toast } from 'sonner';
import { mapCompanyIdToUUID, mapCompanyIdToUUIDSync, mapCompanyUUIDToId } from '@/utils/uuidUtils';
import { safeQuery, databaseHelpers } from '@/utils/databaseUtils';

/**
 * Validates if a sensor exists and belongs to the specified company
 * @param sensorImei The IMEI or ID of the sensor to validate
 * @param companyId The company ID to check ownership against
 * @returns Promise with validation result
 */
export const validateSensorOwnership = async (
  sensorImei: string,
  companyId: string
): Promise<{
  valid: boolean;
  sensorImei: string | null;
  message: string;
}> => {
  try {
    // Clean the IMEI/ID
    const cleanedImei = sensorImei.replace(/\D/g, '');
    
    // Convert company ID to UUID format for database query
    const companyUuid = await mapCompanyIdToUUID(companyId);
    
    const result = await safeQuery(
      async () => {
        // Use filter builder syntax instead of string interpolation
        return await supabase
          .from('sensors')
          .select('id, imei, company_id')
          .eq('imei', cleanedImei)
          .single();
      },
      'validateSensorOwnership'
    );

    if (result.error) {
      // If no matching record found
      const errorString = String(result.error);
      if (errorString.includes('PGRST116') || errorString.includes('no rows returned')) {
        return {
          valid: false,
          sensorImei: null,
          message: `Sensor with ID ${cleanedImei} does not exist in the database.`
        };
      }
      
      // Other database errors
      console.error('Error validating sensor:', result.error);
      return {
        valid: false,
        sensorImei: null,
        message: `Database error: ${errorString}`
      };
    }

    // Sensor exists, check if it belongs to the company
    // Convert both to strings for comparison to avoid type issues
    if (String(result.data.company_id) !== String(companyUuid)) {
      return {
        valid: false,
        sensorImei: cleanedImei,
        message: `Sensor ${cleanedImei} exists but doesn't belong to the selected company.`
      };
    }

    // Sensor exists and belongs to the company
    return {
      valid: true,
      sensorImei: cleanedImei,
      message: `Sensor ${cleanedImei} validated successfully.`
    };
  } catch (error) {
    console.error('Unexpected error in validateSensorOwnership:', error);
    return {
      valid: false,
      sensorImei: null,
      message: 'An unexpected error occurred while validating the sensor'
    };
  }
};

/**
 * Get all sensors from the database
 */
export const fetchSensors = async (): Promise<SensorData[]> => {
  try {
    const result = await safeQuery<SensorData[]>(
      async () => {
        // Get sensors with their latest values
        const sensorsResult = await supabase
          .from('sensors')
          .select(`
            id,
            name,
            imei,
            status,
            folder_id,
            company_id,
            updated_at
          `);

        if (sensorsResult.error) {
          console.error('Error fetching sensors:', sensorsResult.error);
          return { data: [] as SensorData[], error: sensorsResult.error };
        }

        // Get sensor values ordered by creation date
        let sensorValues: any[] = [];
        try {
          const valuesQuery = supabase
            .from('sensor_values')
            .select('*');
          
          const sensorValuesResult = await databaseHelpers
            .orderBy(valuesQuery, 'created_at', false);

          if (!sensorValuesResult.error) {
            sensorValues = sensorValuesResult.data || [];
          } else {
            console.error('Error fetching sensor values:', sensorValuesResult.error);
          }
        } catch (error) {
          console.error('Error fetching sensor values:', error);
        }

        // Get folder information
        let folders: any[] = [];
        try {
          const foldersResult = await supabase
            .from('sensor_folders')
            .select('id, name, project_number');

          if (!foldersResult.error) {
            folders = foldersResult.data || [];
          } else {
            console.error('Error fetching folders:', foldersResult.error);
          }
        } catch (error) {
          console.error('Error fetching folders:', error);
        }

        // Process the data
        const sensors = sensorsResult.data || [];

        // Create a map of folder IDs to folder names for quick lookup
        const folderMap = new Map();
        folders.forEach(folder => {
          folderMap.set(folder.id, folder.name);
        });

        // Map the database results to SensorData format
        const formattedSensors: SensorData[] = sensors.map((sensor) => {
          // Find all values for this sensor
          const values = sensorValues
            .filter((value) => value.sensor_imei === sensor.imei)
            .map((value) => ({
              ...value.payload,
              time: value.created_at
            }));

          // Get the project name if available
          const projectName = sensor.folder_id ? folderMap.get(sensor.folder_id) : null;

          // Get the last seen timestamp from the most recent sensor value
          const lastSensorValue = sensorValues.find(value => value.sensor_imei === sensor.imei);
          const lastSeenTimestamp = lastSensorValue
            ? new Date(lastSensorValue.created_at).toLocaleString()
            : null;

          return {
            id: sensor.id,
            name: sensor.name,
            imei: sensor.imei || undefined,
            status: sensor.status as 'online' | 'offline' | 'warning',
            values: values || [],
            lastUpdated: new Date(sensor.updated_at).toLocaleString(),
            folderId: sensor.folder_id || undefined,
            companyId: mapCompanyUUIDToId(sensor.company_id),
            projectName
          };
        });

        return { data: formattedSensors, error: null };
      },
      'fetchSensors'
    );

    if (result.error || !result.data) {
      console.error('Error fetching sensors:', result.error);
      toast.error('Failed to load sensors from database');
      return [];
    }

    return result.data;
  } catch (error) {
    console.error('Unexpected error in fetchSensors:', error);
    toast.error('Failed to load sensors from database');
    return [];
  }
};

/**
 * Save a sensor to the database
 */
export const saveSensor = async (
  sensor: SensorData & {
    folderId?: string;
    companyId?: string;
    imei?: string;
  }
): Promise<{ success: boolean; data?: SensorData; message: string }> => {
  try {
    const isNewSensor = sensor.id.startsWith('sensor-') || sensor.id.startsWith('temp-');

    // Prepare sensor data
    const sensorData = {
      name: sensor.name,
      status: sensor.status,
      imei: sensor.imei || null,
      company_id: sensor.companyId ? mapCompanyIdToUUIDSync(sensor.companyId) : null,
      folder_id: sensor.folderId || null,
      updated_at: new Date().toISOString()
    };

    const result = await safeQuery<{ id: string }>(
      async () => {
        if (isNewSensor) {
          return await supabase
            .from('sensors')
            .insert(sensorData)
            .select('id')
            .single();
        } else {
          const updateResult = await supabase
            .from('sensors')
            .update(sensorData)
            .eq('id', sensor.id);
          
          return {
            data: { id: sensor.id },
            error: updateResult.error
          };
        }
      },
      `${isNewSensor ? 'create' : 'update'}Sensor`
    );

    if (result.error) {
      return {
        success: false,
        message: `Failed to save sensor: ${result.error}`
      };
    }

    return {
      success: true,
      data: {
        ...sensor,
        id: result.data.id
      },
      message: isNewSensor ? 'Sensor created successfully' : 'Sensor updated successfully'
    };
  } catch (error) {
    console.error('Unexpected error in saveSensor:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while saving the sensor'
    };
  }
};

/**
 * Delete a sensor and its values from the database
 */
export const deleteSensor = async (
  sensorImei: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await safeQuery(
      async () => {
        // First delete sensor values
        const valuesResult = await supabase
          .from('sensor_values')
          .delete()
          .eq('sensor_imei', sensorImei);

        if (valuesResult.error) {
          console.error('Error deleting sensor values:', valuesResult.error);
          return valuesResult;
        }

        // Then delete the sensor
        return await supabase
          .from('sensors')
          .delete()
          .eq('imei', sensorImei);
      },
      'deleteSensor'
    );

    return {
      success: !result.error,
      message: result.error
        ? `Failed to delete sensor: ${result.error}`
        : 'Sensor deleted successfully'
    };
  } catch (error) {
    console.error('Unexpected error in deleteSensor:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while deleting the sensor'
    };
  }
};
