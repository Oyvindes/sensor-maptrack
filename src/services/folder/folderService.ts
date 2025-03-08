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

// Mock sensor folders (now projects)
export const getMockSensorFolders = (): SensorFolder[] => {
  return [
    {
      id: "folder-001",
      name: "NTNU Gløshaugen",
      description: "Sensors for the NTNU main campus",
      companyId: "company-001",
      createdAt: "2023-05-15",
      projectNumber: "PRJ-2023-001",
      address: "Høgskoleringen 5, 7034 Trondheim, Norway",
      assignedSensorIds: ["sensor-001", "sensor-002"],
      location: { lat: 63.4173, lng: 10.4035 }
    },
    {
      id: "folder-002",
      name: "Nidaros Cathedral",
      description: "Sensors for Nidaros Cathedral",
      companyId: "company-001",
      createdAt: "2023-05-16",
      projectNumber: "PRJ-2023-002",
      address: "Kongsgårdsgata 2, 7013 Trondheim, Norway",
      assignedSensorIds: ["sensor-003"],
      location: { lat: 63.4268, lng: 10.3969 }
    },
    {
      id: "folder-003",
      name: "Solsiden Shopping Center",
      description: "Sensors for Solsiden shopping center",
      companyId: "company-002",
      createdAt: "2023-05-17",
      projectNumber: "PRJ-2023-003",
      address: "Beddingen 10, 7014 Trondheim, Norway",
      assignedSensorIds: ["sensor-004", "sensor-005"],
      location: { lat: 63.4352, lng: 10.4111 }
    },
    {
      id: "folder-004",
      name: "Pirbadet",
      description: "Sensors for Pirbadet swimming pool",
      companyId: "company-002",
      createdAt: "2023-05-18",
      projectNumber: "PRJ-2023-004",
      address: "Havnegata 12, 7010 Trondheim, Norway",
      assignedSensorIds: [],
      location: { lat: 63.4393, lng: 10.4001 }
    },
    {
      id: "folder-005",
      name: "Trondheim Spektrum",
      description: "Sensors for Trondheim Spektrum arena",
      companyId: "company-003",
      createdAt: "2023-05-19",
      projectNumber: "PRJ-2023-005",
      address: "Klostergata 90, 7030 Trondheim, Norway",
      assignedSensorIds: ["sensor-006"],
      location: { lat: 63.4280, lng: 10.3797 }
    }
  ];
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
