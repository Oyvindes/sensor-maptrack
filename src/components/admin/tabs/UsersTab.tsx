
import React from "react";
import { User, Company } from "@/types/users";
import UserList from "@/components/admin/UserList";
import UserEditor from "@/components/admin/UserEditor";
import { getCurrentUser } from "@/services/authService";

interface UsersTabProps {
  mode: string;
  users: User[];
  companies: Company[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
  onUserSave: (user: User) => void;
  onUserCancel: () => void;
  onAddNewUser: () => void;
}

const UsersTab: React.FC<UsersTabProps> = ({
  mode,
  users,
  companies,
  selectedUser,
  onUserSelect,
  onUserSave,
  onUserCancel,
  onAddNewUser
}) => {
  const currentUser = getCurrentUser();
  const companyId = currentUser?.isCompanyAdmin && currentUser.role !== "master" 
    ? currentUser.companyId 
    : undefined;

  // Company admin can only add users to their own company
  // Master admin can add users to any company
  const handleAddUser = () => {
    onAddNewUser();
  };
  
  return (
    <>
      {mode === "listUsers" && (
        <UserList
          users={users}
          companies={companies}
          currentCompanyId={companyId} // Pass company ID if user is company admin
          onUserSelect={onUserSelect}
          onAddNew={handleAddUser}
        />
      )}
      {mode === "editUser" && selectedUser && (
        <UserEditor
          user={selectedUser}
          companies={companies}
          onSave={onUserSave}
          onCancel={onUserCancel}
        />
      )}
    </>
  );
};

export default UsersTab;
