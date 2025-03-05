
import { Company, User } from "@/types/users";

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
    }
  ];
};

export const getMockUsers = (): User[] => {
  return [
    {
      id: "user-001",
      name: "John Doe",
      email: "john.doe@acme.com",
      role: "admin",
      companyId: "company-001",
      lastLogin: "2023-08-15T09:30:00",
      status: "active"
    },
    {
      id: "user-002",
      name: "Jane Smith",
      email: "jane.smith@acme.com",
      role: "user",
      companyId: "company-001",
      lastLogin: "2023-08-14T14:45:00",
      status: "active"
    },
    {
      id: "user-003",
      name: "Alice Johnson",
      email: "alice@technova.com",
      role: "admin",
      companyId: "company-002",
      lastLogin: "2023-08-15T11:20:00",
      status: "active"
    },
    {
      id: "user-004",
      name: "Bob Williams",
      email: "bob@technova.com",
      role: "user",
      companyId: "company-002",
      lastLogin: "2023-08-10T08:15:00",
      status: "inactive"
    },
    {
      id: "user-005",
      name: "Charlie Brown",
      email: "charlie@greenenergy.com",
      role: "admin",
      companyId: "company-003",
      lastLogin: "2023-08-13T16:30:00",
      status: "active"
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
