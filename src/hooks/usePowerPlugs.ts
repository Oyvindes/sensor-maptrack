import { useState, useEffect, useCallback } from 'react';
import { PowerSensor, PowerSensorSaveResult } from '@/types/powerSensors';
import { toast } from 'sonner';
import { 
  fetchPowerSensors, 
  savePowerSensor, 
  deletePowerSensor 
} from '@/services/sensor/powerSensorService';
import { powerSensorToSensorData, sensorDataToPowerSensor } from '@/services/sensor/powerSensorAdapter';

/**
 * Custom hook for managing power plugs
 * Provides functionality for listing, adding, editing, and deleting power plugs
 */
export const usePowerPlugs = () => {
  const [sensors, setSensors] = useState<PowerSensor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<PowerSensor | null>(null);
  const [editingSensor, setEditingSensor] = useState<PowerSensor | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Load power sensors
  const loadSensors = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchPowerSensors();
      
      // Convert to PowerSensor type
      const powerSensors = response.map(sensorData => sensorDataToPowerSensor(sensorData));
      
      setSensors(powerSensors);
    } catch (err) {
      console.error('Error loading power plugs:', err);
      setError('Failed to load power plugs');
      toast.error('Failed to load power plugs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load sensors on mount
  useEffect(() => {
    loadSensors();
    
    // Listen for sensor updates
    const handleSensorUpdated = () => {
      loadSensors();
    };
    
    window.addEventListener('sensor-updated', handleSensorUpdated);
    
    return () => {
      window.removeEventListener('sensor-updated', handleSensorUpdated);
    };
  }, [loadSensors]);

  // Start adding a new sensor
  const startAddNew = useCallback(() => {
    const newSensor: PowerSensor = {
      id: `sensor-${Date.now()}`,
      name: 'New Power Plug',
      imei: '',
      status: 'offline',
      lastUpdated: new Date().toLocaleString()
    };
    
    setEditingSensor(newSensor);
    setIsAddingNew(true);
  }, []);

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
  const saveSensor = useCallback(async (sensor: PowerSensor) => {
    setLoading(true);
    
    try {
      // Convert to SensorData for the service
      const sensorData = powerSensorToSensorData(sensor);
      
      // Save the sensor
      const result = await savePowerSensor(sensorData);
      
      if (result.success) {
        // Convert the saved sensor back to PowerSensor
        const savedSensor = sensorDataToPowerSensor(result.data);
        
        // Update the sensors list
        setSensors(prev => {
          const index = prev.findIndex(s => s.id === savedSensor.id);
          
          if (index >= 0) {
            // Update existing sensor
            return [
              ...prev.slice(0, index),
              savedSensor,
              ...prev.slice(index + 1)
            ];
          } else {
            // Add new sensor
            return [...prev, savedSensor];
          }
        });
        
        // Reset editing state
        setEditingSensor(null);
        setIsAddingNew(false);
        
        // If this was the selected sensor, update it
        if (selectedSensor && selectedSensor.id === savedSensor.id) {
          setSelectedSensor(savedSensor);
        }
        
        toast.success('Power plug saved successfully');
      } else {
        toast.error(result.message || 'Failed to save power plug');
      }
    } catch (err) {
      console.error('Error saving power plug:', err);
      toast.error('Failed to save power plug');
    } finally {
      setLoading(false);
    }
  }, [selectedSensor]);

  // Remove a sensor
  const removeSensor = useCallback(async (sensor: PowerSensor) => {
    setLoading(true);
    
    try {
      // Delete the sensor using its ID
      const result = await deletePowerSensor(sensor.id);
      
      if (result.success) {
        // Remove from the sensors list
        setSensors(prev => prev.filter(s => s.id !== sensor.id));
        
        // If this was the selected sensor, clear it
        if (selectedSensor && selectedSensor.id === sensor.id) {
          setSelectedSensor(null);
        }
        
        toast.success('Power plug deleted successfully');
      } else {
        toast.error(result.message || 'Failed to delete power plug');
      }
    } catch (err) {
      console.error('Error deleting power plug:', err);
      toast.error('Failed to delete power plug');
    } finally {
      setLoading(false);
    }
  }, [selectedSensor]);

  // Select a sensor
  const selectSensor = useCallback((sensor: PowerSensor) => {
    setSelectedSensor(sensor);
  }, []);

  return {
    sensors,
    loading,
    error,
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
};