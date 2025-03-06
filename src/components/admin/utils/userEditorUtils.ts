
import { User } from "@/types/users";

// Check if user is the protected oe@briks.no account
export const isProtectedUser = (email: string): boolean => {
  return email === "oe@briks.no" || email === "pes@briks.no";
};

// Ensure protected user has correct permissions
export const ensureProtectedUserPermissions = (user: User): User => {
  if (isProtectedUser(user.email) && (user.role !== "master" || !user.isCompanyAdmin)) {
    return { 
      ...user, 
      role: "master" as const,
      isCompanyAdmin: true 
    };
  }
  return user;
};
