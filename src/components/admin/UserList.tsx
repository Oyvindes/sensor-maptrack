
import React from "react";
import { Plus, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { User as UserType, Company } from "@/types/users";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getCurrentUser } from "@/services/authService";

interface UserListProps {
  users: UserType[];
  companies: Company[];
  currentCompanyId?: string;
  onUserSelect: (user: UserType) => void;
  onAddNew: () => void;
  onBack?: () => void;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  companies,
  currentCompanyId,
  onUserSelect, 
  onAddNew,
  onBack
}) => {
  const currentUser = getCurrentUser();
  
  // Filter users based on permission
  let filteredUsers = users;
  
  // If logged in user is a company admin, only show users from their company
  if (currentUser?.isCompanyAdmin && currentUser.role === "admin") {
    filteredUsers = users.filter(user => user.companyId === currentUser.companyId);
  }
  // Apply additional filter if currentCompanyId is provided
  else if (currentCompanyId) {
    filteredUsers = filteredUsers.filter(user => user.companyId === currentCompanyId);
  }
  
  // Find company name for the current company ID
  const currentCompany = currentCompanyId 
    ? companies.find(company => company.id === currentCompanyId)
    : undefined;

  return (
    <SectionContainer>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <SectionTitle>
            {currentCompany 
              ? `Users for ${currentCompany.name}` 
              : "All Users"}
          </SectionTitle>
        </div>
        <Button 
          onClick={onAddNew} 
          size="sm" 
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => {
          // Find company for this user
          const company = companies.find(c => c.id === user.companyId);
          
          return (
            <div 
              key={user.id}
              className="glass-card p-4 rounded-lg cursor-pointer hover:shadow-md transition-all-ease"
              onClick={() => onUserSelect(user)}
            >
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{user.name}</h3>
                <Badge variant={user.status === "active" ? "default" : "secondary"}>
                  {user.status}
                </Badge>
              </div>
              <div className="text-sm">{user.email}</div>
              <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                <span>Role: {user.role}</span>
                {user.isCompanyAdmin && (
                  <Badge variant="outline" className="text-xs">Company Admin</Badge>
                )}
              </div>
              {!currentCompanyId && (
                <div className="text-sm text-muted-foreground">
                  Company: {company?.name || "Unknown"}
                </div>
              )}
              <div className="text-xs mt-2 text-muted-foreground">
                Last login: {format(new Date(user.lastLogin), 'MMM d, yyyy HH:mm')}
              </div>
            </div>
          );
        })}
      </div>
    </SectionContainer>
  );
};

export default UserList;
