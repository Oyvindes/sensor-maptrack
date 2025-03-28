import { useState, useEffect, useCallback } from 'react';
import { Device, TrackingObject } from '@/types/sensors';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fetchDevices, fetchTrackingObjects, updateTrackingObjectPosition, saveDevice, deleteDevice } from '@/services/sensorService';

export const useTrackingObjects = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [trackingObjects, setTrackingObjects] = useState<TrackingObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Use the Supabase services to fetch data
      const [devicesData, trackingData] = await Promise.all([
        fetchDevices(),
        fetchTrackingObjects()
      ]);
      
      setDevices(devicesData);
      setTrackingObjects(trackingData);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast.error('Failed to load tracking data');
      
      setTrackingObjects([]);
      setDevices([]);
      setIsLoading(false);
    }
  }, []);

  const updateTrackingObject = useCallback(async (updatedDevice: Device) => {
    try {
      // Save the device first
      const result = await saveDevice(updatedDevice);

      if (!result.success) {
        toast.error('Failed to update device');
        return false;
      }

      // Then update the tracking object position if location is provided
      if (updatedDevice.location) {
        const positionResult = await updateTrackingObjectPosition(
          updatedDevice.id,
          updatedDevice.location,
          0, // Default speed
          0, // Default direction
          100 // Default battery level
        );

        if (!positionResult.success) {
          toast.error('Failed to update tracking object position');
          return false;
        }
      }

      await fetchData();
      toast.success('Tracking object updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateTrackingObject:', error);
      toast.error('Failed to update tracking object');
      return false;
    }
  }, [fetchData]);

  const deleteTrackingObject = useCallback(async (deviceId: string) => {
    try {
      // First check if the device exists
      const deviceExists = devices.some(device => device.id === deviceId) ||
                          trackingObjects.some(obj => obj.id === deviceId);
      
      if (!deviceExists) {
        toast.error('Device not found. It may have been deleted already.');
        return false;
      }
      
      const result = await deleteDevice(deviceId);

      if (!result.success) {
        toast.error(`Failed to delete device: ${result.message}`);
        return false;
      }

      await fetchData();
      toast.success('Tracking object deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteTrackingObject:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to delete tracking object: ${errorMessage}`);
      return false;
    }
  }, [fetchData, devices, trackingObjects]);

  useEffect(() => {
    fetchData();

    // Set up real-time subscription for tracking objects
    const channel = supabase
      .channel('tracking_objects_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'devices' },
        (payload) => {
          console.log('Real-time update received for devices:', payload);
          fetchData();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'device_positions' },
        (payload) => {
          console.log('Real-time update received for device positions:', payload);
          fetchData();
        }
      )
      .subscribe();
      
    // Listen for the custom device-updated event
    const handleDeviceUpdated = () => {
      console.log('Device updated event received, refreshing data...');
      fetchData();
    };
    
    window.addEventListener('device-updated', handleDeviceUpdated);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('device-updated', handleDeviceUpdated);
    };
  }, [fetchData]);

  const handleObjectSelect = useCallback((object: TrackingObject) => {
    toast.info(`${object.name} selected`, {
      description: `Speed: ${object.speed}mph, Battery: ${object.batteryLevel}%`,
      duration: 3000
    });
  }, []);

  return {
    devices,
    trackingObjects,
    isLoading,
    updateTrackingObject,
    deleteTrackingObject,
    handleObjectSelect,
    fetchData  // Export the fetchData function so it can be called from outside
  };
};
