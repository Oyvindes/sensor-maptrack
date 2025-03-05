
import { User } from "@/types/users";

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
