
export interface Location {
  lat: number;
  lng: number;
}

export interface SensorReading {
  timestamp: string;
  value: number;
}

export interface Sensor {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "maintenance";
  location?: Location;
  lastReading?: SensorReading;
  unit: string;
  companyId: string;  // Primary ownership is now by company
  folderId?: string;  // Folder is now just for organization, not ownership
  imei?: string;      // Added IMEI field for device identification
  lastUpdated?: string; // Added for tracking last data update time
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "maintenance";
  location?: Location;
  companyId: string;  // Primary ownership is now by company
  folderId?: string;  // Folder is now just for organization, not ownership
  imei?: string;      // Added IMEI field for device identification
  lastUpdated?: string; // Added for tracking last data update time
}

export interface TrackingObject {
  id: string;
  name: string;
  position: Location;
  lastUpdated: string;
  speed: number;
  direction: number;
  batteryLevel: number;
}
