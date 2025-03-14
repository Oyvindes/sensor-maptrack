
import { Company, CompanyCreateInput, CompanyFilters, CompanyUpdateInput, ValidationResult } from './types';
import { CompanyService } from './companyService';

// Mock data - will be removed once proper company management is implemented
const mockCompanies: Company[] = [
  {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'System Company',
    industry: 'System',
    status: 'active',
    createdAt: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const getMockCompanies = () => mockCompanies;

export class MockCompanyService implements CompanyService {
  async create(input: CompanyCreateInput): Promise<Company> {
    const newCompany: Company = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockCompanies.push(newCompany);
    return newCompany;
  }

  async update(id: string, input: CompanyUpdateInput): Promise<Company> {
    const index = mockCompanies.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Company not found');
    }

    const updatedCompany = {
      ...mockCompanies[index],
      ...input,
      updated_at: new Date().toISOString()
    };
    mockCompanies[index] = updatedCompany;
    return updatedCompany;
  }

  async delete(id: string): Promise<void> {
    const index = mockCompanies.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Company not found');
    }
    mockCompanies.splice(index, 1);
  }

  async get(id: string): Promise<Company> {
    const company = mockCompanies.find(c => c.id === id);
    if (!company) {
      throw new Error('Company not found');
    }
    return company;
  }

  async list(filters?: CompanyFilters): Promise<Company[]> {
    let filtered = [...mockCompanies];
    
    if (filters) {
      if (filters.name) {
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(filters.name!.toLowerCase())
        );
      }
      if (filters.industry) {
        filtered = filtered.filter(c => 
          c.industry.toLowerCase().includes(filters.industry!.toLowerCase())
        );
      }
      if (filters.status) {
        filtered = filtered.filter(c => c.status === filters.status);
      }
    }
    
    return filtered;
  }

  async validate(input: CompanyCreateInput | CompanyUpdateInput): Promise<ValidationResult> {
    const errors: { [key: string]: string[] } = {};

    if ('name' in input && (!input.name || input.name.trim().length === 0)) {
      errors.name = ['Name is required'];
    }

    if ('industry' in input && (!input.industry || input.industry.trim().length === 0)) {
      errors.industry = ['Industry is required'];
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors: Object.keys(errors).length > 0 ? errors : undefined
    };
  }

  async exists(id: string): Promise<boolean> {
    return mockCompanies.some(c => c.id === id);
  }
}
