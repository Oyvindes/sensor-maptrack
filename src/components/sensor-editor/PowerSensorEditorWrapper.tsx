import React from 'react';
import { SensorData } from '@/components/SensorCard';
import { Company } from '@/types/users';
import { PowerSensor } from '@/types/powerSensors';
import PowerSensorEditor from './PowerSensorEditor';
import { sensorDataToPowerSensor, powerSensorToSensorData } from '@/services/sensor/powerSensorAdapter';

interface PowerSensorEditorWrapperProps {
  sensor: SensorData & { folderId?: string; companyId?: string; imei?: string };
  companies: Company[];
  onSave: (sensor: SensorData & { folderId?: string; companyId?: string; imei?: string }) => void;
  onCancel: () => void;
}

/**
 * Wrapper component for PowerSensorEditor that handles type conversion
 * between SensorData and PowerSensor types
 */
const PowerSensorEditorWrapper: React.FC<PowerSensorEditorWrapperProps> = ({
  sensor,
  companies,
  onSave,
  onCancel
}) => {
  // Convert SensorData to PowerSensor
  const powerSensor: PowerSensor = {
    id: sensor.id,
    name: sensor.name,
    imei: sensor.imei || '',
    status: sensor.status as 'online' | 'offline' | 'warning',
    companyId: sensor.companyId,
    folderId: sensor.folderId,
    lastUpdated: sensor.lastUpdated
  };

  // Handle save by converting PowerSensor back to SensorData
  const handleSave = (updatedPowerSensor: PowerSensor) => {
    const updatedSensorData: SensorData & { folderId?: string; companyId?: string; imei?: string } = {
      ...sensor, // Keep any existing properties
      id: updatedPowerSensor.id,
      name: updatedPowerSensor.name,
      imei: updatedPowerSensor.imei,
      status: updatedPowerSensor.status,
      lastUpdated: updatedPowerSensor.lastUpdated,
      companyId: updatedPowerSensor.companyId,
      folderId: updatedPowerSensor.folderId,
      sensorType: 'power'
    };
    
    onSave(updatedSensorData);
  };

  return (
    <PowerSensorEditor
      sensor={powerSensor}
      companies={companies}
      onSave={handleSave}
      onCancel={onCancel}
    />
  );
};

export default PowerSensorEditorWrapper;