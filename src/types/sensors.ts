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
  status: "online" | "offline" | "maintenance";
  location?: Location;
  companyId: string;
  imei?: string;
  lastUpdated?: string;
  folderId?: string;
}

export interface Sensor {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive";
  location?: Location;
  companyId: string;
}
