import { SensorData } from '@/components/SensorCard';

// API calls related to sensors
export const sendCommandToSensor = async (
	sensorImei: string,
	command: string,
	params?: Record<string, any>
): Promise<{ success: boolean; message: string }> => {
	console.log(`Sending command "${command}" to sensor ${sensorImei}`, params);

	try {
		// Simulate API call
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					success: true,
					message: `Command "${command}" sent to sensor ${sensorImei} successfully`
				});
			}, 800);
		});
	} catch (error) {
		console.error(`Error sending command "${command}" to sensor ${sensorImei}:`, error);
		return {
			success: false,
			message: `Failed to send command to sensor: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
};

// Mock API call to create a new sensor
export const createSensor = async (
	sensorData: SensorData
): Promise<{ success: boolean; data: SensorData; message: string }> => {
	console.log('Creating new sensor:', sensorData);

	// Simulate API call
	return new Promise((resolve) => {
		setTimeout(() => {
			// Generate a more realistic ID based on the sensor type
			const newId = `sensor-${Date.now().toString().slice(-3)}`;
			const createdSensor = { ...sensorData, id: newId };

			resolve({
				success: true,
				data: createdSensor,
				message: `Sensor ${createdSensor.name} created successfully`
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
	sensorImei: string | null;
	message: string;
}> => {
	console.log(
		`Validating sensor IMEI ${sensorImei} for company ${companyId}`
	);

	// Import the validateSensorOwnership function from supabaseSensorService
	const { validateSensorOwnership } = await import('./supabaseSensorService');
	
	// Use the real database validation instead of mock data
	return await validateSensorOwnership(sensorImei, companyId);
};
