
// Utility functions for handling UUID conversions

/**
 * Maps string-based company IDs to valid UUID format for database operations
 * This is needed because the mock data uses string IDs but Supabase expects valid UUIDs
 */
export const mapCompanyIdToUUID = (companyId: string): string => {
  // Map of mock company IDs to valid UUIDs
  const companyMap: Record<string, string> = {
    'system': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'company-001': 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'company-002': 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'company-003': 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'company-004': 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'company-005': 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  };

  // If we have a mapping for this company ID, return it
  if (companyMap[companyId]) {
    return companyMap[companyId];
  }

  // If the companyId is already in UUID format, return it as is
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId)) {
    return companyId;
  }

  console.warn(`No UUID mapping found for company ID: ${companyId}`);
  
  // Default fallback UUID if no mapping exists
  return 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
};

/**
 * Checks if a string is a valid UUID
 */
export const isValidUUID = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};
