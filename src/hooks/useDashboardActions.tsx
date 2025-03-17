import { toast } from 'sonner';
import { fetchTrackingObjects } from '@/services/sensorService';
import { fetchSensors } from '@/services/sensor/supabaseSensorService';
import { getSensorFolders } from '@/services/folder/folderService';
import { getCurrentUser } from '@/services/authService';
import { mapCompanyUUIDToId } from '@/utils/uuidUtils';
import { SensorData } from '@/components/SensorCard';
import { TrackingObject } from '@/types/sensors';
import { SensorFolder } from '@/types/users';

export function useDashboardActions() {
	const currentUser = getCurrentUser();

	const handleRefresh = (
		setSensors: React.Dispatch<React.SetStateAction<SensorData[]>>,
		setTrackingObjects: React.Dispatch<
			React.SetStateAction<TrackingObject[]>
		>,
		setProjects: React.Dispatch<React.SetStateAction<SensorFolder[]>>
	) => {
		toast.info('Refreshing data...');

		setTimeout(async () => {
			try {
				// Fetch data asynchronously
				const sensorsData = await fetchSensors();
				const trackingObjectsData = await fetchTrackingObjects();
				const projectsData = await getSensorFolders();

				// Filter sensors based on user's company and role
				const filteredSensors = currentUser?.role === 'master'
					? sensorsData
					: sensorsData.filter(
						(sensor) => {
							if (!sensor.companyId) return false;
							
							// Convert any UUID company IDs to the format used in the application
							const normalizedSensorCompanyId = mapCompanyUUIDToId(sensor.companyId);
							
							// Compare with the user's company ID
							return normalizedSensorCompanyId === currentUser?.companyId;
						}
					);

				// Filter projects based on user company
				const filteredProjects =
					currentUser?.role === 'master'
						? projectsData
						: projectsData.filter(
								(project) => {
									if (!project.companyId) return false;
									
									// Convert any UUID company IDs to the format used in the application
									const normalizedProjectCompanyId = mapCompanyUUIDToId(project.companyId);
									
									// Compare with the user's company ID
									return normalizedProjectCompanyId === currentUser?.companyId;
								}
						  );

				setSensors(filteredSensors);
				setTrackingObjects(trackingObjectsData);
				setProjects(filteredProjects);
				toast.success('Data refreshed successfully');
			} catch (error) {
				console.error('Error refreshing data:', error);
				toast.error('Failed to refresh data');
			}
		}, 1000);
	};

	return {
		handleRefresh
	};
}
