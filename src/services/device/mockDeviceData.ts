
import { Device, TrackingObject } from "@/types/sensors";

export const getMockDevices = (): Device[] => {
  return [
    {
      id: "device-001",
      name: "Gateway 1",
      type: "gateway",
      status: "online",
      location: { lat: 63.429343, lng: 10.395264 }, // NTNU Gløshaugen
      companyId: "company-001"
    },
    {
      id: "device-002",
      name: "Router 1",
      type: "router",
      status: "online",
      location: { lat: 63.431880, lng: 10.403909 }, // Trondheim Torg
      companyId: "company-001"
    },
    {
      id: "device-003",
      name: "Tracker 1",
      type: "tracker",
      status: "offline",
      location: { lat: 63.426035, lng: 10.410142 }, // St. Olavs Hospital
      companyId: "company-002"
    }
  ];
};

export const mapDeviceToTrackingObject = (device: Device): TrackingObject => {
  return {
    id: device.id,
    name: device.name,
    position: device.location || { lat: 0, lng: 0 },
    lastUpdated: new Date().toLocaleTimeString(),
    speed: 0,
    direction: 0,
    batteryLevel: 100,
  };
};
