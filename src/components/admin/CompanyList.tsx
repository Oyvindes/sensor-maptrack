import React from "react";
import { Plus, Building, Users, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { Company } from "@/types/users";
import { Badge } from "@/components/ui/badge";

interface CompanyListProps {
  companies: Company[];
  onCompanySelect: (company: Company) => void;
  onAddNew: () => void;
  onViewUsers: (companyId: string) => void;
  canCreateCompany?: boolean;
}

const CompanyList: React.FC<CompanyListProps> = ({ 
  companies, 
  onCompanySelect, 
  onAddNew,
  onViewUsers,
  canCreateCompany = false
}) => {
  return (
    <SectionContainer>
      <SectionTitle className="mb-2">Manage Companies</SectionTitle>
      {canCreateCompany && (
        <div className="flex justify-start mb-6">
          <Button
            onClick={onAddNew}
            size="sm"
            className="h-12 px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="text-[10px] mt-1">New</span>
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {companies.map(company => (
          <div
            key={company.id}
            className="glass-card p-3 sm:p-4 rounded-lg hover:shadow-md transition-all-ease"
          >
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
              <Building className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h3 className="font-medium text-sm sm:text-base">{company.name}</h3>
              <Badge variant={company.status === "active" ? "default" : "secondary"} className="text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5">
                {company.status}
              </Badge>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
              Industry: {company.industry}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-4">
              Created: {company.createdAt}
            </div>
            <div className="flex justify-start mt-1 sm:mt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-12 px-4"
                onClick={() => onCompanySelect(company)}
              >
                <Pencil className="h-4 w-4" />
                <span className="text-[10px] mt-1">Edit</span>
              </Button>
              {/* Users button removed */}
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
};

export default CompanyList;
