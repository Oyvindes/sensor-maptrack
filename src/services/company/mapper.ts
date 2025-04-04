
import { Company } from '@/types/users';
import { CompanyDB, CompanyInsert, CompanyUpdate, CompanyCreateInput, CompanyUpdateInput } from './types';

export function mapToCompany(dbCompany: CompanyDB): Company {
  return {
    id: dbCompany.id,
    name: dbCompany.name,
    industry: dbCompany.industry || '',
    status: (dbCompany.status || 'inactive') as 'active' | 'inactive',
    createdAt: dbCompany.created_at || new Date().toISOString(),
  };
}

export function mapToCompanyInsert(input: CompanyCreateInput): CompanyInsert {
  return {
    name: input.name,
    industry: input.industry,
    status: input.status,
    created_at: new Date().toISOString(),
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
