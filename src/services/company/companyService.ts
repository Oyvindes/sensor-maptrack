import { Company, CompanyCreateInput, CompanyFilters, CompanyUpdateInput, ValidationResult } from './types';

export interface CompanyService {
  /**
   * Create a new company
   */
  create(input: CompanyCreateInput): Promise<Company>;

  /**
   * Update an existing company
   */
  update(id: string, input: CompanyUpdateInput): Promise<Company>;

  /**
   * Delete a company
   */
  delete(id: string): Promise<void>;

  /**
   * Get a company by ID
   */
  get(id: string): Promise<Company>;

  /**
   * List companies with optional filters
   */
  list(filters?: CompanyFilters): Promise<Company[]>;

  /**
   * Validate company data
   */
  validate(input: CompanyCreateInput | CompanyUpdateInput): Promise<ValidationResult>;

  /**
   * Check if a company exists
   */
  exists(id: string): Promise<boolean>;
}
