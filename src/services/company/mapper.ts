
import { Company } from '@/types/users';
import { CompanyDB, CompanyInsert, CompanyUpdate, CompanyCreateInput, CompanyUpdateInput } from './types';

export function mapToCompany(dbCompany: CompanyDB): Company {
  return {
    id: dbCompany.id,
    name: dbCompany.name,
    industry: dbCompany.industry || '',
    status: (dbCompany.status || 'inactive') as 'active' | 'inactive',
    createdAt: dbCompany.created_at || new Date().toISOString(),
    updatedAt: dbCompany.created_at || new Date().toISOString(), // Use created_at as fallback for updatedAt
  };
}

export function mapToCompanyInsert(input: CompanyCreateInput): CompanyInsert {
  const now = new Date().toISOString();
  
  return {
    name: input.name,
    industry: input.industry,
    status: input.status,
    created_at: now,
    // Note: updated_at isn't included because it's not in the CompanyInsert type
  };
}

export function mapToCompanyUpdate(input: CompanyUpdateInput): CompanyUpdate {
  const update: CompanyUpdate = {};
  
  if ('name' in input) {
    update.name = input.name;
  }
  if ('industry' in input) {
    update.industry = input.industry;
  }
  if ('status' in input) {
    update.status = input.status;
  }

  return update;
}
