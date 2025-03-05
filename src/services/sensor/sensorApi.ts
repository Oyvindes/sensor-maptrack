
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
