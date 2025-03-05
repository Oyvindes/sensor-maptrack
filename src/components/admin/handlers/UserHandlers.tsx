
import { User, Company } from "@/types/users";
import { getCurrentUser } from "@/services/authService";

export interface UserHandlers {
  handleUserSelect: (user: User) => void;
  handleUserSave: (updatedUser: User) => void;
  handleUserCancel: () => void;
  handleAddNewUser: () => void;
}

export function useUserHandlers(
  users: User[],
  companies: Company[],
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>,
  setMode: React.Dispatch<React.SetStateAction<string>>
): UserHandlers {
  
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setMode("editUser");
  };

  const handleUserSave = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setMode("listUsers");
    setSelectedUser(null);
  };

  const handleUserCancel = () => {
    setMode("listUsers");
    setSelectedUser(null);
  };

  const handleAddNewUser = () => {
    const currentUser = getCurrentUser();
    const defaultCompanyId = currentUser?.isCompanyAdmin ? currentUser.companyId : companies[0]?.id || "system";
    
    setSelectedUser({
      id: `user-${Date.now().toString().slice(-3)}`,
      name: "",
      email: "",
      password: "",
      role: "user",
      companyId: defaultCompanyId,
      lastLogin: new Date().toISOString(),
      status: "active"
    });
    setMode("editUser");
  };

  return {
    handleUserSelect,
    handleUserSave,
    handleUserCancel,
    handleAddNewUser
  };
}
