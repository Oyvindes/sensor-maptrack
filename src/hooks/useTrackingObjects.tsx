import { useState, useEffect, useCallback } from 'react';
import { Device, TrackingObject, Location } from '@/types/sensors';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';
import { isValidUUID } from '@/utils/uuidUtils';
import { companyService } from '@/services/company';

export const useTrackingObjects = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [trackingObjects, setTrackingObjects] = useState<TrackingObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const parsePosition = (position: Json | null): Location => {
    if (!position) return { lat: 0, lng: 0 };
    
    try {
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
      setIsLoading(true);
      
      const { data: trackingData, error } = await supabase
        .from('tracking_objects')
        .select('*');

      if (error) {
        console.error('Error fetching tracking objects from Supabase:', error);
        throw error;
      }

      if (trackingData && trackingData.length > 0) {
        const formattedTrackingObjects = trackingData.map(item => ({
          id: item.id,
          name: item.name,
          position: parsePosition(item.position),
          lastUpdated: item.last_updated ? new Date(item.last_updated).toLocaleString() : new Date().toLocaleString(),
          speed: typeof item.speed === 'number' ? item.speed : 0,
          direction: typeof item.direction === 'number' ? item.direction : 0,
          batteryLevel: typeof item.battery_level === 'number' ? item.battery_level : 100,
          folderId: (item as any).folder_id || undefined,
        }));
        setTrackingObjects(formattedTrackingObjects);

        const deviceData: Device[] = formattedTrackingObjects.map(obj => ({
          id: obj.id,
          name: obj.name,
          type: 'tracker',
          status: 'online' as const,
          location: obj.position,
          companyId: 'system',
          lastUpdated: obj.lastUpdated,
          folderId: obj.folderId
        }));
        
        deviceData.forEach((device, index) => {
          const trackingItem = trackingData[index];
          if (trackingItem && trackingItem.company_id) {
            device.companyId = trackingItem.company_id;
          }
        });
        
        setDevices(deviceData);
      } else {
        setTrackingObjects([]);
        setDevices([]);
        console.log('No tracking objects found in database');
      }
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
      const position: Record<string, number> = {
        lat: updatedDevice.location?.lat || 0,
        lng: updatedDevice.location?.lng || 0
      };

      const isNewDevice = !isValidUUID(updatedDevice.id);
      let companyIdForDb = null;

      if (updatedDevice.companyId) {
        try {
          // Import the mapCompanyIdToUUID function
          const { mapCompanyIdToUUID } = await import('@/utils/uuidUtils');
          
          // Try to map the company ID to a UUID
          const mappedId = mapCompanyIdToUUID(updatedDevice.companyId);
          
          if (mappedId) {
            // Verify the company exists
            const exists = await companyService.exists(mappedId);
            if (exists) {
              companyIdForDb = mappedId;
            } else {
              toast.error('Invalid company ID - company does not exist');
              return false;
            }
          } else if (isValidUUID(updatedDevice.companyId)) {
            // If it's already a UUID but not in our mapping, verify it exists
            const exists = await companyService.exists(updatedDevice.companyId);
            if (exists) {
              companyIdForDb = updatedDevice.companyId;
            } else {
              toast.error('Invalid company ID - company does not exist');
              return false;
            }
          }
        } catch (error) {
          console.error('Error validating company:', error);
          toast.error('Failed to validate company');
          return false;
        }
      }
      console.log(`Processing company ID: ${updatedDevice.companyId} -> ${companyIdForDb}`);
      
      let result;
      
      if (isNewDevice) {
        const insertData: any = {
          name: updatedDevice.name,
          position: position,
          last_updated: new Date().toISOString(),
          battery_level: 100,
          speed: 0,
          direction: 0
        };
        
        if (companyIdForDb) {
          insertData.company_id = companyIdForDb;
        }
        
        if (updatedDevice.folderId) {
          insertData.folder_id = updatedDevice.folderId;
        }
        
        result = await supabase
          .from('tracking_objects')
          .insert(insertData)
          .select('id')
          .single();
      } else {
        const updateData: any = {
          name: updatedDevice.name,
          position: position,
          last_updated: new Date().toISOString(),
        };
        
        if (companyIdForDb) {
          updateData.company_id = companyIdForDb;
        }
        
        if (updatedDevice.folderId) {
          updateData.folder_id = updatedDevice.folderId;
        }
        
        result = await supabase
          .from('tracking_objects')
          .update(updateData)
          .eq('id', updatedDevice.id);
      }

      if (result.error) {
        console.error('Error updating tracking object:', result.error);
        toast.error('Failed to update tracking object');
        return false;
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
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!uuidPattern.test(deviceId)) {
        console.error('Invalid UUID format for deviceId:', deviceId);
        toast.error('Cannot delete: Invalid device ID format');
        return false;
      }
      
      const { error } = await supabase
        .from('tracking_objects')
        .delete()
        .eq('id', deviceId);

      if (error) {
        console.error('Error deleting tracking object:', error);
        toast.error('Failed to delete tracking object');
        return false;
      }

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

    const channel = supabase
      .channel('tracking_objects_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tracking_objects' }, 
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchData();
        }
      )
      .subscribe();

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
