import { supabase } from '@/integrations/supabase/client';
import { TrackingObject, Device } from '@/types/sensors';
import { toast } from 'sonner';
import { safeQuery } from '@/utils/databaseUtils';

/**
 * Get all tracking objects from the database
 */
export const fetchTrackingObjects = async (): Promise<TrackingObject[]> => {
  try {
    // Get tracking objects from the database
    const result = await safeQuery<any[]>(
      async () => {
        // Use a query with columns we know exist
        const trackingResult = await supabase
          .from('tracking_objects')
          .select(`
            id,
            name,
            position,
            speed,
            direction,
            battery_level,
            last_updated,
            company_id,
            folder_id
          `);
        return trackingResult;
      },
      'fetchTrackingObjects'
    );

    // If there's an error or no data, return an empty array
    if (result.error || !result.data) {
      console.error('Error fetching tracking objects:', result.error);
      toast.error('Failed to load tracking objects from database');
      return [];
    }

    // Map the database results to TrackingObject format
    const trackingObjects: TrackingObject[] = result.data.map(item => {
      // Parse position from JSON if it's a string
      let position = { lat: 0, lng: 0 };
      if (item.position) {
        try {
          if (typeof item.position === 'string') {
            position = JSON.parse(item.position);
          } else if (typeof item.position === 'object') {
            position = {
              lat: item.position.lat || 0,
              lng: item.position.lng || 0
            };
          }
        } catch (error) {
          console.error('Error parsing position:', error);
        }
      }

      return {
        id: item.id,
        name: item.name,
        position: position,
        lastUpdated: item.last_updated ? new Date(item.last_updated).toLocaleString() : new Date().toLocaleString(),
        speed: typeof item.speed === 'number' ? item.speed : 0,
        direction: typeof item.direction === 'number' ? item.direction : 0,
        batteryLevel: typeof item.battery_level === 'number' ? item.battery_level : 100,
        folderId: item.folder_id || undefined
      };
    });

    return trackingObjects;
  } catch (error) {
    console.error('Error in fetchTrackingObjects:', error);
    toast.error('Failed to load tracking objects from database');
    return [];
  }
};

/**
 * Update a tracking object's position
 */
export const updateTrackingObjectPosition = async (
  trackingObjectId: string,
  position: { lat: number; lng: number },
  speed: number,
  direction: number,
  batteryLevel: number
): Promise<{ success: boolean; message: string }> => {
  try {
    // Update the tracking object in the database
    const result = await safeQuery(
      async () => {
        return await supabase
          .from('tracking_objects')
          .update({
            position: position,
            speed: speed,
            direction: direction,
            battery_level: batteryLevel,
            last_updated: new Date().toISOString()
          })
          .eq('id', trackingObjectId);
      },
      'updateTrackingObjectPosition'
    );

    return {
      success: !result.error,
      message: result.error
        ? `Failed to update tracking object position: ${result.error}`
        : 'Tracking object position updated successfully'
    };
  } catch (error) {
    console.error('Error in updateTrackingObjectPosition:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while updating the tracking object position'
    };
  }
};

/**
 * Map a device to a tracking object
 */
export const mapDeviceToTrackingObject = (device: Device): TrackingObject => {
  return {
    id: device.id,
    name: device.name,
    position: device.location || { lat: 0, lng: 0 },
    lastUpdated: device.lastUpdated || new Date().toLocaleString(),
    speed: 0,
    direction: 0,
    batteryLevel: 100,
    folderId: device.folderId
  };
};