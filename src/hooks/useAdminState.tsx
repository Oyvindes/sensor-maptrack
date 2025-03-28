import { useState, useEffect, useCallback } from 'react';
import { companyService } from '@/services/company';
import { getUsers } from '@/services/user/supabaseUserService';
import {
	fetchDevices,
	fetchTrackingObjects
} from '@/services/sensorService';
import { fetchSensors } from '@/services/sensor/supabaseSensorService';
import { fetchPowerSensors } from '@/services/sensor/fetchPowerSensors';
import { toast } from 'sonner';
import { Company, User, SensorFolder } from '@/types/users';
import { Device, Sensor, TrackingObject } from '@/types/sensors';
import { SensorData } from '@/components/SensorCard';

export type AdminMode =
	| 'listCompanies'
	| 'editCompany'
	| 'listUsers'
	| 'editUser'
	| 'listSensors'
	| 'editSensor'
	| 'listDevices'
	| 'editDevice'
	| 'listFolders'
	| 'editFolder'
	| 'importSensors'
	| 'importPowerSensors'
	| 'deleteSensors';

export type AdminTab =
	| 'companies'
	| 'users'
	| 'sensors'
	| 'devices'
	| 'folders';

export function useAdminState() {
	const [mode, setMode] = useState<AdminMode>('listCompanies');
	const [activeTab, setActiveTab] = useState<AdminTab>('companies');

	const [selectedCompany, setSelectedCompany] = useState<Company | null>(
		null
	);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [selectedSensor, setSelectedSensor] = useState<
		(SensorData & { folderId?: string; companyId?: string; imei?: string }) | null
	>(null);
	const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
	const [selectedFolder, setSelectedFolder] = useState<SensorFolder | null>(
		null
	);

	const [companies, setCompanies] = useState<Company[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [sensors, setSensors] = useState<
		(SensorData & { folderId?: string; companyId?: string; imei?: string })[]
	>([]);
	const [devices, setDevices] = useState<Device[]>([]);
	const [trackingObjects, setTrackingObjects] = useState<TrackingObject[]>(
		[]
	);
	const [sensorFolders, setSensorFolders] = useState<SensorFolder[]>([]);

	// Create a memoized function for loading devices and tracking objects
	const loadDevicesAndTracking = useCallback(async () => {
		try {
			const [devicesData, trackingData] = await Promise.all([
				fetchDevices(),
				fetchTrackingObjects()
			]);
			
			setDevices(devicesData);
			setTrackingObjects(trackingData);
		} catch (error) {
			console.error('Error fetching devices/tracking:', error);
			setDevices([]);
			setTrackingObjects([]);
		}
	}, []);

	// Create a memoized function for loading sensors
	const loadSensors = useCallback(async () => {
		try {
			// Fetch regular sensors
			const sensorsData = await fetchSensors();
			
			// Fetch power sensors
			const powerSensorsData = await fetchPowerSensors();
			
			// Combine regular and power sensors
			const allSensors = [
				...sensorsData.map((sensor) => {
					// Ensure sensor has values array and add folderId if it exists
					if (!sensor.values || !Array.isArray(sensor.values)) {
						// Convert old format to new format if needed
						return {
							...sensor,
							values: [] // Use empty array of SensorDataValues type
						};
					}
					return sensor;
				}),
				...powerSensorsData // Power sensors already have the correct format
			];
			
			console.log('Loaded sensors:', sensorsData.length);
			console.log('Loaded power sensors:', powerSensorsData.length);
			console.log('Total sensors:', allSensors.length);
			
			setSensors(allSensors);
		} catch (error) {
			console.error('Error fetching sensors:', error);
		}
	}, []);

	useEffect(() => {
		// Fetch companies and users
		const fetchData = async () => {
			try {
				const [companiesData, usersData] = await Promise.all([
					companyService.list(),
					getUsers()
				]);

				setCompanies(companiesData);
				setUsers(usersData);
			} catch (error) {
				console.error('Error fetching companies/users:', error);
				toast.error('Failed to load companies or users');
				setCompanies([]);
				setUsers([]);
			}
		};

		fetchData();

		// Fetch sensors
		loadSensors();

		// Fetch devices and tracking objects
		loadDevicesAndTracking();
		
		// Listen for the custom device-updated event
		const handleDeviceUpdated = (event: Event) => {
			console.log('Device updated event received in useAdminState, refreshing data...');
			loadDevicesAndTracking();
		};
		
		// Listen for the custom sensor-updated event
		const handleSensorUpdated = (event: Event) => {
			console.log('Sensor updated event received in useAdminState, refreshing data...');
			loadSensors();
		};
		
		window.addEventListener('device-updated', handleDeviceUpdated);
		window.addEventListener('sensor-updated', handleSensorUpdated);
		
		return () => {
			window.removeEventListener('device-updated', handleDeviceUpdated);
			window.removeEventListener('sensor-updated', handleSensorUpdated);
		};
	}, [loadDevicesAndTracking, loadSensors]);

	const handleTabChange = (value: string) => {
		setActiveTab(value as AdminTab);

		switch (value) {
			case 'companies':
				setMode('listCompanies');
				break;
			case 'users':
				setMode('listUsers');
				break;
			case 'sensors':
				setMode('listSensors');
				// Force a refresh of sensors when switching to sensors tab
				console.log('Switching to sensors tab, refreshing data...');
				setTimeout(() => {
					loadSensors();
				}, 500);
				break;
			case 'devices':
				setMode('listDevices');
				// Force a refresh of tracking objects when switching to devices tab
				console.log('Switching to devices tab, refreshing data...');
				setTimeout(() => {
					loadDevicesAndTracking();
				}, 500);
				break;
			case 'folders':
				setMode('listFolders');
				break;
		}
	};

	return {
		mode,
		setMode,
		activeTab,
		setActiveTab,
		selectedCompany,
		setSelectedCompany,
		selectedUser,
		setSelectedUser,
		selectedSensor,
		setSelectedSensor,
		selectedDevice,
		setSelectedDevice,
		selectedFolder,
		setSelectedFolder,
		companies,
		setCompanies,
		users,
		setUsers,
		sensors,
		setSensors,
		devices,
		setDevices,
		trackingObjects,
		setTrackingObjects,
		sensorFolders,
		setSensorFolders,
		handleTabChange,
		loadDevicesAndTracking, // Export the function so it can be called from outside
		loadSensors // Export the function so it can be called from outside
	};
}
