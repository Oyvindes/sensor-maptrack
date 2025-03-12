import { SensorFolder } from '@/types/users';
import { sendCommandToSensor } from './sensorApi';

interface CollectionStatus {
	[projectId: string]: {
		isCollecting: boolean;
		interval: NodeJS.Timeout | null;
	};
}

// Keep track of collection status for each project
const collectionStatus: CollectionStatus = {};

// Simulated function to store sensor data in the database
const storeSensorData = async (sensorImei: string, data: any) => {
	console.log(`Storing data for sensor ${sensorImei}:`, data);
	// Here you would typically make an API call to store the data
	return Promise.resolve({ success: true });
};

// Function to generate realistic sensor values
const generateSensorValues = () => {
	return {
		temperature: 20 + Math.random() * 10, // 20-30°C
		humidity: 40 + Math.random() * 30, // 40-70%
		battery: 80 + Math.random() * 20, // 80-100%
		signal: 60 + Math.random() * 40 // 60-100%
	};
};

// Function to collect data from a single sensor
const collectSensorData = async (sensorImei: string) => {
	try {
		const timestamp = new Date().toISOString();
		const values = generateSensorValues();

		// Create data points for each sensor value
		const data = {
			timestamp,
			sensorImei,
			values: {
				temperature: { value: values.temperature, unit: '°C' },
				humidity: { value: values.humidity, unit: '%' },
				battery: { value: values.battery, unit: '%' },
				signal: { value: values.signal, unit: '%' }
			}
		};

		await storeSensorData(sensorImei, data);
		return true;
	} catch (error) {
		console.error(
			`Error collecting data from sensor ${sensorImei}:`,
			error
		);
		return false;
	}
};

// Start collecting data for all sensors in a project
export const startProjectDataCollection = (project: SensorFolder) => {
	if (!project.assignedSensorImeis?.length) {
		console.log(`No sensors assigned to project ${project.id}`);
		return;
	}

	// If already collecting, stop first
	if (collectionStatus[project.id]?.isCollecting) {
		stopProjectDataCollection(project.id);
	}

	// Start collection for each sensor
	const interval = setInterval(async () => {
		for (const sensorImei of project.assignedSensorImeis) {
			await collectSensorData(sensorImei);
		}
	}, 5000); // Collect data every 5 seconds

	collectionStatus[project.id] = {
		isCollecting: true,
		interval
	};

	// Send command to each sensor to start sending data
	project.assignedSensorImeis.forEach((sensorImei) => {
		sendCommandToSensor(sensorImei, 'startDataTransmission');
	});

	console.log(`Started data collection for project ${project.id}`);
};

// Stop collecting data for a project
export const stopProjectDataCollection = (projectId: string) => {
	const status = collectionStatus[projectId];
	if (!status?.isCollecting) {
		return;
	}

	if (status.interval) {
		clearInterval(status.interval);
	}

	collectionStatus[projectId] = {
		isCollecting: false,
		interval: null
	};

	console.log(`Stopped data collection for project ${projectId}`);
};

// Check if a project is currently collecting data
export const isProjectCollecting = (projectId: string): boolean => {
	return collectionStatus[projectId]?.isCollecting || false;
};
