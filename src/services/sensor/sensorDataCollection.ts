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
		// Log the error but don't throw it further to prevent breaking the collection loop
		return false;
	}
};

// Start collecting data for all sensors in a project
export const startProjectDataCollection = (project: SensorFolder) => {
	if (!project.assignedSensorImeis?.length) {
		console.log(`No sensors assigned to project ${project.id}`);
		return;
	}

	// Check if project has defined start/end dates and if current datetime is within that period
	const currentDateTime = new Date().toISOString(); // Get current datetime in ISO format
	
	if (project.projectStartDate && currentDateTime < project.projectStartDate) {
		console.log(`Project ${project.id} has not started yet. Scheduled to start on ${new Date(project.projectStartDate).toLocaleString()}`);
		return;
	}
	
	if (project.projectEndDate && currentDateTime > project.projectEndDate) {
		console.log(`Project ${project.id} has ended on ${new Date(project.projectEndDate).toLocaleString()}`);
		return;
	}

	// If already collecting, stop first
	if (collectionStatus[project.id]?.isCollecting) {
		stopProjectDataCollection(project.id);
	}

	try {
		// Start collection for each sensor
		const interval = setInterval(async () => {
			try {
				// Check if project is still within datetime range on each collection cycle
				const now = new Date().toISOString();
				if ((project.projectStartDate && now < project.projectStartDate) ||
					(project.projectEndDate && now > project.projectEndDate)) {
					console.log(`Project ${project.id} is outside scheduled datetime period. Stopping data collection.`);
					stopProjectDataCollection(project.id);
					return;
				}
				
				for (const sensorImei of project.assignedSensorImeis) {
					await collectSensorData(sensorImei);
				}
			} catch (error) {
				console.error(`Error in data collection interval for project ${project.id}:`, error);
				// Don't stop collection on error, just log it
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
	} catch (error) {
		console.error(`Failed to start data collection for project ${project.id}:`, error);
		// Make sure we clean up any interval that might have been created
		if (collectionStatus[project.id]?.interval) {
			clearInterval(collectionStatus[project.id].interval);
		}
		collectionStatus[project.id] = {
			isCollecting: false,
			interval: null
		};
	}
};

// Stop collecting data for a project
export const stopProjectDataCollection = (projectId: string) => {
	try {
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
	} catch (error) {
		console.error(`Error stopping data collection for project ${projectId}:`, error);
		// Ensure we clean up the interval even if there's an error
		try {
			if (collectionStatus[projectId]?.interval) {
				clearInterval(collectionStatus[projectId].interval);
			}
			collectionStatus[projectId] = {
				isCollecting: false,
				interval: null
			};
		} catch (cleanupError) {
			console.error(`Failed to clean up resources for project ${projectId}:`, cleanupError);
		}
	}
};

// Check if a project is currently collecting data
export const isProjectCollecting = (projectId: string): boolean => {
	return collectionStatus[projectId]?.isCollecting || false;
};
