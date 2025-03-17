// Re-export sensor services to maintain backward compatibility
export { saveSensor } from './sensor/supabaseSensorService';

// Device and tracking services
export { fetchDevices, saveDevice, deleteDevice } from './device/supabaseDeviceService';
export { fetchTrackingObjects, updateTrackingObjectPosition, mapDeviceToTrackingObject } from './tracking/supabaseTrackingService';

// Keep other exports from the original files
export {
	sendCommandToSensor,
	createSensor,
	validateSensorForCompany
} from './sensor/sensorApi';

// MQTT related functions
export const sendMqttCommandToSensor = async (
	sensorImei: string,
	command: string
) => {
	console.log(`MQTT command ${command} sent to sensor ${sensorImei}`);
	return { success: true, message: 'Command sent via MQTT' };
};

export const registerForSensorUpdates = (
	sensor: any,
	callback: (topic: string, payload: any) => void
) => {
	console.log(`Registered for updates from sensor ${sensor.imei}`);
	// Return a cleanup function
	return () => {
		console.log(`Unregistered from updates for sensor ${sensor.imei}`);
	};
};
