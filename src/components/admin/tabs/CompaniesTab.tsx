
import React from "react";
import { Company } from "@/types/users";
import CompanyList from "@/components/admin/CompanyList";
import CompanyEditor from "@/components/admin/CompanyEditor";

interface CompaniesTabProps {
  mode: string;
  companies: Company[];
  selectedCompany: Company | null;
  onCompanySelect: (company: Company) => void;
  onCompanySave: (company: Company) => void;
  onCompanyCancel: () => void;
  onAddNewCompany: () => void;
  canCreateCompany: boolean;
}

const CompaniesTab: React.FC<CompaniesTabProps> = ({
  mode,
  companies,
  selectedCompany,
  onCompanySelect,
  onCompanySave,
  onCompanyCancel,
  onAddNewCompany,
  canCreateCompany
}) => {
  return (
    <>
      {mode === "listCompanies" && (
        <CompanyList
          companies={companies}
          onCompanySelect={onCompanySelect}
          onAddNew={onAddNewCompany}
          onViewUsers={() => {}}
          canCreateCompany={canCreateCompany}
        />
      )}
      {mode === "editCompany" && selectedCompany && (
        <CompanyEditor
          company={selectedCompany}
          onSave={onCompanySave}
          onCancel={onCompanyCancel}
        />
      )}
    </>
  );
};

export default CompaniesTab;
