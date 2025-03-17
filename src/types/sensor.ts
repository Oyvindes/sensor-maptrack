// Common sensor value type
export interface SensorValue {
  type: string;
  value: number;
  unit: string;
}

// The full data representation includes all sensor data fields and the common fields
export interface SensorDataValues {
  1: any[];
  2: any[];
  3: any[];
  4: any[];
  5: any[];
  6: any[];
  7: any[];
  8: any[];
  DS18B20_Temp: number;
  IMEI: string;
  IMSI: string;
  Model: string;
  adc1: number;
  battery: number;
  digital_in: number;
  humidity: number;
  interrupt: number;
  interrupt_level: number;
  mod: number;
  signal: number;
  temperature: number;
  time: string;
  // Include SensorValue properties for compatibility
  type?: string;
  value?: number;
  unit?: string;
}

// Helper function to convert SensorDataValues to SensorValue
export function convertToSensorValue(data: SensorDataValues, defaultType = "temperature"): SensorValue {
  // If the data already has the SensorValue properties, use them
  if (data.type && data.value !== undefined && data.unit) {
    return {
      type: data.type,
      value: data.value,
      unit: data.unit
    };
  }
  
  // Otherwise, extract values based on the defaultType
  let value = 0;
  let unit = "°C";
  
  switch (defaultType) {
    case "temperature":
      value = data.temperature || data.DS18B20_Temp || 0;
      unit = "°C";
      break;
    case "humidity":
      value = data.humidity || 0;
      unit = "%";
      break;
    case "battery":
      value = data.battery || 0;
      unit = "%";
      break;
    case "signal":
      value = data.signal || 0;
      unit = "dBm";
      break;
    default:
      // Default to temperature
      value = data.temperature || 0;
      unit = "°C";
  }
  
  return {
    type: defaultType,
    value,
    unit
  };
}

// Helper function to convert SensorValue to SensorDataValues
export function convertToSensorDataValues(data: SensorValue): SensorDataValues {
  const result: SensorDataValues = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    DS18B20_Temp: 0,
    IMEI: '',
    IMSI: '',
    Model: '',
    adc1: 0,
    battery: 0,
    digital_in: 0,
    humidity: 0,
    interrupt: 0,
    interrupt_level: 0,
    mod: 0,
    signal: 0,
    temperature: 0,
    time: new Date().toISOString(),
    // Include the original values
    type: data.type,
    value: data.value,
    unit: data.unit
  };
  
  // Set the appropriate field based on type
  switch (data.type) {
    case "temperature":
      result.temperature = data.value;
      result.DS18B20_Temp = data.value;
      break;
    case "humidity":
      result.humidity = data.value;
      break;
    case "battery":
      result.battery = data.value;
      break;
    case "signal":
      result.signal = data.value;
      break;
  }
  
  return result;
}
