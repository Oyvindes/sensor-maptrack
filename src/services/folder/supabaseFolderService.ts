import { supabase } from "@/integrations/supabase/client";
import { SensorFolder } from "@/types/users";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { mapCompanyIdToUUID, isValidUUID } from "@/utils/uuidUtils";

/**
 * Fetch all sensor folders/projects from the database
 */
export const fetchSensorFolders = async (): Promise<SensorFolder[]> => {
  try {
    const { data, error } = await supabase
      .from('sensor_folders')
      .select(`
        id,
        name,
        description,
        address,
        location,
        company_id,
        project_number,
        status,
        created_at,
        updated_at
      `);

    if (error) throw error;

    // Fetch folder-sensor relationships
    const { data: folderSensors, error: relError } = await supabase
      .from('folder_sensors')
      .select('folder_id, sensor_imei');

    if (relError) throw relError;

    // Map the database results to SensorFolder format
    const formattedFolders: SensorFolder[] = data.map(folder => {
      // Find all sensors assigned to this folder
      const assignedSensorIds = folderSensors
        .filter(fs => fs.folder_id === folder.id)
        .map(fs => fs.sensor_imei);

      // Parse location if it's stored as a string or as JSON data
      let parsedLocation: { lat: number; lng: number } | string | undefined = undefined;
      
      if (folder.location) {
        if (typeof folder.location === 'string') {
          try {
            parsedLocation = JSON.parse(folder.location);
          } catch (e) {
            console.warn(`Error parsing location string for folder ${folder.id}:`, e);
            parsedLocation = folder.location;
          }
        } else if (typeof folder.location === 'object' && folder.location !== null) {
          // Convert Supabase JSONB to the correct type
          const locationObj = folder.location as Record<string, any>;
          
          if ('lat' in locationObj && 'lng' in locationObj) {
            parsedLocation = {
              lat: Number(locationObj.lat),
              lng: Number(locationObj.lng)
            };
          } else {
            console.warn(`Invalid location object format for folder ${folder.id}`);
            // Convert to a string representation instead of throwing it away
            parsedLocation = JSON.stringify(locationObj);
          }
        } else {
          console.warn(`Unexpected location type for folder ${folder.id}: ${typeof folder.location}`);
          parsedLocation = undefined;
        }
      }

      return {
        id: folder.id,
        name: folder.name,
        description: folder.description || "",
        address: folder.address || "",
        location: parsedLocation,
        companyId: folder.company_id,
        projectNumber: folder.project_number || "",
        status: folder.status as "running" | "stopped" || "stopped",
        createdAt: folder.created_at.split('T')[0],
        updatedAt: folder.updated_at.split('T')[0],
        assignedSensorIds: assignedSensorIds
      };
    });

    return formattedFolders;
  } catch (error) {
    console.error("Error fetching folders:", error);
    toast.error("Failed to load projects from database");
    return [];
  }
};

/**
 * Create or update a sensor folder/project in the database
 */
export const saveSensorFolder = async (
  folder: SensorFolder
): Promise<{ success: boolean; data?: SensorFolder; message: string }> => {
  try {
    // Check if folder exists
    const isNewFolder = folder.id.startsWith('folder-') && folder.id.includes('temp-') || 
                        folder.id.startsWith('temp-');
    
    // Convert location to proper format for database storage
    let locationForDb = folder.location;
    if (typeof folder.location === 'string' && folder.location.trim() !== '') {
      try {
        locationForDb = JSON.parse(folder.location);
      } catch (e) {
        console.warn(`Error parsing location string: ${e}`);
        // Keep as string if can't parse
      }
    }
    
    // Map company ID to UUID or keep as is if already valid UUID
    let mappedCompanyId = null;
    if (folder.companyId) {
      // Check if it's already a valid UUID
      if (isValidUUID(folder.companyId)) {
        mappedCompanyId = folder.companyId;
      } else {
        // Use the mapping function
        mappedCompanyId = mapCompanyIdToUUID(folder.companyId);
      }
      
      // Verify that we have a valid company ID
      if (!mappedCompanyId) {
        throw new Error("Invalid company ID. Please select a valid company.");
      }
    } else {
      // If no company ID is provided, use default
      mappedCompanyId = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'; // Acme Corporation's UUID
    }
    
    // Prepare folder data for insert/update
    const folderData = {
      name: folder.name,
      description: folder.description,
      address: folder.address,
      location: locationForDb,
      company_id: mappedCompanyId,
      project_number: folder.projectNumber,
      status: folder.status || 'stopped',
      updated_at: new Date().toISOString()
    };

    console.log("Saving folder with company_id:", folderData.company_id, "from original:", folder.companyId);

    // Verify the company exists in the database
    const { data: companyExists, error: companyCheckError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', mappedCompanyId)
      .single();
      
    if (companyCheckError || !companyExists) {
      console.error("Company not found in database:", companyCheckError);
      console.error("Attempted to use company ID:", mappedCompanyId);
      
      // Check if any companies exist at all
      const { data: allCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .limit(5);
        
      if (!companiesError && allCompanies && allCompanies.length > 0) {
        console.log("Available companies:", allCompanies);
        // Use the first available company as fallback
        folderData.company_id = allCompanies[0].id;
        console.log("Using fallback company:", allCompanies[0].name, "with ID:", allCompanies[0].id);
      } else {
        throw new Error(`No valid companies found in the database. Please contact an administrator.`);
      }
    } else {
      console.log("Verified company exists:", companyExists.name, "with ID:", companyExists.id);
    }

    let folderId = folder.id;

    // Handle folder record (insert or update)
    if (isNewFolder) {
      // Create new folder
      const { data, error } = await supabase
        .from('sensor_folders')
        .insert(folderData)
        .select('id, created_at')
        .single();

      if (error) {
        console.error("Error creating folder:", error);
        throw error;
      }
      folderId = data.id;
    } else {
      // Update existing folder
      const { error } = await supabase
        .from('sensor_folders')
        .update(folderData)
        .eq('id', folder.id);

      if (error) {
        console.error("Error updating folder:", error);
        throw error;
      }
    }

    // Handle assigned sensors (delete old relationships first)
    if (!isNewFolder) {
      const { error: deleteError } = await supabase
        .from('folder_sensors')
        .delete()
        .eq('folder_id', folderId);

      if (deleteError) throw deleteError;
    }

    // Insert new sensor relationships
    if (folder.assignedSensorIds && folder.assignedSensorIds.length > 0) {
      const sensorRelations = folder.assignedSensorIds.map(sensorId => ({
        folder_id: folderId,
        sensor_id: sensorId
      }));

      const { error: insertError } = await supabase
        .from('folder_sensors')
        .insert(sensorRelations);

      if (insertError) throw insertError;
    }

    // Also update the folder_id in the sensors table
    if (folder.assignedSensorIds && folder.assignedSensorIds.length > 0) {
      const { error: updateError } = await supabase
        .from('sensors')
        .update({ folder_id: folderId })
        .in('id', folder.assignedSensorIds);
      
      if (updateError) throw updateError;
    }

    // Get the final company ID that was used
    const actualCompanyId = folderData.company_id;

    // Return the updated folder with the real ID
    return {
      success: true,
      data: {
        ...folder,
        id: folderId,
        companyId: actualCompanyId // Update with the properly mapped company ID
      },
      message: isNewFolder 
        ? "Project created successfully" 
        : "Project updated successfully"
    };
  } catch (error) {
    console.error("Error saving folder:", error);
    return {
      success: false,
      message: `Failed to save project: ${error.message}`
    };
  }
};

/**
 * Update the status of a project
 */
export const updateProjectStatus = async (
  projectId: string,
  status: "running" | "stopped"
): Promise<{ success: boolean; message: string }> => {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('sensor_folders')
      .update(updateData)
      .eq('id', projectId);

    if (error) throw error;

    return {
      success: true,
      message: `Project status updated to ${status}`
    };
  } catch (error) {
    console.error("Error updating project status:", error);
    return {
      success: false,
      message: `Failed to update project status: ${error.message}`
    };
  }
};

/**
 * Delete a project and its folder-sensor relationships
 */
export const deleteProject = async (
  projectId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // First delete folder-sensor relationships
    const { error: deleteRelError } = await supabase
      .from('folder_sensors')
      .delete()
      .eq('folder_id', projectId);

    if (deleteRelError) throw deleteRelError;

    // Then delete the folder itself
    const { error } = await supabase
      .from('sensor_folders')
      .delete()
      .eq('id', projectId);

    if (error) throw error;

    return {
      success: true,
      message: "Project deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting project:", error);
    return {
      success: false,
      message: `Failed to delete project: ${error.message}`
    };
  }
};
