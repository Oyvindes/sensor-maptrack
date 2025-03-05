
import { User, LoginCredentials } from "@/types/users";
import { toast } from "sonner";

// Mock users for authentication
let mockUsers: User[] = [
  {
    id: "master-001",
    name: "Master Admin",
    email: "admin@system.com",
    password: "admin123", // In a real app, this would be hashed
    role: "master",
    companyId: "system",
    lastLogin: new Date().toISOString(),
    status: "active"
  }
];

// Import and add all users from userService
import { getMockUsers } from "./userService";

// Initialize the authenticated user state
let currentUser: User | null = null;
let isAuthenticated = false;

// Initialize the user list with the master admin and mock users
export const initializeAuthService = () => {
  const mockUserList = getMockUsers();
  
  // Add password to mock users for testing
  const usersWithPasswords = mockUserList.map(user => {
    // Special case for oe@briks.no user to match the password Briks42!
    if (user.email === "oe@briks.no") {
      return {
        ...user,
        password: "Briks42!", // Use the correct password
        role: "master", // Ensure this user is always a master admin
        isCompanyAdmin: true // Ensure this user is always a company admin
      };
    }
    return {
      ...user,
      password: "password123" // Default password for other users
    };
  });
  
  mockUsers = [...mockUsers, ...usersWithPasswords];
  console.log("Auth service initialized with users:", mockUsers);
};

export const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; message: string }> => {
  console.log("Login attempt with:", credentials);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.email === credentials.email && u.password === credentials.password && u.status === "active"
      );
      
      if (user) {
        // Update user's last login time
        user.lastLogin = new Date().toISOString();
        currentUser = user;
        isAuthenticated = true;
        
        resolve({
          success: true,
          user: { ...user, password: "****" }, // Don't send password back to client
          message: "Login successful"
        });
      } else {
        resolve({
          success: false,
          message: "Invalid email or password"
        });
      }
    }, 800);
  });
};

export const logout = async (): Promise<{ success: boolean; message: string }> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = null;
      isAuthenticated = false;
      
      resolve({
        success: true,
        message: "Logout successful"
      });
    }, 300);
  });
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const isUserAuthenticated = (): boolean => {
  return isAuthenticated;
};

export const registerUser = async (user: User): Promise<{ success: boolean; user?: User; message: string }> => {
  console.log("Registering user:", user);
  
  // Check if email already exists
  if (mockUsers.some(u => u.email === user.email)) {
    return {
      success: false,
      message: "Email already exists"
    };
  }
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser = { ...user };
      mockUsers.push(newUser);
      
      resolve({
        success: true,
        user: { ...newUser, password: "****" }, // Don't send password back to client
        message: "User registered successfully"
      });
    }, 800);
  });
};

export const addUser = (user: User): void => {
  mockUsers.push(user);
};
