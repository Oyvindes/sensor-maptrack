
import { Device, TrackingObject } from "@/types/sensors";

export const getMockDevices = (): Device[] => {
  return [
    {
      id: "device-001",
      name: "Gateway NTNU",
      type: "gateway",
      status: "online",
      location: { lat: 63.4173, lng: 10.4035 },
      companyId: "company-001",
      imei: "351756051523999",
      lastUpdated: new Date(Date.now() - 5 * 60000).toLocaleString() // 5 minutes ago
    },
    {
      id: "device-002",
      name: "Router Nidaros",
      type: "router",
      status: "online",
      location: { lat: 63.4268, lng: 10.3969 },
      companyId: "company-001",
      imei: "351756051524001",
      lastUpdated: new Date(Date.now() - 12 * 60000).toLocaleString() // 12 minutes ago
    },
    {
      id: "device-003",
      name: "Tracker Solsiden",
      type: "tracker",
      status: "offline",
      location: { lat: 63.4352, lng: 10.4111 },
      companyId: "company-002",
      imei: "351756051524002",
      lastUpdated: new Date(Date.now() - 120 * 60000).toLocaleString() // 2 hours ago
    }
  ];
};

export const mapDeviceToTrackingObject = (device: Device): TrackingObject => {
  return {
    id: device.id,
    name: device.name,
    position: device.location || { lat: 0, lng: 0 },
    lastUpdated: device.lastUpdated || new Date().toLocaleTimeString(),
    speed: 0,
    direction: 0,
    batteryLevel: 100,
  };
};
