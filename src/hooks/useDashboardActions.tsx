import { toast } from 'sonner';
import { getMockTrackingObjects } from '@/services/sensorService';
import { fetchSensors } from '@/services/sensor/supabaseSensorService';
import { getMockSensorFolders } from '@/services/folder/folderService';
import { getCurrentUser } from '@/services/authService';
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
				const trackingObjectsData = getMockTrackingObjects();
				const projectsData = await getMockSensorFolders();

				// Filter sensors that have a folderId
				const filteredSensors = sensorsData.filter(
					(sensor) => 'folderId' in sensor && sensor.folderId
				);

				// Filter projects based on user company
				const filteredProjects =
					currentUser?.role === 'master'
						? projectsData
						: projectsData.filter(
								(project) =>
									project.companyId === currentUser?.companyId
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
