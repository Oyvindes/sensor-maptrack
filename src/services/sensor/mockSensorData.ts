
import { SensorData } from "@/components/SensorCard";

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
