
import { SensorData } from "@/components/SensorCard";

// API calls related to sensors
export const sendCommandToSensor = async (
  sensorId: string,
  command: string,
  params?: Record<string, any>
): Promise<{ success: boolean; message: string }> => {
  console.log(`Sending command "${command}" to sensor ${sensorId}`, params);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Command "${command}" sent to sensor ${sensorId} successfully`,
      });
    }, 800);
  });
};

// Mock API call to create a new sensor
export const createSensor = async (
  sensorData: SensorData
): Promise<{ success: boolean; data: SensorData; message: string }> => {
  console.log("Creating new sensor:", sensorData);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a more realistic ID based on the sensor type
      const newId = `sensor-${Date.now().toString().slice(-3)}`;
      const createdSensor = { ...sensorData, id: newId };
      
      resolve({
        success: true,
        data: createdSensor,
        message: `Sensor ${createdSensor.name} created successfully`,
      });
    }, 800);
  });
};

/**
 * Validates if a sensor exists and belongs to the specified company
 * @param sensorImei The IMEI or ID of the sensor to validate
 * @param companyId The company ID to check ownership against
 * @returns Promise with validation result
 */
export const validateSensorForCompany = async (
  sensorImei: string,
  companyId: string
): Promise<{
  valid: boolean;
  sensorId: string | null;
  message: string;
}> => {
  console.log(`Validating sensor IMEI ${sensorImei} for company ${companyId}`);
  
  // Import mock data to check against
  const { getMockSensors } = await import('./mockSensorData');
  const sensors = getMockSensors();
  
  // Clean the IMEI/ID and format it as an ID
  const cleanedImei = sensorImei.replace(/\D/g, '');
  const sensorId = `sensor-${cleanedImei}`;
  
  // Simulate server validation with mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Find the sensor in our mock database
      const sensor = sensors.find(s => s.id === sensorId);
      
      if (!sensor) {
        resolve({
          valid: false,
          sensorId: null,
          message: `Sensor with ID ${sensorId} does not exist in the database.`
        });
        return;
      }
      
      if (sensor.companyId !== companyId) {
        resolve({
          valid: false,
          sensorId: sensorId,
          message: `Sensor ${sensorId} exists but doesn't belong to the selected company.`
        });
        return;
      }
      
      // Sensor exists and belongs to the company
      resolve({
        valid: true,
        sensorId: sensorId,
        message: `Sensor ${sensorId} validated successfully.`
      });
    }, 800);
  });
};
