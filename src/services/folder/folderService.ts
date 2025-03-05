
import { SensorFolder } from "@/types/users";
import { toast } from "sonner";

// Mock sensor folders (now projects)
export const getMockSensorFolders = (): SensorFolder[] => {
  return [
    {
      id: "folder-001",
      name: "Main Building",
      description: "Sensors for the main building",
      companyId: "company-001",
      createdAt: "2023-05-15",
      projectNumber: "PRJ-2023-001",
      address: "Kongens gate 15, 7013 Trondheim, Norway",
      assignedSensorIds: ["sensor-001", "sensor-002"],
      location: { lat: 63.430243, lng: 10.395014 }
    },
    {
      id: "folder-002",
      name: "Warehouse",
      description: "Sensors for the warehouse",
      companyId: "company-001",
      createdAt: "2023-05-16",
      projectNumber: "PRJ-2023-002",
      address: "Brattørkaia 17A, 7010 Trondheim, Norway",
      assignedSensorIds: ["sensor-003"],
      location: { lat: 63.435450, lng: 10.398714 }
    },
    {
      id: "folder-003",
      name: "Office Building",
      description: "Sensors for the office building",
      companyId: "company-002",
      createdAt: "2023-05-17",
      projectNumber: "PRJ-2023-003",
      address: "Munkegata 26, 7011 Trondheim, Norway",
      assignedSensorIds: ["sensor-004", "sensor-005"],
      location: { lat: 63.430091, lng: 10.392861 }
    },
    {
      id: "folder-004",
      name: "Data Center",
      description: "Sensors for the data center",
      companyId: "company-002",
      createdAt: "2023-05-18",
      projectNumber: "PRJ-2023-004",
      address: "Olav Tryggvasons gate 40, 7011 Trondheim, Norway",
      assignedSensorIds: [],
      location: { lat: 63.433101, lng: 10.403635 }
    },
    {
      id: "folder-005",
      name: "Solar Farm",
      description: "Sensors for the solar farm",
      companyId: "company-003",
      createdAt: "2023-05-19",
      projectNumber: "PRJ-2023-005",
      address: "Innherredsveien 7, 7014 Trondheim, Norway",
      assignedSensorIds: ["sensor-006"],
      location: { lat: 63.432982, lng: 10.412361 }
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
