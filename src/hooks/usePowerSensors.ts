import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  PowerSensor, 
  PowerSensorSaveResult, 
  PowerSensorDeleteResult 
} from '@/types/powerSensors';
import { 
  fetchPowerSensors, 
  savePowerSensor, 
  deletePowerSensor 
} from '@/services/sensor/powerSensorService';
import {
  sensorDataArrayToPowerSensorArray,
  powerSensorToSensorData,
  sensorDataToPowerSensor,
  convertSaveResult
} from '@/services/sensor/powerSensorAdapter';
import { DEFAULTS } from '@/config/powerSensorConfig';

/**
 * Custom hook for managing power sensors
 * @returns Object containing power sensors and management functions
 */
export function usePowerSensors() {
  const [sensors, setSensors] = useState<PowerSensor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSensor, setSelectedSensor] = useState<PowerSensor | null>(null);
  const [editingSensor, setEditingSensor] = useState<PowerSensor | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Load power sensors
  const loadSensors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPowerSensors();
      const powerSensors = sensorDataArrayToPowerSensorArray(data);
      setSensors(powerSensors);
      
      // If we have sensors but no selected sensor, select the first one
      if (powerSensors.length > 0 && !selectedSensor) {
        setSelectedSensor(powerSensors[0]);
      }
    } catch (error) {
      console.error('Error loading power sensors:', error);
      toast.error('Failed to load power sensors');
    } finally {
      setLoading(false);
    }
  }, [selectedSensor]);

  // Create a new sensor template
  const createNewSensor = useCallback((): PowerSensor => {
    return {
      id: `sensor-${Date.now()}`,
      name: 'New Smart Plug',
      imei: '',
      status: DEFAULTS.STATUS,
      lastUpdated: new Date().toLocaleString()
    };
  }, []);

  // Start adding a new sensor
  const startAddNew = useCallback(() => {
    const newSensor = createNewSensor();
    setEditingSensor(newSensor);
    setIsAddingNew(true);
  }, [createNewSensor]);

  // Start editing a sensor
  const startEdit = useCallback((sensor: PowerSensor) => {
    setEditingSensor(sensor);
    setIsAddingNew(false);
  }, []);

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingSensor(null);
    setIsAddingNew(false);
  }, []);

  // Save a sensor
  const saveSensor = useCallback(async (sensor: PowerSensor): Promise<PowerSensorSaveResult> => {
    try {
      // Update the lastUpdated timestamp
      const updatedSensor = {
        ...sensor,
        lastUpdated: new Date().toLocaleString()
      };
      
      // Convert PowerSensor to SensorData for the service
      const sensorData = powerSensorToSensorData(updatedSensor);
      
      // Save the sensor
      const result = await savePowerSensor(sensorData);
      
      // Convert the result back to PowerSensorSaveResult
      const convertedResult = convertSaveResult(result);
      
      if (convertedResult.success) {
        toast.success(convertedResult.message);
        
        // Reload sensors to get the updated list
        await loadSensors();
        
        // If this was the selected sensor, update the selection
        if (selectedSensor && selectedSensor.id === sensor.id && convertedResult.data) {
          setSelectedSensor(convertedResult.data);
        }
        
        // Clear editing state
        setEditingSensor(null);
        setIsAddingNew(false);
      } else {
        toast.error(convertedResult.message);
      }
      
      return convertedResult;
    } catch (error) {
      console.error('Error saving power sensor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save power sensor';
      toast.error(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [loadSensors, selectedSensor]);

  // Delete a sensor
  const removeSensor = useCallback(async (sensor: PowerSensor): Promise<PowerSensorDeleteResult> => {
    try {
      setLoading(true);
      
      const result = await deletePowerSensor(sensor.id);
      
      if (result.success) {
        toast.success(result.message);
        
        // If the deleted sensor was selected, clear the selection
        if (selectedSensor && selectedSensor.id === sensor.id) {
          setSelectedSensor(null);
        }
        
        // Reload the sensors list
        await loadSensors();
      } else {
        toast.error(result.message);
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting power sensor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete power sensor';
      toast.error(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [loadSensors, selectedSensor]);

  // Select a sensor
  const selectSensor = useCallback((sensor: PowerSensor) => {
    setSelectedSensor(sensor);
  }, []);

  // Load sensors when component mounts
  useEffect(() => {
    loadSensors();
  }, [loadSensors]);

  return {
    sensors,
    loading,
    selectedSensor,
    editingSensor,
    isAddingNew,
    loadSensors,
    startAddNew,
    startEdit,
    cancelEdit,
    saveSensor,
    removeSensor,
    selectSensor
  };
}