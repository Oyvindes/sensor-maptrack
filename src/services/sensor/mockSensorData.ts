import { SensorData } from "@/components/SensorCard";
import { SensorValue } from "@/types/sensor";

export const getMockSensors = (): (SensorData & { folderId?: string, companyId: string })[] => {
  return [
    {
      id: "123548561254875", // Using the IMEI directly as identifier
      name: "Briks Sensor IMEI-123548561254875",
      imei: "123548561254875", // Adding the IMEI as a separate field
      values: [
        {
          type: "temperature",
          value: 21.3,
          unit: "°C",
        } as SensorValue,
        {
          type: "humidity",
          value: 48.7,
          unit: "%",
        } as SensorValue,
        {
          type: "battery",
          value: 95,
          unit: "%",
        } as SensorValue
      ],
      status: "online",
      lastUpdated: new Date().toLocaleTimeString(),
      companyId: "company-004" // Briks company ID
    },
    {
      id: "sensor-001",
      name: "Environmental Sensor 1",
      values: [
        {
          type: "temperature",
          value: 23.5,
          unit: "°C",
        } as SensorValue,
        {
          type: "humidity",
          value: 45.2,
          unit: "%",
        } as SensorValue
      ],
      status: "online",
      lastUpdated: new Date().toLocaleTimeString(),
      folderId: "folder-001",
      companyId: "company-001" // Added company ID
    },
    {
      id: "sensor-002",
      name: "Power Sensor 1",
      values: [
        {
          type: "battery",
          value: 87,
          unit: "%",
        } as SensorValue,
        {
          type: "signal",
          value: 68,
          unit: "dBm",
        } as SensorValue
      ],
      status: "warning",
      lastUpdated: new Date().toLocaleTimeString(),
      folderId: "folder-002",
      companyId: "company-001" // Added company ID
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
      folderId: "folder-003",
      companyId: "company-002" // Added company ID
    },
    {
      id: "sensor-004",
      name: "Multi Sensor 1",
      values: [
        {
          type: "temperature",
          value: 26.7,
          unit: "°C",
        } as SensorValue,
        {
          type: "humidity",
          value: 52.8,
          unit: "%",
        } as SensorValue,
        {
          type: "battery",
          value: 92,
          unit: "%",
        } as SensorValue,
        {
          type: "signal",
          value: 74,
          unit: "dBm",
        } as SensorValue
      ],
      status: "online",
      lastUpdated: new Date().toLocaleTimeString(),
      folderId: "folder-004",
      companyId: "company-003" // Added company ID
    },
  ];
};
