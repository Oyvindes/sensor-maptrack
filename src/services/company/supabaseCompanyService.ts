import { supabase } from '@/integrations/supabase/client';
import { CompanyService } from './companyService';
import { Company, CompanyCreateInput, CompanyFilters, CompanyUpdateInput, ValidationResult } from './types';
import { mapToCompany, mapToCompanyInsert, mapToCompanyUpdate } from './mapper';
import { toast } from 'sonner';

export class SupabaseCompanyService implements CompanyService {
  async create(input: CompanyCreateInput): Promise<Company> {
    const validation = await this.validate(input);
    if (!validation.valid) {
      throw new Error('Invalid company data: ' + JSON.stringify(validation.errors));
    }

    const { data, error } = await supabase
      .from('companies')
      .insert(mapToCompanyInsert(input))
      .select('*')
      .single();

    if (error) {
      console.error('Error creating company:', error);
      throw new Error(`Failed to create company: ${error.message}`);
    }

    return mapToCompany(data);
  }

  async update(id: string, input: CompanyUpdateInput): Promise<Company> {
    const validation = await this.validate(input);
    if (!validation.valid) {
      throw new Error('Invalid company data: ' + JSON.stringify(validation.errors));
    }

    const { data, error } = await supabase
      .from('companies')
      .update(mapToCompanyUpdate(input))
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating company:', error);
      throw new Error(`Failed to update company: ${error.message}`);
    }

    return mapToCompany(data);
  }

  async delete(id: string): Promise<void> {
    // First check if there are any tracking objects using this company
    const { data: trackingObjects, error: countError } = await supabase
      .from('tracking_objects')
      .select('id', { count: 'exact' })
      .eq('company_id', id);

    if (countError) {
      console.error('Error checking tracking objects:', countError);
      throw new Error(`Failed to check tracking objects: ${countError.message}`);
    }

    if (trackingObjects && trackingObjects.length > 0) {
      throw new Error('Cannot delete company: It has associated tracking objects');
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting company:', error);
      throw new Error(`Failed to delete company: ${error.message}`);
    }
  }

  async get(id: string): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching company:', error);
      throw new Error(`Failed to fetch company: ${error.message}`);
    }

    return mapToCompany(data);
  }

  async list(filters?: CompanyFilters): Promise<Company[]> {
    let query = supabase
      .from('companies')
      .select('*');

    if (filters) {
      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }
      if (filters.industry) {
        query = query.ilike('industry', `%${filters.industry}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing companies:', error);
      throw new Error(`Failed to list companies: ${error.message}`);
    }

    return data.map(mapToCompany);
  }

  async validate(input: CompanyCreateInput | CompanyUpdateInput): Promise<ValidationResult> {
    const errors: { [key: string]: string[] } = {};

    // Name validation
    if ('name' in input) {
      if (!input.name || input.name.trim().length === 0) {
        errors.name = ['Name is required'];
      } else if (input.name.trim().length < 2) {
        errors.name = ['Name must be at least 2 characters long'];
      } else {
        // Check for duplicate names
        const { data, error } = await supabase
          .from('companies')
          .select('id')
          .ilike('name', input.name.trim());

        if (error) {
          console.error('Error checking company name:', error);
          errors.name = ['Failed to validate company name'];
        } else if (data && data.length > 0) {
          errors.name = ['A company with this name already exists'];
        }
      }
    }

    // Industry validation
    if ('industry' in input && (!input.industry || input.industry.trim().length === 0)) {
      errors.industry = ['Industry is required'];
    }

    // Status validation
    if ('status' in input && !['active', 'inactive'].includes(input.status)) {
      errors.status = ['Status must be either active or inactive'];
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors: Object.keys(errors).length > 0 ? errors : undefined
    };
  }

  async exists(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found
        return false;
      }
      console.error('Error checking company existence:', error);
      throw new Error(`Failed to check company existence: ${error.message}`);
    }

    return !!data;
  }
}