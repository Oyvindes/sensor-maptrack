import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  PowerSensor, 
  PowerStatus, 
  PowerToggleResult 
} from '@/types/powerSensors';
import { REFRESH_INTERVALS } from '@/config/powerSensorConfig';
import { 
  fetchPowerStatus, 
  togglePower 
} from '@/services/sensor/powerSensorService';
import { getCurrentUser } from '@/services/authService';

/**
 * Custom hook for managing power sensor status and control
 * @param deviceId The ID of the power sensor
 * @param deviceName The name of the power sensor (for toast messages)
 * @returns Object containing power sensor status and control functions
 */
export function usePowerSensor(deviceId: string, deviceName: string) {
  const [deviceStatus, setDeviceStatus] = useState<PowerStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toggling, setToggling] = useState<boolean>(false);

  // Load device status
  const loadDeviceStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status = await fetchPowerStatus(deviceId);
      setDeviceStatus(status);
    } catch (error) {
      console.error('Error loading device status:', error);
      toast.error('Failed to load device status');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  // Toggle power state
  const handleTogglePower = useCallback(async (): Promise<PowerToggleResult> => {
    try {
      setToggling(true);
      
      // Get the current user
      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast.error('You must be logged in to control devices');
        return {
          success: false,
          status: null,
          message: 'You must be logged in to control devices'
        };
      }
      
      // Toggle the power state
      const result = await togglePower(deviceId, currentUser.id);
      
      if (result.success) {
        setDeviceStatus(result.status);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      
      return result;
    } catch (error) {
      console.error('Error toggling device power:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle device power';
      toast.error(errorMessage);
      
      return {
        success: false,
        status: null,
        message: errorMessage
      };
    } finally {
      setToggling(false);
    }
  }, [deviceId]);

  // Determine connection status
  const getConnectionStatus = useCallback(() => {
    if (!deviceStatus) {
      return 'unknown';
    }
    
    if (!deviceStatus.updated_at) {
      return 'unknown';
    }
    
    const lastUpdateTime = new Date(deviceStatus.updated_at).getTime();
    const currentTime = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    return lastUpdateTime > currentTime - fiveMinutesInMs 
      ? 'connected' 
      : 'disconnected';
  }, [deviceStatus]);

  // Load status when component mounts or deviceId changes
  useEffect(() => {
    loadDeviceStatus();
    
    // Set up auto-refresh
    const interval = setInterval(loadDeviceStatus, REFRESH_INTERVALS.POWER_STATUS);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [deviceId, loadDeviceStatus]);

  return {
    deviceStatus,
    loading,
    toggling,
    connectionStatus: getConnectionStatus(),
    loadDeviceStatus,
    togglePower: handleTogglePower
  };
}