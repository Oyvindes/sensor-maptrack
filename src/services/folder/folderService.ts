import { SensorFolder } from "@/types/users";
import { toast } from "sonner";
import { formatCoordinates } from "../geocodingService";

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

// No mockup data for projects - UI will handle empty state gracefully
export const getMockSensorFolders = (): SensorFolder[] => {
  // Return an empty array instead of mock data
  return [];
};

export const createSensorFolder = async (
  folderData: Omit<SensorFolder, "id" | "createdAt">
): Promise<{ success: boolean; data: SensorFolder; message: string }> => {
  console.log("Creating new project:", folderData);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = `folder-${Date.now().toString().slice(-3)}`;
      const createdFolder: SensorFolder = { 
        ...folderData, 
        id: newId, 
        createdAt: new Date().toISOString().split('T')[0] 
      };
      
      const result = {
        success: true,
        data: createdFolder,
        message: `Project ${createdFolder.name} created successfully`,
      };
      
      toast.success(result.message);
      resolve(result);
    }, 800);
  });
};

export const updateSensorFolder = async (
  folderId: string,
  data: Partial<SensorFolder>
): Promise<{ success: boolean; message: string }> => {
  console.log(`Updating project ${folderId}`, data);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = {
        success: true,
        message: `Project ${folderId} updated successfully`,
      };
      
      toast.success(result.message);
      resolve(result);
    }, 800);
  });
};
