
import { SensorData } from "@/components/SensorCard";
import { TrackingObject } from "@/components/TrackingMap";

// This is a mock service for demo purposes
// In a real application, this would call actual API endpoints

export const sendCommandToSensor = async (
  sensorId: string,
  command: string,
  params?: Record<string, any>
): Promise<{ success: boolean; message: string }> => {
  console.log(`Sending command "${command}" to sensor ${sensorId}`, params);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Command "${command}" sent to sensor ${sensorId} successfully`,
      });
    }, 800);
  });
};

export const updateTrackingObject = async (
  objectId: string,
  data: Partial<TrackingObject>
): Promise<{ success: boolean; message: string }> => {
  console.log(`Updating tracking object ${objectId}`, data);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Tracking object ${objectId} updated successfully`,
      });
    }, 800);
  });
};

// Mock data generators
export const getMockSensors = (): SensorData[] => {
  return [
    {
      id: "temp-001",
      name: "Temperature Sensor 1",
      type: "temperature",
      value: 23.5,
      unit: "°C",
      status: "online",
      lastUpdated: new Date().toLocaleTimeString(),
    },
    {
      id: "hum-001",
      name: "Humidity Sensor 1",
      type: "humidity",
      value: 45.2,
      unit: "%",
      status: "online",
      lastUpdated: new Date().toLocaleTimeString(),
    },
    {
      id: "bat-001",
      name: "Battery Level 1",
      type: "battery",
      value: 87,
      unit: "%",
      status: "warning",
      lastUpdated: new Date().toLocaleTimeString(),
    },
    {
      id: "prox-001",
      name: "Proximity Sensor 1",
      type: "proximity",
      value: 15.3,
      unit: "cm",
      status: "online",
      lastUpdated: new Date().toLocaleTimeString(),
    },
    {
      id: "sig-001",
      name: "Signal Strength 1",
      type: "signal",
      value: 68,
      unit: "dBm",
      status: "offline",
      lastUpdated: new Date().toLocaleTimeString(),
    },
  ];
};

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
