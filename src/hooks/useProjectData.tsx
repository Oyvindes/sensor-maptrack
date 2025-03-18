import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SensorData } from '@/components/SensorCard';
import { SensorFolder } from '@/types/users';
import { fetchSensors } from '@/services/sensor/supabaseSensorService';
import { getSensorFolders } from '@/services/folder/folderService';
import { getCurrentUser } from '@/services/authService';
import { mapCompanyUUIDToId } from '@/utils/uuidUtils';

export function useProjectData() {
	const [sensors, setSensors] = useState<SensorData[]>([]);
	const [projects, setProjects] = useState<SensorFolder[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(
		null
	);
	const [selectedProject, setSelectedProject] = useState<SensorFolder | null>(
		null
	);
	const [editingProject, setEditingProject] = useState(false);
	const [isUpdatingProject, setIsUpdatingProject] = useState(false);
	const currentUser = getCurrentUser();

	// Add a state to track if the app is in the foreground
	const [isAppActive, setIsAppActive] = useState(true);

	// Handle app visibility changes
	useEffect(() => {
		const handleVisibilityChange = () => {
			setIsAppActive(!document.hidden);
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const sensorsData = await fetchSensors();
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

				// Filter projects based on user's company if not master admin
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
				setProjects(filteredProjects);
			} catch (error) {
				console.error('Error fetching data:', error);
				toast.error('Failed to load data');
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();

		// Set up a simulated data update interval for UI testing
		// Only update when the app is active and visible
		let interval: NodeJS.Timeout | null = null;
		
		if (isAppActive) {
			interval = setInterval(() => {
				// Use a functional update to avoid stale closures
				setSensors((prev) => {
					// Skip update if there's no change needed
					if (prev.length === 0) return prev;
					
					return prev.map((sensor) => ({
						...sensor,
						values: sensor.values.map((value) => ({
							...value,
							temperature: value.temperature !== undefined
								? parseFloat((value.temperature + (Math.random() * 0.4 - 0.2)).toFixed(1))
								: value.temperature,
							humidity: value.humidity !== undefined
								? parseFloat((value.humidity + (Math.random() * 2 - 1)).toFixed(1))
								: value.humidity,
							battery: value.battery !== undefined
								? Math.max(0, Math.min(100, value.battery - Math.random() * 0.5))
								: value.battery,
							signal: value.signal !== undefined
								? parseFloat((value.signal + (Math.random() * 2 - 1)).toFixed(1))
								: value.signal
						})),
						lastUpdated: new Date().toLocaleTimeString()
					}));
				});
			}, 10000); // Increased interval to 10 seconds to reduce updates
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [currentUser]);

	return {
		sensors,
		projects,
		isLoading,
		selectedSensor,
		selectedProject,
		editingProject,
		isUpdatingProject,
		setSensors,
		setProjects,
		setSelectedSensor,
		setSelectedProject,
		setEditingProject,
		setIsUpdatingProject
	};
}
