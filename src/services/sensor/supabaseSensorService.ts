
import { supabase } from "@/integrations/supabase/client";
import { SensorData } from "@/components/SensorCard";
import { toast } from "sonner";
import { mapCompanyIdToUUID } from "@/utils/uuidUtils";
import { Json } from "@/integrations/supabase/types";

/**
 * Get all sensors from the database
 */
export const fetchSensors = async (): Promise<SensorData[]> => {
  try {
    // Get sensors with their latest values
    const { data: sensors, error } = await supabase
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

    if (error) throw error;

    // Get values for all sensors
    const { data: sensorValues, error: valuesError } = await supabase
      .from('sensor_values')
      .select('*');

    if (valuesError) throw valuesError;

    // Map the database results to SensorData format
    const formattedSensors: SensorData[] = sensors.map(sensor => {
      // Find all values for this sensor
      const values = sensorValues
        .filter(value => value.sensor_imei === sensor.imei)
        .map(value => {
          // Extract data from the JSON payload
          const payload = value.payload as Record<string, any>;
          return {
            type: payload.type as any, // Cast to match SensorData type
            value: Number(payload.value),
            unit: payload.unit || ''
          };
        });

      return {
        id: sensor.id,
        name: sensor.name,
        imei: sensor.imei || undefined,
        status: sensor.status as "online" | "offline" | "warning",
        values: values.length > 0 ? values : [
          // Default values if none exist
          { type: "temperature", value: 0, unit: "°C" }
        ],
        lastUpdated: new Date(sensor.updated_at).toLocaleString(),
        folderId: sensor.folder_id || undefined,
        companyId: sensor.company_id
      };
    });

    return formattedSensors;
  } catch (error) {
    console.error("Error fetching sensors:", error);
    toast.error("Failed to load sensors from database");
    return [];
  }
};

/**
 * Create or update a sensor in the database
 */
export const saveSensor = async (
  sensor: SensorData & { folderId?: string; companyId?: string; imei?: string }
): Promise<{ success: boolean; data?: SensorData; message: string }> => {
  try {
    // Check if sensor exists
    const isNewSensor = sensor.id.startsWith('sensor-') || sensor.id.startsWith('temp-');
    
    // Prepare sensor data for insert/update
    const sensorData = {
      name: sensor.name,
      status: sensor.status,
      imei: sensor.imei || null,
      company_id: sensor.companyId ? mapCompanyIdToUUID(sensor.companyId) : null,
      folder_id: sensor.folderId || null,
      updated_at: new Date().toISOString()
    };

    let sensorId = sensor.id;
    let sensorImei = sensor.imei || `temp-${Date.now()}`; // Use a temporary IMEI if none provided

    // Handle sensor record (insert or update)
    if (isNewSensor) {
      // Create new sensor
      const { data, error } = await supabase
        .from('sensors')
        .insert(sensorData)
        .select('id, imei')
        .single();

      if (error) throw error;
      sensorId = data.id;
      sensorImei = data.imei;
    } else {
      // Update existing sensor
      const { error } = await supabase
        .from('sensors')
        .update(sensorData)
        .eq('id', sensor.id);

      if (error) throw error;
    }

    // Handle sensor values
    // First, remove any existing values if updating
    if (!isNewSensor) {
      const { error: deleteError } = await supabase
        .from('sensor_values')
        .delete()
        .eq('sensor_imei', sensorImei);

      if (deleteError) throw deleteError;
    }

    // Insert new values
    if (sensor.values && sensor.values.length > 0) {
      // Convert values to proper payload format for Supabase
      const sensorValueInserts = sensor.values.map(value => ({
        sensor_imei: sensorImei,
        payload: {
          type: value.type,
          value: value.value,
          unit: value.unit
        }
      }));

      const { error: insertError } = await supabase
        .from('sensor_values')
        .insert(sensorValueInserts);

      if (insertError) throw insertError;
    }

    // Return the updated sensor with the real ID
    return {
      success: true,
      data: {
        ...sensor,
        id: sensorId,
        imei: sensorImei
      },
      message: isNewSensor 
        ? "Sensor created successfully" 
        : "Sensor updated successfully"
    };
  } catch (error) {
    console.error("Error saving sensor:", error);
    return {
      success: false,
      message: `Failed to save sensor: ${error.message}`
    };
  }
};

/**
 * Delete a sensor from the database
 */
export const deleteSensor = async (sensorId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Get the sensor to get its IMEI
    const { data: sensor, error: getSensorError } = await supabase
      .from('sensors')
      .select('imei')
      .eq('id', sensorId)
      .single();

    if (getSensorError) throw getSensorError;

    // First delete sensor values
    const { error: valuesError } = await supabase
      .from('sensor_values')
      .delete()
      .eq('sensor_imei', sensor.imei);

    if (valuesError) throw valuesError;

    // Then delete the sensor
    const { error } = await supabase
      .from('sensors')
      .delete()
      .eq('id', sensorId);

    if (error) throw error;

    return {
      success: true,
      message: "Sensor deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting sensor:", error);
    return {
      success: false,
      message: `Failed to delete sensor: ${error.message}`
    };
  }
};
