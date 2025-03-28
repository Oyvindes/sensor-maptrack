/**
 * Power Sensor Adapter
 * This file contains adapter functions to convert between SensorData and PowerSensor types
 */

import { SensorData } from '@/components/SensorCard';
import { PowerSensor, PowerSensorSaveResult } from '@/types/powerSensors';

/**
 * Convert SensorData to PowerSensor
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
    lastUpdated: sensorData.lastUpdated
  };
}

/**
 * Convert PowerSensor to SensorData
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