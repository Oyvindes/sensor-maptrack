
// Common sensor value type
export interface SensorValue {
  type: string;
  value: number;
  unit: string;
}

// Update SensorDataValues to include type
export interface SensorDataValues extends SensorValue {
  // Any additional properties
}
