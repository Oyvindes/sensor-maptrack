
import { Company } from "@/types/users";
import { getCurrentUser } from "@/services/authService";
import { toast } from "sonner";
import { companyService } from "@/services/company";

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

  const handleCompanySave = async (updatedCompany: Company) => {
    try {
      let savedCompany: Company;
      
      // Check if this is a new company (ID starts with "company-")
      if (updatedCompany.id.startsWith("company-")) {
        // Create new company
        savedCompany = await companyService.create({
          name: updatedCompany.name,
          industry: updatedCompany.industry,
          status: updatedCompany.status
        });
        
        // Add the new company to the list
        setCompanies(prevCompanies => [...prevCompanies, savedCompany]);
        toast.success("Company created successfully");
      } else {
        // Update existing company
        savedCompany = await companyService.update(updatedCompany.id, {
          name: updatedCompany.name,
          industry: updatedCompany.industry,
          status: updatedCompany.status
        });
        
        // Update the company in the list
        setCompanies(companies.map(c => c.id === savedCompany.id ? savedCompany : c));
        toast.success("Company updated successfully");
      }
      
      setMode("listCompanies");
      setSelectedCompany(null);
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save company");
    }
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
