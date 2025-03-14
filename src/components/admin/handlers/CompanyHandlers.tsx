
import { Company } from "@/types/users";
import { getCurrentUser } from "@/services/authService";
import { toast } from "sonner";

export interface CompanyHandlers {
  handleCompanySelect: (company: Company) => void;
  handleCompanySave: (updatedCompany: Company) => void;
  handleCompanyCancel: () => void;
  handleAddNewCompany: () => void;
  canCreateCompany: boolean;
}

export function useCompanyHandlers(
  companies: Company[],
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>,
  setSelectedCompany: React.Dispatch<React.SetStateAction<Company | null>>,
  setMode: React.Dispatch<React.SetStateAction<string>>
): CompanyHandlers {
  
  // Check if current user is a master admin (site-wide admin)
  const currentUser = getCurrentUser();
  const canCreateCompany = currentUser?.role === "master";
  
  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setMode("editCompany");
  };

  const handleCompanySave = (updatedCompany: Company) => {
    setCompanies(companies.map(c => c.id === updatedCompany.id ? updatedCompany : c));
    setMode("listCompanies");
    setSelectedCompany(null);
  };

  const handleCompanyCancel = () => {
    setMode("listCompanies");
    setSelectedCompany(null);
  };

  const handleAddNewCompany = () => {
    // Only allow master admins to create companies
    if (!canCreateCompany) {
      toast.error("Only site-wide administrators can create companies");
      return;
    }
    
    setSelectedCompany({
      id: `company-${Date.now().toString().slice(-3)}`,
      name: "",
      industry: "",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0], // Added updatedAt property
      status: "active"
    });
    setMode("editCompany");
  };

  return {
    handleCompanySelect,
    handleCompanySave,
    handleCompanyCancel,
    handleAddNewCompany,
    canCreateCompany
  };
}
