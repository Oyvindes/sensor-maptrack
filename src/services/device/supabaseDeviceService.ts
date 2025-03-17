import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types/sensors';
import { toast } from 'sonner';
import { safeQuery } from '@/utils/databaseUtils';
import { mapCompanyIdToUUIDSync, mapCompanyUUIDToId } from '@/utils/uuidUtils';

/**
 * Get all devices from the database
 */
export const fetchDevices = async (): Promise<Device[]> => {
  try {
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

        return { data: formattedDevices, error: null };
      },
      'fetchDevices'
    );

    if (result.error || !result.data) {
      console.error('Error fetching devices:', result.error);
      toast.error('Failed to load devices from database');
      return [];
    }

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
          const insertResult = await supabase
            .from('devices')
            .insert({
              ...deviceData,
              created_at: new Date().toISOString()
            })
            .select('id')
            .single();
            
          return insertResult;
        } else {
          const updateResult = await supabase
            .from('devices')
            .update(deviceData)
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
      return {
        success: false,
        message: `Failed to save device: ${result.error}`
      };
    }

    return {
      success: true,
      data: {
        ...device,
        id: result.data.id
      },
      message: isNewDevice ? 'Device created successfully' : 'Device updated successfully'
    };
  } catch (error) {
    console.error('Unexpected error in saveDevice:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while saving the device'
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
    const result = await safeQuery(
      async () => {
        return await supabase
          .from('devices')
          .delete()
          .eq('id', deviceId);
      },
      'deleteDevice'
    );

    return {
      success: !result.error,
      message: result.error
        ? `Failed to delete device: ${result.error}`
        : 'Device deleted successfully'
    };
  } catch (error) {
    console.error('Unexpected error in deleteDevice:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while deleting the device'
    };
  }
};