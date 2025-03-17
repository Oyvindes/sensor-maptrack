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

// Class implementation of CompanyService for mock data
export class MockCompanyService implements CompanyService {
  private companies: Company[] = [...mockCompanies];

  async create(input: CompanyCreateInput): Promise<Company> {
    const newCompany: Company = {
      id: `company-${Date.now().toString()}`,
      name: input.name,
      industry: input.industry || '',
      status: input.status || 'inactive',
      createdAt: new Date().toISOString()
    };
    
    this.companies.push(newCompany);
    return newCompany;
  }

  async update(id: string, input: CompanyUpdateInput): Promise<Company> {
    const index = this.companies.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Company with ID ${id} not found`);
    }
    
    const updatedCompany = {
      ...this.companies[index],
      ...(input.name !== undefined && { name: input.name }),
      ...(input.industry !== undefined && { industry: input.industry }),
      ...(input.status !== undefined && { status: input.status }),
    };
    
    this.companies[index] = updatedCompany;
    return updatedCompany;
  }

  async delete(id: string): Promise<void> {
    const index = this.companies.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Company with ID ${id} not found`);
    }
    
    this.companies.splice(index, 1);
  }

  async get(id: string): Promise<Company | null> {
    const company = this.companies.find(c => c.id === id);
    return company || null;
  }

  async list(filters?: CompanyFilters): Promise<Company[]> {
    let companies = [...this.companies];
    
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
  }

  async validate(input: CompanyCreateInput | CompanyUpdateInput): Promise<ValidationResult> {
    const errors: { [key: string]: string[] } = {};
    
    if ('name' in input && (!input.name || input.name.trim() === '')) {
      errors.name = ['Company name is required'];
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors: Object.keys(errors).length > 0 ? errors : undefined
    };
  }

  async exists(id: string): Promise<boolean> {
    return this.companies.some(c => c.id === id);
  }
}

// Export utility function for getting mock data
export const getMockCompanies = () => [...mockCompanies];
