
import { User, Company } from "@/types/users";
import { getCurrentUser } from "@/services/authService";
import { saveUser } from "@/services/user/supabaseUserService";
import { toast } from "sonner";

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

  const handleUserSave = async (updatedUser: User) => {
    try {
      // Save user to database
      const result = await saveUser(updatedUser);
      
      if (result.success) {
        // If we have the returned data, use it, otherwise use the updated user
        const savedUser = result.data || updatedUser;
        
        // Check if this is a new user (ID starts with "user-")
        if (updatedUser.id.startsWith("user-")) {
          // Add the new user to the list
          setUsers(prevUsers => [...prevUsers, savedUser]);
          toast.success("User created successfully");
        } else {
          // Update the user in the list
          setUsers(users.map(u => u.id === savedUser.id ? savedUser : u));
          toast.success("User updated successfully");
        }
        
        setMode("listUsers");
        setSelectedUser(null);
      } else {
        toast.error(result.message || "Failed to save user");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save user");
    }
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
