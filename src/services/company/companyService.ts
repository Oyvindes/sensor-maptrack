
import { Company } from "@/types/users";
import { toast } from "sonner";

// Mock data service for companies
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

export const updateCompany = async (
  companyId: string,
  data: Partial<Company>
): Promise<{ success: boolean; message: string }> => {
  console.log(`Updating company ${companyId}`, data);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = {
        success: true,
        message: `Company ${companyId} updated successfully`,
      };
      
      toast.success(result.message);
      resolve(result);
    }, 800);
  });
};
