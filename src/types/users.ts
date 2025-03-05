
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
  role: "admin" | "user";
  companyId: string;
  lastLogin: string;
  status: "active" | "inactive";
}
