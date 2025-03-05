
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
  companyId: string;
  folderId?: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "maintenance";
  location?: Location;
  companyId: string;
  folderId?: string;
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
