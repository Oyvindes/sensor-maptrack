
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
  password: string;
  role: "admin" | "user" | "master";
  companyId: string;
  lastLogin: string;
  status: "active" | "inactive";
  isCompanyAdmin?: boolean; // New field to mark users as company admins
}

export interface SensorFolder {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  parentId?: string; // For nested folders
  createdAt: string;
  createdBy?: string; // ID of the user who created the folder
  creatorName?: string; // Name of the user who created the folder
  projectNumber?: string; // New field for project number
  address?: string; // New field for project address
  assignedSensorIds?: string[]; // New field for assigned sensors
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
