
import { Company } from "@/types/users";

export interface CompanyHandlers {
  handleCompanySelect: (company: Company) => void;
  handleCompanySave: (updatedCompany: Company) => void;
  handleCompanyCancel: () => void;
  handleAddNewCompany: () => void;
}

export function useCompanyHandlers(
  companies: Company[],
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>,
  setSelectedCompany: React.Dispatch<React.SetStateAction<Company | null>>,
  setMode: React.Dispatch<React.SetStateAction<string>>
): CompanyHandlers {
  
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
    handleAddNewCompany
  };
}
