
import { CompanyService } from './companyService';
import { MockCompanyService } from './mockCompanyService';
import { SupabaseCompanyService } from './supabaseCompanyService';

// Set this to true to use mock data, false to use Supabase
const USE_MOCK_SERVICE = false;

// Create singleton instance
export const companyService: CompanyService = USE_MOCK_SERVICE 
  ? new MockCompanyService()
  : new SupabaseCompanyService();

// Re-export types
export * from './types';
export * from './companyService';

// For backwards compatibility during transition
export { getAllCompanies } from './mockCompanyService';
export { getMockCompanies } from './mockCompanyService';
