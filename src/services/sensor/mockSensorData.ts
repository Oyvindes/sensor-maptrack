
import { SensorData } from "@/components/SensorCard";
import { SensorDataValues, convertToSensorDataValues } from "@/types/sensor";

export const getMockSensors = (): (SensorData & { folderId?: string, companyId: string })[] => {
  // Create a default sensor data value
  const createSensorDataValue = (temperatureValue = 21.3, humidityValue = 48.7, batteryValue = 95): SensorDataValues => {
    return {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      DS18B20_Temp: temperatureValue,
      IMEI: "",
      IMSI: "",
      Model: "",
      adc1: 0,
      battery: batteryValue,
      digital_in: 0,
      humidity: humidityValue,
      interrupt: 0,
      interrupt_level: 0,
      mod: 0,
      signal: 68,
      temperature: temperatureValue,
      time: new Date().toISOString(),
      type: "temperature",
      value: temperatureValue,
      unit: "°C"
    };
  };

  return [
    {
      id: "123548561254875", // Using the IMEI directly as identifier
      name: "Briks Sensor IMEI-123548561254875",
      imei: "123548561254875", // Adding the IMEI as a separate field
      values: [
        createSensorDataValue(21.3, 48.7, 95),
        { ...createSensorDataValue(21.3, 48.7, 95), type: "humidity", value: 48.7, unit: "%" },
        { ...createSensorDataValue(21.3, 48.7, 95), type: "battery", value: 95, unit: "%" }
      ],
      status: "online",
      lastUpdated: new Date().toLocaleTimeString(),
      companyId: "company-004" // Briks company ID
    },
    {
      id: "sensor-001",
      name: "Environmental Sensor 1",
      values: [
        createSensorDataValue(23.5, 45.2, 87),
        { ...createSensorDataValue(23.5, 45.2, 87), type: "humidity", value: 45.2, unit: "%" }
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
        { ...createSensorDataValue(24.1, 44.0, 87), type: "battery", value: 87, unit: "%" },
        { ...createSensorDataValue(24.1, 44.0, 87), type: "signal", value: 68, unit: "dBm" }
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
          ...createSensorDataValue(22.4, 51.2, 90),
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
        createSensorDataValue(26.7, 52.8, 92),
        { ...createSensorDataValue(26.7, 52.8, 92), type: "humidity", value: 52.8, unit: "%" },
        { ...createSensorDataValue(26.7, 52.8, 92), type: "battery", value: 92, unit: "%" },
        { ...createSensorDataValue(26.7, 52.8, 92), type: "signal", value: 74, unit: "dBm" }
      ],
      status: "online",
      lastUpdated: new Date().toLocaleTimeString(),
      folderId: "folder-004",
      companyId: "company-003" // Added company ID
    },
  ];
};
