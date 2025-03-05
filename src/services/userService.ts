import { Company, User, SensorFolder } from "@/types/users";

// Mock data service for companies and users
export const getMockCompanies = (): Company[] => {
  return [
    {
      id: "company-001",
      name: "Acme Corporation",
      industry: "Manufacturing",
      createdAt: "2023-01-15",
      status: "active"
    },
    {
      id: "company-002",
      name: "TechNova Solutions",
      industry: "Technology",
      createdAt: "2023-03-22",
      status: "active"
    },
    {
      id: "company-003",
      name: "Green Energy Ltd",
      industry: "Energy",
      createdAt: "2023-05-10",
      status: "inactive"
    },
    {
      id: "company-004",
      name: "Briks",
      industry: "Technology",
      createdAt: "2023-10-15",
      status: "active"
    }
  ];
};

export const getMockUsers = (): User[] => {
  return [
    {
      id: "user-001",
      name: "John Doe",
      email: "john.doe@acme.com",
      password: "password123", // In a real app, this would be hashed
      role: "admin",
      companyId: "company-001",
      lastLogin: "2023-08-15T09:30:00",
      status: "active",
      isCompanyAdmin: true // Set as company admin
    },
    {
      id: "user-002",
      name: "Jane Smith",
      email: "jane.smith@acme.com",
      password: "password123", // In a real app, this would be hashed
      role: "user",
      companyId: "company-001",
      lastLogin: "2023-08-14T14:45:00",
      status: "active"
    },
    {
      id: "user-003",
      name: "Alice Johnson",
      email: "alice@technova.com",
      password: "password123", // In a real app, this would be hashed
      role: "admin",
      companyId: "company-002",
      lastLogin: "2023-08-15T11:20:00",
      status: "active",
      isCompanyAdmin: true // Set as company admin
    },
    {
      id: "user-004",
      name: "Bob Williams",
      email: "bob@technova.com",
      password: "password123", // In a real app, this would be hashed
      role: "user",
      companyId: "company-002",
      lastLogin: "2023-08-10T08:15:00",
      status: "inactive"
    },
    {
      id: "user-005",
      name: "Charlie Brown",
      email: "charlie@greenenergy.com",
      password: "password123", // In a real app, this would be hashed
      role: "admin",
      companyId: "company-003",
      lastLogin: "2023-08-13T16:30:00",
      status: "active",
      isCompanyAdmin: true // Set as company admin
    },
    {
      id: "user-006",
      name: "Oe Briks",
      email: "oe@briks.no",
      password: "Briks42!", // Using the correct password
      role: "master", // Updated to master role to ensure site-wide admin
      companyId: "company-004",
      lastLogin: new Date().toISOString(),
      status: "active",
      isCompanyAdmin: true // Keep as company admin
    }
  ];
};

// Mock sensor folders
export const getMockSensorFolders = (): SensorFolder[] => {
  return [
    {
      id: "folder-001",
      name: "Main Building",
      description: "Sensors for the main building",
      companyId: "company-001",
      createdAt: "2023-05-15"
    },
    {
      id: "folder-002",
      name: "Warehouse",
      description: "Sensors for the warehouse",
      companyId: "company-001",
      createdAt: "2023-05-16"
    },
    {
      id: "folder-003",
      name: "Office Building",
      description: "Sensors for the office building",
      companyId: "company-002",
      createdAt: "2023-05-17"
    },
    {
      id: "folder-004",
      name: "Data Center",
      description: "Sensors for the data center",
      companyId: "company-002",
      createdAt: "2023-05-18"
    },
    {
      id: "folder-005",
      name: "Solar Farm",
      description: "Sensors for the solar farm",
      companyId: "company-003",
      createdAt: "2023-05-19"
    }
  ];
};

export const updateCompany = async (
  companyId: string,
  data: Partial<Company>
): Promise<{ success: boolean; message: string }> => {
  console.log(`Updating company ${companyId}`, data);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Company ${companyId} updated successfully`,
      });
    }, 800);
  });
};

export const updateUser = async (
  userId: string,
  data: Partial<User>
): Promise<{ success: boolean; message: string }> => {
  console.log(`Updating user ${userId}`, data);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `User ${userId} updated successfully`,
      });
    }, 800);
  });
};

export const createSensorFolder = async (
  folderData: Omit<SensorFolder, "id" | "createdAt">
): Promise<{ success: boolean; data: SensorFolder; message: string }> => {
  console.log("Creating new sensor folder:", folderData);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = `folder-${Date.now().toString().slice(-3)}`;
      const createdFolder: SensorFolder = { 
        ...folderData, 
        id: newId, 
        createdAt: new Date().toISOString().split('T')[0] 
      };
      
      resolve({
        success: true,
        data: createdFolder,
        message: `Folder ${createdFolder.name} created successfully`,
      });
    }, 800);
  });
};

export const updateSensorFolder = async (
  folderId: string,
  data: Partial<SensorFolder>
): Promise<{ success: boolean; message: string }> => {
  console.log(`Updating sensor folder ${folderId}`, data);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Folder ${folderId} updated successfully`,
      });
    }, 800);
  });
};
