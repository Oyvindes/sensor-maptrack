import { supabase } from '@/integrations/supabase/client';
import { SensorFolder } from '@/types/users';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';
import { mapCompanyIdToUUID, isValidUUID } from '@/utils/uuidUtils';

/**
 * Fetch all sensor folders/projects from the database
 */
export const fetchSensorFolders = async (): Promise<SensorFolder[]> => {
  try {
    // Try to query with the creator columns, but handle the case where they don't exist
    let data;
    let error;
    
    try {
      // Try with creator columns
      const result = await supabase.from('sensor_folders').select(`
        id,
        name,
        description,
        address,
        location,
        company_id,
        project_number,
        status,
        created_at,
        updated_at,
        project_start_date,
        project_end_date,
        sensor_locations,
        sensor_zones,
        sensor_types,
        created_by,
        creator_name,
        pdf_records (
          id,
          filename,
          created_at,
          creator_name
        )
      `);
      
      data = result.data;
      error = result.error;
    } catch (e) {
      // If that fails, try without creator columns
      console.warn('Error querying with creator columns, trying without:', e);
      const result = await supabase.from('sensor_folders').select(`
        id,
        name,
        description,
        address,
        location,
        company_id,
        project_number,
        status,
        created_at,
        updated_at,
        project_start_date,
        project_end_date,
        sensor_locations,
        sensor_zones,
        sensor_types,
        pdf_records (
          id,
          filename,
          created_at,
          creator_name
        )
      `);
      
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    // Fetch folder-sensor relationships for regular sensors
    const { data: folderSensors, error: relError } = await supabase
      .from('folder_sensors')
      .select('folder_id, sensor_imei');

    if (relError) throw relError;
    
    // Fetch power plugs with folder_id set
    const { data: folderPowerPlugs, error: powerPlugsError } = await supabase
      .from('power_sensors')
      .select('id, imei, folder_id')
      .not('folder_id', 'is', null);
      
    if (powerPlugsError) {
      console.warn('Error fetching power plugs with folder assignments:', powerPlugsError);
      // Continue even if there's an error fetching power plugs
    }

    // Map the database results to SensorFolder format
    const formattedFolders: SensorFolder[] = data.map((folder: any) => {
      // Find all regular sensors assigned to this folder
      const assignedSensorImeis = folderSensors
        .filter((fs) => fs.folder_id === folder.id)
        .map((fs) => fs.sensor_imei);
        
      // Find all power plugs assigned to this folder
      const assignedPowerPlugImeis = folderPowerPlugs
        ? folderPowerPlugs
            .filter((pp) => pp.folder_id === folder.id)
            .map((pp) => pp.imei)
        : [];
        
      // Combine regular sensors and power plugs
      const allAssignedImeis = [...assignedSensorImeis, ...assignedPowerPlugImeis];
      
      // Handle case where created_by and creator_name might not exist yet
      const createdBy = 'created_by' in folder ? folder.created_by : '';
      const creatorName = 'creator_name' in folder ? folder.creator_name : '';

      // Parse location if it's stored as a string or as JSON data
      let parsedLocation:
        | { lat: number; lng: number }
        | string
        | undefined = undefined;

      if (folder.location) {
        if (typeof folder.location === 'string') {
          try {
            parsedLocation = JSON.parse(folder.location);
          } catch (e) {
            console.warn(
              `Error parsing location string for folder ${folder.id}:`,
              e
            );
            parsedLocation = folder.location;
          }
        } else if (
          typeof folder.location === 'object' &&
          folder.location !== null
        ) {
          // Convert Supabase JSONB to the correct type
          const locationObj = folder.location as Record<string, any>;

          if ('lat' in locationObj && 'lng' in locationObj) {
            parsedLocation = {
              lat: Number(locationObj.lat),
              lng: Number(locationObj.lng)
            };
          } else {
            console.warn(
              `Invalid location object format for folder ${folder.id}`
            );
            // Convert to a string representation instead of throwing it away
            parsedLocation = JSON.stringify(locationObj);
          }
        } else {
          console.warn(
            `Unexpected location type for folder ${
              folder.id
            }: ${typeof folder.location}`
          );
          parsedLocation = undefined;
        }
      }

      // Map PDF records
      const pdfHistory = folder.pdf_records?.map((record: any) => ({
        id: record.id,
        filename: record.filename,
        createdAt: record.created_at,
        creatorName: record.creator_name
      })) || [];

      return {
        id: folder.id,
        name: folder.name,
        description: folder.description || '',
        address: folder.address || '',
        location: parsedLocation,
        companyId: folder.company_id,
        projectNumber: folder.project_number || '',
        status: (folder.status as 'running' | 'stopped') || 'stopped',
        createdAt: folder.created_at.split('T')[0],
        updatedAt: folder.updated_at.split('T')[0],
        // Preserve the full ISO string with time information
        projectStartDate: folder.project_start_date || '',
        projectEndDate: folder.project_end_date || '',
        assignedSensorImeis: allAssignedImeis,
        sensorLocations: folder.sensor_locations || {},
        sensorZones: folder.sensor_zones || {},
        sensorTypes: folder.sensor_types || {},
        createdBy: createdBy,
        creatorName: creatorName,
        pdfHistory
      };
    });

    return formattedFolders;
  } catch (error) {
    console.error('Error fetching folders:', error);
    toast.error('Failed to load projects from database');
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
    const isNewFolder =
      (folder.id.startsWith('folder-') && folder.id.includes('temp-')) ||
      folder.id.startsWith('temp-');

    // Convert location to proper format for database storage
    let locationForDb = folder.location;
    if (
      typeof folder.location === 'string' &&
      folder.location.trim() !== ''
    ) {
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
        throw new Error(
          'Invalid company ID. Please select a valid company.'
        );
      }
    } else {
      // If no company ID is provided, use default
      mappedCompanyId = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'; // Acme Corporation's UUID
    }

    // Prepare folder data for insert/update
    const folderData: Record<string, any> = {
      name: folder.name,
      description: folder.description,
      address: folder.address,
      location: locationForDb,
      company_id: mappedCompanyId,
      project_number: folder.projectNumber,
      // Ensure we're saving the full ISO string with time information
      project_start_date: folder.projectStartDate || null,
      project_end_date: folder.projectEndDate || null,
      status: folder.status || 'stopped',
      updated_at: new Date().toISOString(),
      sensor_locations: folder.sensorLocations || {},
      sensor_zones: folder.sensorZones || {},
      sensor_types: folder.sensorTypes || {}
    };
    
    // Only add creator fields if they exist in the folder object and are valid UUIDs
    if (folder.createdBy) {
      // Check if it's a valid UUID before adding it
      if (isValidUUID(folder.createdBy)) {
        folderData.created_by = folder.createdBy;
      } else {
        console.warn(`Invalid UUID format for createdBy: ${folder.createdBy}, skipping this field`);
        // Don't add the invalid UUID to avoid database errors
      }
    }
    
    if (folder.creatorName) {
      folderData.creator_name = folder.creatorName;
    }

    // Verify the company exists in the database
    const { data: companyExists, error: companyCheckError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', mappedCompanyId)
      .single();

    if (companyCheckError || !companyExists) {
      console.error('Company not found in database:', companyCheckError);
      console.error('Attempted to use company ID:', mappedCompanyId);

      // Check if any companies exist at all
      const { data: allCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .limit(5);

      if (!companiesError && allCompanies && allCompanies.length > 0) {
        console.log('Available companies:', allCompanies);
        // Use the first available company as fallback
        folderData.company_id = allCompanies[0].id;
        console.log(
          'Using fallback company:',
          allCompanies[0].name,
          'with ID:',
          allCompanies[0].id
        );
      } else {
        throw new Error(
          `No valid companies found in the database. Please contact an administrator.`
        );
      }
    }

    let folderId = folder.id;

    // Handle folder record (insert or update)
    if (isNewFolder) {
      // Create new folder
      const { data, error } = await supabase
        .from('sensor_folders')
        .insert(folderData)
        .select(`
          id, 
          created_at,
          pdf_records (
            id,
            filename,
            created_at,
            creator_name
          )
        `)
        .single();

      if (error) {
        console.error('Error creating folder:', error);
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
        console.error('Error updating folder:', error);
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
    if (
      folder.assignedSensorImeis &&
      folder.assignedSensorImeis.length > 0
    ) {
      // First, we need to separate regular sensors from power plugs
      // Query the power_sensors table to get all power plug IMEIs
      const { data: powerPlugs, error: powerPlugsError } = await supabase
        .from('power_sensors')
        .select('imei')
        .in('imei', folder.assignedSensorImeis);
      
      if (powerPlugsError) {
        console.warn('Error fetching power plugs:', powerPlugsError);
        // Continue with the process even if we can't fetch power plugs
      }
      
      // Create a set of power plug IMEIs for quick lookup
      const powerPlugImeis = new Set(powerPlugs?.map(plug => plug.imei) || []);
      
      // Filter out regular sensors (those not in the power plugs set)
      const regularSensorImeis = folder.assignedSensorImeis.filter(
        imei => !powerPlugImeis.has(imei)
      );
      
      // Only insert regular sensors into folder_sensors table
      if (regularSensorImeis.length > 0) {
        const sensorRelations = regularSensorImeis.map(
          (sensorImei) => ({
            folder_id: folderId,
            sensor_imei: sensorImei
          })
        );
  
        const { error: insertError } = await supabase
          .from('folder_sensors')
          .insert(sensorRelations);
  
        if (insertError) {
          console.error('Error inserting sensor relations:', insertError);
          throw insertError;
        }
      }
      
      // For power plugs, we need to handle them differently
      // We could create a new table for folder_power_plugs or modify the database schema
      // For now, let's log that we're skipping power plugs in the folder_sensors table
      if (powerPlugImeis.size > 0) {
        console.log(`Skipping ${powerPlugImeis.size} power plugs for folder_sensors table due to foreign key constraint`);
        // TODO: Implement proper handling of power plugs in folders
      }
    }

    // Also update the folder_id in the sensors and power_sensors tables
    if (
      folder.assignedSensorImeis &&
      folder.assignedSensorImeis.length > 0
    ) {
      // Query the power_sensors table to get all power plug IMEIs
      const { data: powerPlugs, error: powerPlugsError } = await supabase
        .from('power_sensors')
        .select('imei')
        .in('imei', folder.assignedSensorImeis);
      
      if (powerPlugsError) {
        console.warn('Error fetching power plugs for update:', powerPlugsError);
        // Continue with the process even if we can't fetch power plugs
      }
      
      // Create a set of power plug IMEIs for quick lookup
      const powerPlugImeis = new Set(powerPlugs?.map(plug => plug.imei) || []);
      
      // Filter out regular sensors (those not in the power plugs set)
      const regularSensorImeis = folder.assignedSensorImeis.filter(
        imei => !powerPlugImeis.has(imei)
      );
      const powerPlugImeiArray = Array.from(powerPlugImeis);
      
      // Update regular sensors
      if (regularSensorImeis.length > 0) {
        const { error: updateSensorsError } = await supabase
          .from('sensors')
          .update({ folder_id: folderId })
          .in('imei', regularSensorImeis);
  
        if (updateSensorsError) {
          console.error('Error updating sensors folder_id:', updateSensorsError);
          throw updateSensorsError;
        }
      }
      
      // Update power plugs
      if (powerPlugImeiArray.length > 0) {
        const { error: updatePowerPlugsError } = await supabase
          .from('power_sensors')
          .update({ folder_id: folderId })
          .in('imei', powerPlugImeiArray);
  
        if (updatePowerPlugsError) {
          console.error('Error updating power_sensors folder_id:', updatePowerPlugsError);
          throw updatePowerPlugsError;
        }
      }
    }

    // Get the folder with updated PDF records
    let updatedFolder;
    let fetchError;
    
    try {
      // Try with creator columns
      const result = await supabase
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
          updated_at,
          sensor_locations,
          sensor_zones,
          sensor_types,
          created_by,
          creator_name,
          pdf_records (
            id,
            filename,
            created_at,
            creator_name
          )
        `)
        .eq('id', folderId)
        .single();
        
      updatedFolder = result.data;
      fetchError = result.error;
    } catch (e) {
      // If that fails, try without creator columns
      console.warn('Error querying with creator columns, trying without:', e);
      const result = await supabase
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
          updated_at,
          sensor_locations,
          sensor_zones,
          sensor_types,
          pdf_records (
            id,
            filename,
            created_at,
            creator_name
          )
        `)
        .eq('id', folderId)
        .single();
        
      updatedFolder = result.data;
      fetchError = result.error;
    }

    if (fetchError) throw fetchError;

    // Return the updated folder with all its data
    return {
      success: true,
      data: {
        ...folder,
        id: folderId,
        companyId: folderData.company_id,
        sensorLocations: updatedFolder.sensor_locations || {},
        sensorZones: updatedFolder.sensor_zones || {},
        sensorTypes: updatedFolder.sensor_types || {},
        createdBy: ('created_by' in updatedFolder ? updatedFolder.created_by : null) || folder.createdBy || '',
        creatorName: ('creator_name' in updatedFolder ? updatedFolder.creator_name : null) || folder.creatorName || '',
        pdfHistory: updatedFolder.pdf_records?.map(record => ({
          id: record.id,
          filename: record.filename,
          createdAt: record.created_at,
          creatorName: record.creator_name,
          type: 'pdf' // Default to 'pdf' for all existing records
        })) || []
      },
      message: isNewFolder
        ? 'Project created successfully'
        : 'Project updated successfully'
    };
  } catch (error) {
    console.error('Error saving folder:', error);
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
  status: 'running' | 'stopped'
): Promise<{ success: boolean; message: string }> => {
  try {
    // First check if the project exists
    const { data: existingProject, error: checkError } = await supabase
      .from('sensor_folders')
      .select('id, name, status')
      .eq('id', projectId)
      .single();

    if (checkError || !existingProject) {
      console.error('Project not found:', checkError);
      return {
        success: false,
        message: `Project not found or access denied: ${checkError?.message || 'Unknown error'}`
      };
    }

    // Don't update if status is already the same
    if (existingProject.status === status) {
      return {
        success: true,
        message: `Project already in ${status} state`
      };
    }

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
    console.error('Error updating project status:', error);
    return {
      success: false,
      message: `Failed to update project status: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      message: 'Project deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting project:', error);
    return {
      success: false,
      message: `Failed to delete project: ${error.message}`
    };
  }
};
