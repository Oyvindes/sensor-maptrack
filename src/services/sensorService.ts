// Re-export sensor services to maintain backward compatibility
export { fetchSensors as getMockSensors } from './sensor/supabaseSensorService';
export { saveSensor } from './sensor/supabaseSensorService';

// Mock functions for tracking objects (these were missing)
import { getTrackingObjects } from './tracking/mockTrackingData';
export const getMockTrackingObjects = () => getTrackingObjects();

// Mock functions for devices (these were missing)
import { getDevices } from './device/mockDeviceData';
export const getMockDevices = () => getDevices();

// Keep other exports from the original files
export { 
  sendCommandToSensor,
  createSensor,
  validateSensorForCompany
} from './sensor/sensorApi';

// MQTT related functions (these were missing)
export const sendMqttCommandToSensor = async (sensorId: string, command: string) => {
  console.log(`MQTT command ${command} sent to sensor ${sensorId}`);
  return { success: true, message: "Command sent via MQTT" };
};

export const registerForSensorUpdates = (sensor: any, callback: (topic: string, payload: any) => void) => {
  console.log(`Registered for updates from sensor ${sensor.id}`);
  // Return a cleanup function
  return () => {
    console.log(`Unregistered from updates for sensor ${sensor.id}`);
  };
};
