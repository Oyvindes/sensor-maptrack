
// Re-export everything from the individual files
// This maintains backward compatibility with existing imports

// Sensor API functions
export { sendCommandToSensor, createSensor } from './sensor/sensorApi';

// Tracking API functions
export { updateTrackingObject } from './tracking/trackingApi';

// Sensor mock data
export { getMockSensors } from './sensor/mockSensorData';

// Device mock data
export { getMockDevices, mapDeviceToTrackingObject } from './device/mockDeviceData';

// Tracking mock data
export { getMockTrackingObjects } from './tracking/mockTrackingData';

// Email service
export { sendEmail, getEmailConfigInfo } from './email/emailService';
