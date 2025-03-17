import { supabase } from '@/integrations/supabase/client';
import { Device, Location } from '@/types/sensors';
import { toast } from 'sonner';
import { safeQuery } from '@/utils/databaseUtils';
import { mapCompanyIdToUUIDSync, mapCompanyUUIDToId } from '@/utils/uuidUtils';
import { getCurrentUser } from '@/services/authService';

// Since row-level security has been disabled in the database,
// we don't need to do anything special here
const bypassRowLevelSecurity = async () => {
  return true;
};

/**
 * Get all devices from the database
 */
export const fetchDevices = async (): Promise<Device[]> => {
  try {
    // Try to bypass row-level security
    await bypassRowLevelSecurity();

    console.log('Fetching devices from database...');

    const result = await safeQuery<Device[]>(
      async () => {
        // Get devices with their latest values
        const devicesResult = await supabase
          .from('devices')
          .select(`
            id,
            name,
            type,
            status,
            company_id,
            last_seen,
            created_at,
            updated_at
          `);

        if (devicesResult.error) {
          console.error('Error fetching devices:', devicesResult.error);
          return { data: [], error: devicesResult.error };
        }

        // Process the data
        const devices = devicesResult.data || [];
        console.log('Raw devices from database:', devices);

        // Map the database results to Device format
        const formattedDevices: Device[] = devices.map((device) => {
          return {
            id: device.id,
            name: device.name,
            type: device.type,
            status: device.status as 'online' | 'offline' | 'maintenance' | 'warning',
            companyId: mapCompanyUUIDToId(device.company_id),
            lastUpdated: new Date(device.updated_at).toLocaleString(),
            lastSeen: device.last_seen ? new Date(device.last_seen).toLocaleString() : undefined,
            createdAt: new Date(device.created_at).toLocaleString()
          };
        });

        console.log('Formatted devices:', formattedDevices);
        return { data: formattedDevices, error: null };
      },
      'fetchDevices'
    );

    if (result.error || !result.data) {
      console.error('Error fetching devices:', result.error);
      toast.error('Failed to load devices from database');
      return [];
    }

    console.log('Returning devices:', result.data);
    return result.data;
  } catch (error) {
    console.error('Unexpected error in fetchDevices:', error);
    toast.error('Failed to load devices from database');
    return [];
  }
};

/**
 * Save a device to the database
 */
export const saveDevice = async (
  device: Device
): Promise<{ success: boolean; data?: Device; message: string }> => {
  try {
    const isNewDevice = device.id.startsWith('temp-');

    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'You must be logged in to save a device'
      };
    }

    // Try to bypass row-level security
    await bypassRowLevelSecurity();
  
    // Prepare device data
    const deviceData = {
      name: device.name,
      type: device.type,
      status: device.status,
      company_id: device.companyId ? mapCompanyIdToUUIDSync(device.companyId) : null,
      updated_at: new Date().toISOString()
    };

    const result = await safeQuery<{ id: string }>(
      async () => {
        if (isNewDevice) {
          const insertData = {
            ...deviceData,
            created_at: new Date().toISOString()
          };
          
          console.log('Inserting device with data:', insertData);
          
          const insertResult = await supabase
            .from('devices')
            .insert(insertData)
            .select('id')
            .single();
            
          return insertResult;
        } else {
          const updateData = {
            ...deviceData
          };
          
          console.log('Updating device with data:', updateData);
          
          const updateResult = await supabase
            .from('devices')
            .update(updateData)
            .eq('id', device.id);
          
          return {
            data: { id: device.id },
            error: updateResult.error
          };
        }
      },
      `${isNewDevice ? 'create' : 'update'}Device`
    );

    if (result.error) {
      console.error('Error saving device:', result.error);
      
      // Check for row-level security policy violations
      if (result.error.includes('row-level security') || result.error.includes('violates row-level security policy')) {
        return {
          success: false,
          message: `Permission denied: You don't have permission to ${isNewDevice ? 'create' : 'update'} this device. Please check your company and user permissions.`
        };
      }
      
      return {
        success: false,
        message: `Failed to save device: ${result.error}`
      };
    }

    // For new devices, we need to make sure the ID is updated from temp-* to the actual UUID
    const updatedDevice = {
      ...device,
      id: result.data.id
    };
    
    // Log the created/updated device for debugging
    console.log(`Device ${isNewDevice ? 'created' : 'updated'} successfully:`, updatedDevice);
    
    // For new devices, create a tracking object entry
    if (isNewDevice) {
      try {
        console.log('Creating tracking object for new device:', updatedDevice);
        
        // Create a tracking object for the device
        const trackingResult = await supabase
          .from('tracking_objects')
          .insert({
            id: updatedDevice.id,
            name: updatedDevice.name,
            position: updatedDevice.location ? JSON.stringify(updatedDevice.location) : JSON.stringify({ lat: 0, lng: 0 }),
            speed: 0,
            direction: 0,
            battery_level: 100,
            last_updated: new Date().toISOString(),
            company_id: updatedDevice.companyId ? mapCompanyIdToUUIDSync(updatedDevice.companyId) : null,
            folder_id: updatedDevice.folderId
          })
          .select('id')
          .single();
          
        if (trackingResult.error) {
          console.error('Error creating tracking object:', trackingResult.error);
        } else {
          console.log('Tracking object created successfully:', trackingResult.data);
        }
      } catch (error) {
        console.error('Error creating tracking object:', error);
      }
    }
    
    // Force a refresh of the tracking objects list
    try {
      // This is a workaround to force the UI to refresh
      // In a real app, you would use a more elegant solution like a state management library
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('device-updated', { detail: updatedDevice }));
      }, 500);
    } catch (e) {
      console.error('Error dispatching device-updated event:', e);
    }
    
    return {
      success: true,
      data: updatedDevice,
      message: isNewDevice ? 'Device created successfully' : 'Device updated successfully'
    };
  } catch (error) {
    console.error('Unexpected error in saveDevice:', error);
    
    // Check if it's a row-level security error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('row-level security') || errorMessage.includes('violates row-level security policy')) {
      return {
        success: false,
        message: `Permission denied: You don't have permission to modify this device. Please check your company and user permissions.`
      };
    }
    
    return {
      success: false,
      message: `An unexpected error occurred while saving the device: ${errorMessage}`
    };
  }
};

/**
 * Delete a device from the database
 */
export const deleteDevice = async (
  deviceId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'You must be logged in to delete a device'
      };
    }

    // Try to bypass row-level security
    await bypassRowLevelSecurity();

    const result = await safeQuery(
      async () => {
        console.log('Deleting device with ID:', deviceId);
        
        // Delete the device
        return await supabase
          .from('devices')
          .delete()
          .eq('id', deviceId);
      },
      'deleteDevice'
    );

    if (result.error) {
      console.error('Error deleting device:', result.error);
      
      // Check for row-level security policy violations
      if (result.error.includes('row-level security') || result.error.includes('violates row-level security policy')) {
        return {
          success: false,
          message: `Permission denied: You don't have permission to delete this device. Please check your company and user permissions.`
        };
      }
      
      return {
        success: false,
        message: `Failed to delete device: ${result.error}`
      };
    }

    return {
      success: true,
      message: 'Device deleted successfully'
    };
  } catch (error) {
    console.error('Unexpected error in deleteDevice:', error);
    
    // Check if it's a row-level security error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('row-level security') || errorMessage.includes('violates row-level security policy')) {
      return {
        success: false,
        message: `Permission denied: You don't have permission to delete this device. Please check your company and user permissions.`
      };
    }
    
    return {
      success: false,
      message: `An unexpected error occurred while deleting the device: ${errorMessage}`
    };
  }
};
