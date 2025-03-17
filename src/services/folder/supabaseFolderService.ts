
import { supabase } from "@/integrations/supabase/client";
import { SensorFolder } from "@/types/users";
import { toast } from "sonner";
import { mapCompanyIdToUUID } from "@/utils/uuidUtils";

/**
 * Get all sensor folders from the database
 */
export const fetchSensorFolders = async (): Promise<SensorFolder[]> => {
  try {
    const { data: folders, error } = await supabase
      .from('sensor_folders')
      .select(`
        id, 
        name, 
        description,
        status,
        company_id,
        created_at,
        updated_at,
        location,
        address,
        project_number
      `);

    if (error) throw error;

    // Get all folder sensors relationships
    const { data: folderSensors, error: sensorsError } = await supabase
      .from('folder_sensors')
      .select(`
        id,
        folder_id,
        sensor_imei
      `);

    if (sensorsError) throw sensorsError;

    // Map database results to SensorFolder format
    return folders.map(folder => {
      // Find assigned sensors for this folder
      const assignedSensors = folderSensors
        .filter(fs => fs.folder_id === folder.id)
        .map(fs => fs.sensor_imei);

      return {
        id: folder.id,
        name: folder.name,
        description: folder.description || '',
        status: folder.status === 'running' ? 'running' : 'stopped',
        companyId: folder.company_id || '',
        createdAt: new Date(folder.created_at).toISOString().split('T')[0],
        address: folder.address || '',
        projectNumber: folder.project_number || '',
        location: folder.location ? folder.location : undefined,
        assignedSensorIds: assignedSensors
      };
    });
  } catch (error) {
    console.error("Error fetching sensor folders:", error);
    toast.error("Failed to load projects");
    return [];
  }
};

/**
 * Create a new sensor folder in the database
 */
export const createNewSensorFolder = async (folderData: Omit<SensorFolder, "id" | "createdAt">): Promise<SensorFolder | null> => {
  try {
    // Map client-side IDs to database UUIDs if needed
    const companyId = folderData.companyId ? mapCompanyIdToUUID(folderData.companyId) : null;
    
    // Prepare folder data for insert
    const insertData = {
      name: folderData.name,
      description: folderData.description,
      status: folderData.status || 'stopped',
      company_id: companyId,
      project_number: folderData.projectNumber,
      address: folderData.address,
      location: folderData.location || null
    };

    // Insert folder record
    const { data: newFolder, error } = await supabase
      .from('sensor_folders')
      .insert(insertData)
      .select('id')
      .single();

    if (error) throw error;

    // Add sensor assignments if provided
    if (folderData.assignedSensorIds && folderData.assignedSensorIds.length > 0) {
      const sensorInserts = folderData.assignedSensorIds.map(sensorId => ({
        folder_id: newFolder.id,
        sensor_imei: sensorId
      }));

      const { error: sensorsError } = await supabase
        .from('folder_sensors')
        .insert(sensorInserts);

      if (sensorsError) throw sensorsError;
    }

    // Return the created folder
    return {
      ...folderData,
      id: newFolder.id,
      createdAt: new Date().toISOString().split('T')[0]
    };
  } catch (error) {
    console.error("Error creating sensor folder:", error);
    toast.error("Failed to create project");
    return null;
  }
};

/**
 * Update an existing sensor folder in the database
 */
export const updateExistingSensorFolder = async (
  folderId: string, 
  updates: Partial<SensorFolder>
): Promise<boolean> => {
  try {
    // Map client-side IDs to database UUIDs if needed
    const companyId = updates.companyId ? mapCompanyIdToUUID(updates.companyId) : undefined;
    
    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (companyId !== undefined) updateData.company_id = companyId;
    if (updates.projectNumber !== undefined) updateData.project_number = updates.projectNumber;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.location !== undefined) updateData.location = updates.location;

    // Update folder record
    const { error } = await supabase
      .from('sensor_folders')
      .update(updateData)
      .eq('id', folderId);

    if (error) throw error;

    // Handle sensor assignments if provided
    if (updates.assignedSensorIds !== undefined) {
      // First, remove existing assignments
      const { error: deleteError } = await supabase
        .from('folder_sensors')
        .delete()
        .eq('folder_id', folderId);

      if (deleteError) throw deleteError;

      // Then, add new assignments
      if (updates.assignedSensorIds.length > 0) {
        const sensorInserts = updates.assignedSensorIds.map(sensorId => ({
          folder_id: folderId,
          sensor_imei: sensorId
        }));

        const { error: insertError } = await supabase
          .from('folder_sensors')
          .insert(sensorInserts);

        if (insertError) throw insertError;
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating sensor folder:", error);
    toast.error("Failed to update project");
    return false;
  }
};

/**
 * Delete a sensor folder from the database
 */
export const deleteProject = async (folderId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // First, delete all sensor assignments for this folder
    const { error: sensorError } = await supabase
      .from('folder_sensors')
      .delete()
      .eq('folder_id', folderId);

    if (sensorError) throw sensorError;

    // Then, delete the folder
    const { error } = await supabase
      .from('sensor_folders')
      .delete()
      .eq('id', folderId);

    if (error) throw error;

    return {
      success: true,
      message: "Project deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting sensor folder:", error);
    return {
      success: false,
      message: `Failed to delete project: ${error.message}`
    };
  }
};

// For backward compatibility
export const deleteSensorFolder = deleteProject;

// Save sensor folder (handles both create and update)
export const saveSensorFolder = async (
  folder: SensorFolder
): Promise<{ success: boolean; data?: SensorFolder; message: string }> => {
  try {
    // Check if this is a new folder or an update to an existing one
    const isNewFolder = folder.id.startsWith('temp-');
    
    if (isNewFolder) {
      // This is a new folder, so create it
      const newFolder = await createNewSensorFolder(folder);
      
      if (!newFolder) {
        throw new Error('Failed to create new project');
      }
      
      return {
        success: true,
        data: newFolder,
        message: 'Project created successfully'
      };
    } else {
      // This is an existing folder, so update it
      const success = await updateExistingSensorFolder(folder.id, folder);
      
      if (!success) {
        throw new Error('Failed to update project');
      }
      
      return {
        success: true,
        message: 'Project updated successfully'
      };
    }
  } catch (error) {
    console.error('Error saving sensor folder:', error);
    return {
      success: false,
      message: `Error saving project: ${error.message}`
    };
  }
};

// Update project status
export const updateProjectStatus = async (
  projectId: string,
  status: 'running' | 'stopped'
): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase
      .from('sensor_folders')
      .update({ status })
      .eq('id', projectId);
      
    if (error) throw error;
    
    return {
      success: true,
      message: `Project status updated to ${status}`
    };
  } catch (error) {
    console.error('Error updating project status:', error);
    return {
      success: false,
      message: `Failed to update project status: ${error.message}`
    };
  }
};
