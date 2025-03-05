
import React from "react";
import { Plus, Building, Users } from "lucide-react";
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
      <div className="flex justify-between items-center mb-4">
        <SectionTitle>Manage Companies</SectionTitle>
        {canCreateCompany && (
          <Button 
            onClick={onAddNew} 
            size="sm" 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Company</span>
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map(company => (
          <div 
            key={company.id}
            className="glass-card p-4 rounded-lg hover:shadow-md transition-all-ease"
          >
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-5 w-5 text-primary" />
              <h3 className="font-medium">{company.name}</h3>
              <Badge variant={company.status === "active" ? "default" : "secondary"}>
                {company.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              Industry: {company.industry}
            </div>
            <div className="text-xs text-muted-foreground mb-4">
              Created: {company.createdAt}
            </div>
            <div className="flex justify-between mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onCompanySelect(company)}
              >
                Edit
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="gap-1"
                onClick={() => onViewUsers(company.id)}
              >
                <Users className="h-4 w-4" />
                Users
              </Button>
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
};

export default CompanyList;
