
import { useState, useEffect, useCallback } from 'react';
import { Device, TrackingObject, Location } from '@/types/sensors';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export const useTrackingObjects = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [trackingObjects, setTrackingObjects] = useState<TrackingObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Supabase position JSON to our Location type
  const parsePosition = (position: Json | null): Location => {
    if (!position) return { lat: 0, lng: 0 };
    
    try {
      // Handle when position is an object with lat/lng properties
      if (typeof position === 'object' && position !== null && !Array.isArray(position)) {
        const posObj = position as Record<string, Json>;
        
        const lat = typeof posObj.lat === 'number' ? posObj.lat : 
                   typeof posObj.lat === 'string' ? parseFloat(posObj.lat) : 0;
        
        const lng = typeof posObj.lng === 'number' ? posObj.lng : 
                   typeof posObj.lng === 'string' ? parseFloat(posObj.lng) : 0;
                   
        return { lat, lng };
      }
    } catch (error) {
      console.error('Error parsing position:', error);
    }
    
    return { lat: 0, lng: 0 };
  };

  const fetchData = useCallback(async () => {
    try {
      // Fetch from Supabase
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
          position: parsePosition(item.position),
          lastUpdated: item.last_updated ? new Date(item.last_updated).toLocaleString() : new Date().toLocaleString(),
          speed: typeof item.speed === 'number' ? item.speed : 0,
          direction: typeof item.direction === 'number' ? item.direction : 0,
          batteryLevel: typeof item.battery_level === 'number' ? item.battery_level : 100,
        }));
        setTrackingObjects(formattedTrackingObjects);

        // Convert to device format for backwards compatibility
        const deviceData: Device[] = formattedTrackingObjects.map(obj => ({
          id: obj.id,
          name: obj.name,
          type: 'tracker',
          status: 'online' as const, // Use const assertion to match the union type
          location: obj.position,
          companyId: trackingData.find(item => item.id === obj.id)?.company_id || 'system',
          lastUpdated: obj.lastUpdated
        }));
        setDevices(deviceData);
      } else {
        // If no data, set empty arrays
        setTrackingObjects([]);
        setDevices([]);
        toast.info('No tracking objects found in database');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast.error('Failed to load tracking data');
      
      // Set empty arrays instead of falling back to mock data
      setTrackingObjects([]);
      setDevices([]);
      setIsLoading(false);
    }
  }, []);

  // Function to update a tracking object in the database
  const updateTrackingObject = useCallback(async (updatedDevice: Device) => {
    try {
      // Create a properly formatted position object for Supabase
      const position: Record<string, number> = {
        lat: updatedDevice.location?.lat || 0,
        lng: updatedDevice.location?.lng || 0
      };

      // Update in Supabase
      const { error } = await supabase
        .from('tracking_objects')
        .update({
          name: updatedDevice.name,
          position: position,
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

  // Function to delete a tracking object
  const deleteTrackingObject = useCallback(async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('tracking_objects')
        .delete()
        .eq('id', deviceId);

      if (error) {
        console.error('Error deleting tracking object:', error);
        toast.error('Failed to delete tracking object');
        return false;
      }

      // Update local state after successful deletion
      await fetchData();
      toast.success('Tracking object deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteTrackingObject:', error);
      toast.error('Failed to delete tracking object');
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
    deleteTrackingObject,
    handleObjectSelect
  };
};
