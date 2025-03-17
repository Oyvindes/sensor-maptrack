export interface Location {
	lat: number;
	lng: number;
}

export interface TrackingObject {
	id: string;
	name: string;
	position: Location;
	lastUpdated: string;
	speed: number;
	direction: number;
	batteryLevel: number;
	folderId?: string;
}

export interface Device {
	id: string;
	name: string;
	type: string;
	status: 'online' | 'offline' | 'maintenance' | 'warning';
	location?: Location;
	companyId: string;
	imei?: string;
	lastUpdated?: string;
	lastSeen?: string;
	createdAt?: string;
	folderId?: string;
}

export interface Sensor {
	id: string;
	imei: string;
	name: string;
	type: string;
	status: 'active' | 'inactive' | 'offline' | 'online';
	location?: Location;
	companyId: string;
	// Optional properties for sensor value display
	lastReading?: number;
	unit?: string;
	folderId?: string;
}
