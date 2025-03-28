/**
 * Power Sensors Type Definitions
 * This file contains all type definitions related to power sensors
 */

// Base power sensor type
export interface PowerSensor {
  id: string;
  name: string;
  imei: string;
  status: 'online' | 'offline' | 'warning';
  companyId?: string;
  folderId?: string;
  lastUpdated: string;
}

// Power status type
export interface PowerStatus {
  id: string;
  power_sensor_id: string;
  power_state: boolean;
  last_toggled_at: string;
  last_toggled_by: string | null;
  created_at: string;
  updated_at: string;
}

// Power consumption data type
export interface PowerConsumptionData {
  id: string;
  power_sensor_id: string;
  timestamp: string;
  energy: number;
  cost: number | null;
  price_region: string | null;
  created_at: string;
}

// Power toggle result type
export interface PowerToggleResult {
  success: boolean;
  status: PowerStatus | null;
  message: string;
}

// Power sensor save result type
export interface PowerSensorSaveResult {
  success: boolean;
  data?: PowerSensor;
  message: string;
}

// Power sensor delete result type
export interface PowerSensorDeleteResult {
  success: boolean;
  message: string;
}

// Time range type for power consumption chart
export type TimeRange = '1h' | '24h' | '7d' | '30d' | 'custom';

// Date range type for custom date selection
export interface DateRange {
  from: Date;
  to: Date;
}