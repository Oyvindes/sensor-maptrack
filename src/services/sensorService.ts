// Re-export sensor services to maintain backward compatibility
export { fetchSensors as getMockSensors } from './sensor/supabaseSensorService';
export { saveSensor } from './sensor/supabaseSensorService';

// Mock functions for tracking objects
import { getMockTrackingObjects } from './tracking/mockTrackingData';
export { getMockTrackingObjects };

// Mock functions for devices
import { getMockDevices } from './device/mockDeviceData';
export { getMockDevices };

// Keep other exports from the original files
export { 
  sendCommandToSensor,
  createSensor,
  validateSensorForCompany
} from './sensor/sensorApi';

// MQTT related functions
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
