
import { useState, useEffect } from 'react';
import { SensorFolder } from '@/types/users';
import { toast } from 'sonner';
import { fetchSensors } from '@/services/sensor/supabaseSensorService';
import { isValidUUID, mapCompanyIdToUUID } from '@/utils/uuidUtils';

export const useFolderEditor = (
	folder: SensorFolder,
	onSave: (folder: SensorFolder) => void
) => {
	const [formData, setFormData] = useState<SensorFolder>(folder);
	const [availableSensors, setAvailableSensors] = useState<
		Array<{ imei: string; name: string }>
	>([]);
	const [mapLocation, setMapLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [mapFocusPosition, setMapFocusPosition] = useState<
		[number, number] | undefined
	>(undefined);
	const [directionsDialogOpen, setDirectionsDialogOpen] = useState(false);
	const [isSavingInProgress, setIsSavingInProgress] = useState(false);

	useEffect(() => {
		const fetchAvailableSensors = async () => {
			try {
				// Convert company ID to the proper format for database queries
				let companyUuid: string | null = null;

				if (formData.companyId) {
					if (isValidUUID(formData.companyId)) {
						companyUuid = formData.companyId;
					} else {
						// Make sure the function returns a string instead of a Promise
						companyUuid = await Promise.resolve(mapCompanyIdToUUID(formData.companyId));
					}
				}

				console.log(
					`Fetching sensors for company: ${formData.companyId} (UUID: ${companyUuid})`
				);

				const allSensors = await fetchSensors();

				const filteredSensors = allSensors
					.filter((sensor) => {
						// For debugging
						console.log(
							`Sensor ${sensor.imei} has companyId: ${sensor.companyId}`
						);

						if (!sensor.companyId || !formData.companyId) {
							console.log(
								`Sensor ${sensor.imei} or form has no companyId`
							);
							return false;
						}

						// Get UUID for sensor's company ID
						const sensorCompanyUuid = isValidUUID(sensor.companyId)
							? sensor.companyId
							: mapCompanyIdToUUID(sensor.companyId);

						// Check against both the original ID and the UUID
						const isMatch =
							sensor.companyId === formData.companyId ||
							sensor.companyId === companyUuid ||
							sensorCompanyUuid === companyUuid ||
							sensorCompanyUuid === formData.companyId;

						console.log(
							`Sensor ${sensor.imei} match status: ${isMatch}`
						);

						return isMatch;
					})
					.map((sensor) => ({
						imei: sensor.imei,
						name: sensor.name
					}));

				console.log(
					`Found ${filteredSensors.length} sensors for company ${formData.companyId}`
				);
				setAvailableSensors(filteredSensors);
			} catch (error) {
				console.error('Error fetching sensors:', error);
				setAvailableSensors([]);
			}
		};

		fetchAvailableSensors();

		if (formData.location) {
			try {
				let locationData: { lat: number; lng: number };

				if (typeof formData.location === 'string') {
					locationData = JSON.parse(formData.location as string);
				} else {
					locationData = formData.location as {
						lat: number;
						lng: number;
					};
				}

				setMapLocation(locationData);
				setMapFocusPosition([locationData.lat, locationData.lng]);
			} catch (e) {
				console.error('Error parsing location data:', e);
				setMapLocation(null);
				setMapFocusPosition(undefined);
			}
		}

		// Listen for dialog state changes from ProjectInfoFields
		const handleDialogStateChange = (event: Event) => {
			const customEvent = event as CustomEvent;
			setDirectionsDialogOpen(customEvent.detail.isOpen);
		};

		window.addEventListener(
			'directionsDialogStateChange',
			handleDialogStateChange
		);

		return () => {
			window.removeEventListener(
				'directionsDialogStateChange',
				handleDialogStateChange
			);
		};
	}, [formData.companyId, formData.location]);

	const handleChange = (
		field: keyof SensorFolder,
		value: string | string[]
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		if (field === 'location' && typeof value === 'string') {
			try {
				const locationData = JSON.parse(value);
				if (locationData.lat && locationData.lng) {
					setMapFocusPosition([locationData.lat, locationData.lng]);
				}
			} catch (e) {
				console.error('Error parsing updated location data:', e);
			}
		}
	};

	const handleSensorToggle = (sensorImei: string, checked: boolean) => {
		setFormData((prev) => {
			const currentAssignedSensors = prev.assignedSensorImeis || [];
			let updatedSensors: string[];

			if (checked) {
				if (currentAssignedSensors.includes(sensorImei)) {
					toast.info(
						'This sensor is already assigned to this project'
					);
					return prev;
				}

				updatedSensors = [...currentAssignedSensors, sensorImei];
				toast.success('Sensor added successfully');
			} else {
				updatedSensors = currentAssignedSensors.filter(
					(imei) => imei !== sensorImei
				);
				toast.info('Sensor removed from project');
			}

			return { ...prev, assignedSensorImeis: updatedSensors };
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (isSavingInProgress) {
			console.log(
				'Save already in progress, ignoring duplicate submission'
			);
			return;
		}

		try {
			setIsSavingInProgress(true);
			// In a real application, this would include validation
			onSave(formData);
		} catch (error) {
			console.error('Error submitting form:', error);
			toast.error('Failed to save project');
		} finally {
			setIsSavingInProgress(false);
		}
	};

	const handleCompanyChange = (companyId: string) => {
		setFormData((prev) => ({
			...prev,
			companyId,
			assignedSensorImeis: []
		}));
	};

	return {
		formData,
		availableSensors,
		mapLocation,
		mapFocusPosition,
		directionsDialogOpen,
		isSavingInProgress,
		handleChange,
		handleSensorToggle,
		handleSubmit,
		handleCompanyChange
	};
};
