
import { TrackingObject } from "@/types/sensors";

export const getMockTrackingObjects = (): TrackingObject[] => {
  return [
    {
      id: "vehicle-001",
      name: "Delivery Van 1",
      position: { lat: 40.7128, lng: -74.006 },
      lastUpdated: new Date().toLocaleTimeString(),
      speed: 35,
      direction: 90,
      batteryLevel: 78,
    },
    {
      id: "vehicle-002",
      name: "Delivery Van 2",
      position: { lat: 40.7328, lng: -73.986 },
      lastUpdated: new Date().toLocaleTimeString(),
      speed: 0,
      direction: 0,
      batteryLevel: 92,
    },
    {
      id: "drone-001",
      name: "Drone 1",
      position: { lat: 40.7228, lng: -74.026 },
      lastUpdated: new Date().toLocaleTimeString(),
      speed: 25,
      direction: 270,
      batteryLevel: 45,
    },
  ];
};
