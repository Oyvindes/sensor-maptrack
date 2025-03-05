
import { SensorData, SensorValue } from "@/components/SensorCard";
import { TrackingObject, Device } from "@/types/sensors";

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

// Mock API call to create a new sensor
export const createSensor = async (
  sensorData: SensorData
): Promise<{ success: boolean; data: SensorData; message: string }> => {
  console.log("Creating new sensor:", sensorData);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a more realistic ID based on the sensor type
      const newId = `sensor-${Date.now().toString().slice(-3)}`;
      const createdSensor = { ...sensorData, id: newId };
      
      resolve({
        success: true,
        data: createdSensor,
        message: `Sensor ${createdSensor.name} created successfully`,
      });
    }, 800);
  });
};

// Mock data generators
export const getMockSensors = (): (SensorData & { folderId?: string })[] => {
  return [
    {
      id: "sensor-001",
      name: "Environmental Sensor 1",
      values: [
        {
          type: "temperature",
          value: 23.5,
          unit: "°C",
        },
        {
          type: "humidity",
          value: 45.2,
          unit: "%",
        }
      ],
      status: "online",
      lastUpdated: new Date().toLocaleTimeString(),
      folderId: "folder-001"
    },
    {
      id: "sensor-002",
      name: "Power Sensor 1",
      values: [
        {
          type: "battery",
          value: 87,
          unit: "%",
        },
        {
          type: "signal",
          value: 68,
          unit: "dBm",
        }
      ],
      status: "warning",
      lastUpdated: new Date().toLocaleTimeString(),
      folderId: "folder-002"
    },
    {
      id: "sensor-003",
      name: "Proximity Sensor 1",
      values: [
        {
          type: "proximity",
          value: 15.3,
          unit: "cm",
        }
      ],
      status: "online",
      lastUpdated: new Date().toLocaleTimeString(),
      folderId: "folder-003"
    },
    {
      id: "sensor-004",
      name: "Multi Sensor 1",
      values: [
        {
          type: "temperature",
          value: 26.7,
          unit: "°C",
        },
        {
          type: "humidity",
          value: 52.8,
          unit: "%",
        },
        {
          type: "battery",
          value: 92,
          unit: "%",
        },
        {
          type: "signal",
          value: 74,
          unit: "dBm",
        }
      ],
      status: "online",
      lastUpdated: new Date().toLocaleTimeString(),
      folderId: "folder-004"
    },
  ];
};

export const getMockDevices = (): Device[] => {
  return [
    {
      id: "device-001",
      name: "Gateway 1",
      type: "gateway",
      status: "online",
      location: { lat: 59.9139, lng: 10.7522 },
      companyId: "company-001"
    },
    {
      id: "device-002",
      name: "Router 1",
      type: "router",
      status: "online",
      location: { lat: 59.9239, lng: 10.7422 },
      companyId: "company-001"
    },
    {
      id: "device-003",
      name: "Tracker 1",
      type: "tracker",
      status: "offline",
      location: { lat: 59.9339, lng: 10.7622 },
      companyId: "company-002"
    }
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
