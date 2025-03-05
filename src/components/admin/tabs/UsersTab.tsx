
import React from "react";
import { User, Company } from "@/types/users";
import UserList from "@/components/admin/UserList";
import UserEditor from "@/components/admin/UserEditor";

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
  return (
    <>
      {mode === "listUsers" && (
        <UserList
          users={users}
          companies={companies}
          onUserSelect={onUserSelect}
          onAddNew={onAddNewUser}
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
