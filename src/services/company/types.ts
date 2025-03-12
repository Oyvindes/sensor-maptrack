import { Database } from '@/integrations/supabase/types';

// Get the company type from Supabase schema
type DbCompany = Database['public']['Tables']['companies']['Row'];
type DbCompanyInsert = Database['public']['Tables']['companies']['Insert'];
type DbCompanyUpdate = Database['public']['Tables']['companies']['Update'];

// Using the application-wide Company type from users.ts
import { Company as AppCompany } from '@/types/users';

export interface Company extends AppCompany {}

// Export database types
export type CompanyDB = DbCompany;
export type CompanyInsert = DbCompanyInsert;
export type CompanyUpdate = DbCompanyUpdate;

// Input types for service methods
export interface CompanyCreateInput {
  name: string;
  industry: string;
  status: 'active' | 'inactive';
}

export interface CompanyUpdateInput {
  name?: string;
  industry?: string;
  status?: 'active' | 'inactive';
}

export interface CompanyFilters {
  name?: string;
  industry?: string;
  status?: 'active' | 'inactive';
}

export interface ValidationResult {
  valid: boolean;
  errors?: {
    [key: string]: string[];
  };
}