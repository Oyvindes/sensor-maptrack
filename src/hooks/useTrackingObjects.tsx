
import { useState, useEffect, useCallback } from 'react';
import { Device, TrackingObject } from '@/types/sensors';
import { getMockDevices } from '@/services/device/mockDeviceData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTrackingObjects = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [trackingObjects, setTrackingObjects] = useState<TrackingObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Try to fetch from Supabase first
      const { data: trackingData, error } = await supabase
        .from('tracking_objects')
        .select('*');

      if (error) {
        console.error('Error fetching tracking objects from Supabase:', error);
        throw error;
      }

      if (trackingData && trackingData.length > 0) {
        // Convert Supabase data to TrackingObject format
        const formattedTrackingObjects = trackingData.map(item => ({
          id: item.id,
          name: item.name,
          position: {
            lat: typeof item.position === 'object' ? Number(item.position.lat) : 0,
            lng: typeof item.position === 'object' ? Number(item.position.lng) : 0
          },
          lastUpdated: item.last_updated ? new Date(item.last_updated).toLocaleString() : new Date().toLocaleString(),
          speed: Number(item.speed) || 0,
          direction: Number(item.direction) || 0,
          batteryLevel: Number(item.battery_level) || 100,
        }));
        setTrackingObjects(formattedTrackingObjects);

        // Convert to device format for backwards compatibility
        const deviceData = formattedTrackingObjects.map(obj => ({
          id: obj.id,
          name: obj.name,
          type: 'tracker',
          status: 'online',
          location: obj.position,
          companyId: trackingData.find(item => item.id === obj.id)?.company_id || 'system',
          lastUpdated: obj.lastUpdated
        }));
        setDevices(deviceData);
      } else {
        // Fall back to mock data if no data in Supabase
        console.log('No tracking objects found in database, using mock data');
        const mockDevices = getMockDevices();
        setDevices(mockDevices);
        
        // Convert mock devices to tracking objects
        const mockTrackingObjects = mockDevices.map(device => ({
          id: device.id,
          name: device.name,
          position: device.location || { lat: 0, lng: 0 },
          lastUpdated: device.lastUpdated || new Date().toLocaleString(),
          speed: 0,
          direction: 0,
          batteryLevel: 100
        }));
        setTrackingObjects(mockTrackingObjects);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast.error('Failed to load tracking data. Using mock data instead.');
      
      // Fall back to mock data
      const mockDevices = getMockDevices();
      setDevices(mockDevices);
      
      // Convert mock devices to tracking objects
      const mockTrackingObjects = mockDevices.map(device => ({
        id: device.id,
        name: device.name,
        position: device.location || { lat: 0, lng: 0 },
        lastUpdated: device.lastUpdated || new Date().toLocaleString(),
        speed: 0,
        direction: 0,
        batteryLevel: 100
      }));
      setTrackingObjects(mockTrackingObjects);
      
      setIsLoading(false);
    }
  }, []);

  // Function to update a tracking object in the database
  const updateTrackingObject = useCallback(async (updatedDevice: Device) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('tracking_objects')
        .update({
          name: updatedDevice.name,
          position: updatedDevice.location,
          last_updated: new Date().toISOString(),
          company_id: updatedDevice.companyId
        })
        .eq('id', updatedDevice.id);

      if (error) {
        console.error('Error updating tracking object:', error);
        toast.error('Failed to update tracking object');
        return false;
      }

      // Update local state
      await fetchData();
      toast.success('Tracking object updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateTrackingObject:', error);
      toast.error('Failed to update tracking object');
      return false;
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    // Set up real-time subscription for tracking objects
    const channel = supabase
      .channel('tracking_objects_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tracking_objects' }, 
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchData(); // Refresh data when changes occur
        }
      )
      .subscribe();

    // Simulate real-time updates every 30 seconds for demo purposes
    const interval = setInterval(() => {
      setTrackingObjects(prev => 
        prev.map(obj => ({
          ...obj,
          speed: Math.random() > 0.7 ? Math.floor(Math.random() * 60) : obj.speed,
          batteryLevel: obj.batteryLevel > 0 ? Math.max(obj.batteryLevel - 0.1, 0) : 0,
          lastUpdated: new Date().toLocaleString()
        }))
      );
    }, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Handle object selection (for display purposes)
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
    handleObjectSelect
  };
};
