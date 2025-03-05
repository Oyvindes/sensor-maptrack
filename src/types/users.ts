
export interface Company {
  id: string;
  name: string;
  industry: string;
  createdAt: string;
  status: "active" | "inactive";
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Added for authentication
  role: "admin" | "user" | "master"; // Added "master" role
  companyId: string;
  lastLogin: string;
  status: "active" | "inactive";
}

export interface SensorFolder {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  parentId?: string; // For nested folders
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
