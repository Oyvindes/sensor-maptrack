import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SensorData } from '@/components/SensorCard';
import { SensorFolder } from '@/types/users';
import { fetchSensors } from '@/services/sensor/supabaseSensorService';
import { getMockSensorFolders } from '@/services/folder/folderService';
import { getCurrentUser } from '@/services/authService';

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

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const sensorsData = await fetchSensors();
				const projectsData = await getMockSensorFolders();

				// Filter out sensors that don't have a folderId property or it's undefined
				const filteredSensors = sensorsData.filter(
					(sensor) =>
						'folderId' in sensor && sensor.folderId !== undefined
				);

				// Filter projects based on user's company if not master admin
				const filteredProjects =
					currentUser?.role === 'master'
						? projectsData
						: projectsData.filter(
								(project) =>
									project.companyId === currentUser?.companyId
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
		const interval = setInterval(() => {
			setSensors((prev) =>
				prev.map((sensor) => ({
					...sensor,
					values: sensor.values.map((value) => ({
						...value,
						value:
							value.type === 'temperature'
								? parseFloat(
										(
											value.value +
											(Math.random() * 0.4 - 0.2)
										).toFixed(1)
								  )
								: value.type === 'humidity'
								? parseFloat(
										(
											value.value +
											(Math.random() * 2 - 1)
										).toFixed(1)
								  )
								: value.type === 'battery'
								? Math.max(
										0,
										Math.min(
											100,
											value.value - Math.random() * 0.5
										)
								  )
								: parseFloat(
										(
											value.value +
											(Math.random() * 2 - 1)
										).toFixed(1)
								  )
					})),
					lastUpdated: new Date().toLocaleTimeString()
				}))
			);
		}, 5000);

		return () => clearInterval(interval);
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
