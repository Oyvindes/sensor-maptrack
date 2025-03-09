
import { SensorFolder } from "@/types/users";
import { toast } from "sonner";
import { formatCoordinates } from "../geocodingService";
import { 
  fetchSensorFolders, 
  saveSensorFolder,
  updateProjectStatus
} from "./supabaseFolderService";

/**
 * Format a project's address and coordinates for consistent display
 */
export const formatProjectAddressDisplay = (project: SensorFolder): string => {
  if (!project.address) return '';
  
  // Extract the address parts (street, city, etc.)
  const addressParts = project.address.split(',');
  const streetAddress = addressParts[0]?.trim() || '';
  const cityInfo = addressParts[1]?.trim() || '';
  
  // Return the formatted display string
  let displayText = streetAddress;
  
  // Add city/postal code if available
  if (cityInfo) {
    displayText += `\n${cityInfo}`;
  }
  
  // Add coordinates if available - use precise formatting
  if (project.location) {
    let coords;
    
    // Handle string or object location
    if (typeof project.location === 'string') {
      try {
        const parsedLocation = JSON.parse(project.location);
        coords = formatCoordinates(parsedLocation.lat, parsedLocation.lng);
      } catch (e) {
        console.warn(`Failed to parse location for ${project.id}:`, e);
      }
    } else if (project.location && 'lat' in project.location && 'lng' in project.location) {
      coords = formatCoordinates(project.location.lat, project.location.lng);
    }
    
    if (coords) {
      displayText += `\nCoordinates: [${coords.lat}, ${coords.lng}]`;
    }
  }
  
  return displayText;
};

// Replace mock data with real database calls
export const getMockSensorFolders = async (): Promise<SensorFolder[]> => {
  return await fetchSensorFolders();
};

export const createSensorFolder = async (
  folderData: Omit<SensorFolder, "id" | "createdAt">
): Promise<{ success: boolean; data: SensorFolder | null; message: string }> => {
  // Convert to a SensorFolder by adding temp ID
  const tempFolder: SensorFolder = {
    ...folderData,
    id: `temp-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0]
  };

  const result = await saveSensorFolder(tempFolder);
  return {
    success: result.success,
    data: result.data || null,
    message: result.message
  };
};

export const updateSensorFolder = async (
  folderId: string,
  data: Partial<SensorFolder>
): Promise<{ success: boolean; message: string }> => {
  // First get the current folder data
  const folders = await fetchSensorFolders();
  const existingFolder = folders.find(f => f.id === folderId);
  
  if (!existingFolder) {
    return {
      success: false,
      message: `Project with ID ${folderId} not found`
    };
  }

  // Merge with updates
  const updatedFolder: SensorFolder = {
    ...existingFolder,
    ...data
  };

  const result = await saveSensorFolder(updatedFolder);
  return {
    success: result.success,
    message: result.message
  };
};
