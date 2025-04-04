/**
 * Power Sensor Adapter
 * This file contains adapter functions to convert between legacy SensorData and new type system
 */

import { SensorData } from '@/components/SensorCard';
import { 
  PowerSensor, 
  PowerSensorSaveResult, 
  EnvironmentalSensor,
  DataOperationResult
} from '@/types/sensorTypes';

/**
 * Convert legacy SensorData to PowerSensor
 * @param sensorData The SensorData object to convert
 * @returns PowerSensor object
 */
export function sensorDataToPowerSensor(sensorData: SensorData): PowerSensor {
  return {
    id: sensorData.id,
    name: sensorData.name,
    imei: sensorData.imei || '',
    status: sensorData.status as 'online' | 'offline' | 'warning',
    companyId: sensorData.companyId,
    folderId: sensorData.folderId,
    lastUpdated: sensorData.lastUpdated,
    sensorType: 'power'
  };
}

/**
 * Convert PowerSensor to legacy SensorData
 * @param powerSensor The PowerSensor object to convert
 * @returns SensorData object
 */
export function powerSensorToSensorData(powerSensor: PowerSensor): SensorData {
  return {
    id: powerSensor.id,
    name: powerSensor.name,
    imei: powerSensor.imei,
    status: powerSensor.status,
    values: [],
    lastUpdated: powerSensor.lastUpdated,
    companyId: powerSensor.companyId,
    folderId: powerSensor.folderId,
    sensorType: 'power'
  };
}

/**
 * Convert an array of SensorData to an array of PowerSensor
 * @param sensorDataArray The array of SensorData to convert
 * @returns Array of PowerSensor objects
 */
export function sensorDataArrayToPowerSensorArray(sensorDataArray: SensorData[]): PowerSensor[] {
  return sensorDataArray.map(sensorDataToPowerSensor);
}

/**
 * Convert a SensorData save result to a PowerSensor save result
 * @param result The SensorData save result to convert
 * @returns PowerSensor save result
 */
export function convertSaveResult(result: { 
  success: boolean; 
  data?: SensorData; 
  message: string 
}): PowerSensorSaveResult {
  return {
    success: result.success,
    data: result.data ? sensorDataToPowerSensor(result.data) : undefined,
    message: result.message
  };
}

/**
 * Convert between different sensor types
 * @param sensor The sensor to convert
 * @param targetType The target sensor type
 * @returns Converted sensor
 */
export function convertSensorType<T extends PowerSensor | EnvironmentalSensor>(
  sensor: PowerSensor | EnvironmentalSensor,
  targetType: 'power' | 'environmental'
): T {
  if (targetType === 'power' && sensor.sensorType !== 'power') {
    // Convert to PowerSensor
    const powerSensor: PowerSensor = {
      id: sensor.id,
      name: sensor.name,
      imei: 'imei' in sensor ? sensor.imei : '',
      status: sensor.status as 'online' | 'offline' | 'warning',
      lastUpdated: sensor.lastUpdated,
      companyId: sensor.companyId,
      folderId: sensor.folderId,
      sensorType: 'power'
    };
    return powerSensor as unknown as T;
  } else if (targetType === 'environmental' && sensor.sensorType === 'power') {
    // Convert to EnvironmentalSensor
    const envSensor: EnvironmentalSensor = {
      id: sensor.id,
      name: sensor.name,
      imei: 'imei' in sensor ? sensor.imei : '',
      status: sensor.status,
      lastUpdated: sensor.lastUpdated,
      companyId: sensor.companyId,
      folderId: sensor.folderId,
      sensorType: 'generic',
      values: []
    };
    return envSensor as unknown as T;
  }
  
  // If already the correct type, just return as is
  return sensor as unknown as T;
}

/**
 * Generic operation result converter
 * @param result The operation result to convert
 * @param converter Optional data converter function
 * @returns Converted operation result
 */
export function convertOperationResult<T, U>(
  result: DataOperationResult<T>,
  converter?: (data: T) => U
): DataOperationResult<U> {
  if (!result.data || !converter) {
    return {
      success: result.success,
      message: result.message,
      data: undefined
    };
  }
  
  return {
    success: result.success,
    message: result.message,
    data: converter(result.data)
  };
}