/**
 * Checks if a string is a valid UUID
 */
export const isValidUUID = (str: string): boolean => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
};

/**
 * Maps common company IDs to UUIDs
 * This is needed because our mock data uses string IDs like "company-001"
 * but the database expects UUIDs
 */
export const mapCompanyIdToUUID = (companyId: string): string | null => {
  // We'll modify the updateTrackingObject function to handle null returns properly
  
  // If it's already a UUID, return it as-is
  if (isValidUUID(companyId)) {
    return companyId;
  }
  
  // Otherwise, check if we have a hardcoded mapping for this company ID
  const companyMap: Record<string, string> = {
    // These are examples - the actual UUIDs must match those in your database
    'company-001': '11111111-1111-1111-1111-111111111111',
    'company-002': '22222222-2222-2222-2222-222222222222',
    'company-003': '33333333-3333-3333-3333-333333333333',
    'company-004': '44444444-4444-4444-4444-444444444444',
    'system': '00000000-0000-0000-0000-000000000000'
  };
  
  return companyMap[companyId] || null;
};
