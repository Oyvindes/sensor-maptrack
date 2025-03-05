
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
      address: "123 Main St, Anytown, US 12345",
      assignedSensorIds: ["sensor-001", "sensor-002"]
    },
    {
      id: "folder-002",
      name: "Warehouse",
      description: "Sensors for the warehouse",
      companyId: "company-001",
      createdAt: "2023-05-16",
      projectNumber: "PRJ-2023-002",
      address: "456 Storage Ave, Anytown, US 12345",
      assignedSensorIds: ["sensor-003"]
    },
    {
      id: "folder-003",
      name: "Office Building",
      description: "Sensors for the office building",
      companyId: "company-002",
      createdAt: "2023-05-17",
      projectNumber: "PRJ-2023-003",
      address: "789 Office Blvd, Business Park, US 23456",
      assignedSensorIds: ["sensor-004", "sensor-005"]
    },
    {
      id: "folder-004",
      name: "Data Center",
      description: "Sensors for the data center",
      companyId: "company-002",
      createdAt: "2023-05-18",
      projectNumber: "PRJ-2023-004",
      address: "101 Server Ln, Tech City, US 34567",
      assignedSensorIds: []
    },
    {
      id: "folder-005",
      name: "Solar Farm",
      description: "Sensors for the solar farm",
      companyId: "company-003",
      createdAt: "2023-05-19",
      projectNumber: "PRJ-2023-005",
      address: "202 Energy Way, Green Valley, US 45678",
      assignedSensorIds: ["sensor-006"]
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
