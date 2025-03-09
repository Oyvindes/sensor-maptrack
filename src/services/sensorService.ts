// Re-export sensor services to maintain backward compatibility
export { fetchSensors as getMockSensors } from './sensor/supabaseSensorService';
export { saveSensor } from './sensor/supabaseSensorService';

// Keep other exports from the original files
export { 
  sendCommandToSensor,
  createSensor,
  validateSensorForCompany
} from './sensor/sensorApi';
