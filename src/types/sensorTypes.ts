/**
 * Consolidated Sensor Type Definitions
 * This file contains all type definitions related to sensors, including regular sensors and power sensors
 */

// Base location type
export interface Location {
  lat: number;
  lng: number;
}

// Base sensor value type
export interface BaseSensorValue {
  time: string;
  [key: string]: any;
}

// Specific sensor value type for environmental sensors
export interface EnvironmentalSensorValue extends BaseSensorValue {
  temperature?: number;
  humidity?: number;
  battery: number;
  signal: number;
  adc1?: number;
}

// Specific sensor value type for power sensors
export interface PowerSensorValue extends BaseSensorValue {
  energy: number;
  cost?: number;
  power_state?: boolean;
}

// Sensor status types
export type SensorStatus = 'online' | 'offline' | 'warning' | 'active' | 'inactive' | 'maintenance';

// Sensor type enum
export type SensorType = 'temperature' | 'humidity' | 'battery' | 'proximity' | 'signal' | 'adc1' | 'power';

// Sensor material type
export type SensorMaterialType = 'wood' | 'concrete' | 'power' | 'generic';

// Base sensor interface that all sensor types extend
export interface BaseSensor {
  id: string;
  name: string;
  status: SensorStatus;
  lastUpdated: string;
  companyId?: string;
  folderId?: string;
}

// Environmental sensor interface
export interface EnvironmentalSensor extends BaseSensor {
  imei: string;
  values: EnvironmentalSensorValue[];
  sensorType: Exclude<SensorMaterialType, 'power'>;
  projectName?: string;
}

// Power sensor interface
export interface PowerSensor extends BaseSensor {
  imei: string;
  status: Extract<SensorStatus, 'online' | 'offline' | 'warning'>;
  sensorType: Extract<SensorMaterialType, 'power'>;
}

// Power status interface
export interface PowerStatus {
  id: string;
  power_sensor_id: string;
  power_state: boolean;
  last_toggled_at: string;
  last_toggled_by: string | null;
  created_at: string;
  updated_at: string;
}

// Power consumption data interface
export interface PowerConsumptionData {
  id: string;
  power_sensor_id: string;
  timestamp: string;
  energy: number;
  cost: number | null;
  price_region: string | null;
  created_at: string;
}

// Operation result interfaces
export interface OperationResult {
  success: boolean;
  message: string;
}

export interface DataOperationResult<T> extends OperationResult {
  data?: T;
}

// Power toggle result interface
export interface PowerToggleResult extends OperationResult {
  status: PowerStatus | null;
}

// Specific result types
export type PowerSensorSaveResult = DataOperationResult<PowerSensor>;
export type PowerSensorDeleteResult = OperationResult;

// Database filter type
export interface DatabaseFilter {
  column: string;
  value: any;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like';
}

// Time range type for power consumption chart
export type TimeRange = '1h' | '24h' | '7d' | '30d' | 'custom';

// Date range type for custom date selection
export interface DateRange {
  from: Date;
  to: Date;
}

// Legacy type for backward compatibility
export type SensorData = EnvironmentalSensor | PowerSensor;