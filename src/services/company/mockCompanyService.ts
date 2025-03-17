
import { Company, CompanyCreateInput, CompanyFilters, CompanyUpdateInput, ValidationResult } from './types';
import { CompanyService } from './companyService';

// Mock company data
const mockCompanies: Company[] = [
  {
    id: 'company-001',
    name: 'Acme Corp',
    industry: 'Construction',
    status: 'active',
    createdAt: '2023-01-15T12:00:00Z'
  },
  {
    id: 'company-002',
    name: 'TechNova',
    industry: 'Technology',
    status: 'active',
    createdAt: '2023-02-20T14:30:00Z'
  },
  {
    id: 'company-003',
    name: 'Green Energy',
    industry: 'Energy',
    status: 'inactive',
    createdAt: '2023-03-05T09:15:00Z'
  }
];

// Implementation of CompanyService for mock data
export const getAllCompanies = async (): Promise<Company[]> => {
  return [...mockCompanies];
};

export const getCompanyById = async (id: string): Promise<Company | null> => {
  const company = mockCompanies.find(c => c.id === id);
  return company || null;
};

export const createCompany = async (input: CompanyCreateInput): Promise<Company> => {
  const newCompany: Company = {
    id: `company-${Date.now().toString()}`,
    name: input.name,
    industry: input.industry || '',
    status: input.status || 'inactive',
    createdAt: new Date().toISOString()
  };
  
  mockCompanies.push(newCompany);
  return newCompany;
};

export const updateCompany = async (id: string, input: CompanyUpdateInput): Promise<Company> => {
  const index = mockCompanies.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error(`Company with ID ${id} not found`);
  }
  
  const updatedCompany = {
    ...mockCompanies[index],
    ...(input.name !== undefined && { name: input.name }),
    ...(input.industry !== undefined && { industry: input.industry }),
    ...(input.status !== undefined && { status: input.status }),
  };
  
  mockCompanies[index] = updatedCompany;
  return updatedCompany;
};

export const deleteCompany = async (id: string): Promise<void> => {
  const index = mockCompanies.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error(`Company with ID ${id} not found`);
  }
  
  mockCompanies.splice(index, 1);
};

export const validateCompany = async (input: CompanyCreateInput | CompanyUpdateInput): Promise<ValidationResult> => {
  // Perform validation logic here
  const errors: string[] = [];
  
  if ('name' in input && (!input.name || input.name.trim() === '')) {
    errors.push('Company name is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Mock implementation of CompanyService
export const mockCompanyService: CompanyService = {
  create: createCompany,
  update: updateCompany,
  delete: deleteCompany,
  get: getCompanyById,
  list: async (filters?: CompanyFilters) => {
    let companies = [...mockCompanies];
    
    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        companies = companies.filter(c => c.status === filters.status);
      }
      if (filters.industry) {
        companies = companies.filter(c => c.industry.includes(filters.industry));
      }
      if (filters.name) {
        companies = companies.filter(c => c.name.toLowerCase().includes(filters.name.toLowerCase()));
      }
    }
    
    return companies;
  },
  validate: validateCompany,
  exists: async (id: string) => {
    return mockCompanies.some(c => c.id === id);
  }
};

export default mockCompanyService;
