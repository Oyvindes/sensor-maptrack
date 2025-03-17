import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if a string is a valid UUID
 */
export const isValidUUID = (str: string): boolean => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
};

// Cache for company IDs to avoid repeated database queries
let companyCache: Record<string, string> | null = null;

/**
 * Maps company IDs to UUIDs
 * This function returns the UUID for a company ID
 */
export const mapCompanyIdToUUID = async (companyId: string): Promise<string | null> => {
  // If it's already a UUID, return it as-is
  if (isValidUUID(companyId)) {
    return companyId;
  }
  
  // If we have a cache, use it
  if (companyCache && companyCache[companyId]) {
    return companyCache[companyId];
  }
  
  try {
    // Fetch company IDs from the database
    const { data, error } = await supabase
      .from('companies')
      .select('id, name');
    
    if (error) {
      console.error('Error fetching company IDs:', error);
      return null;
    }
    
    // Create a mapping of company codes to UUIDs
    companyCache = {
      'system': data.find(c => c.name === 'System Company')?.id || null,
      'company-001': data.find(c => c.name === 'Acme Corporation')?.id || null,
      'company-002': data.find(c => c.name === 'TechNova Solutions')?.id || null,
      'company-003': data.find(c => c.name === 'Green Energy Ltd')?.id || null,
      'company-004': data.find(c => c.name === 'Briks')?.id || null
    };
    
    return companyCache[companyId] || null;
  } catch (error) {
    console.error('Error mapping company ID to UUID:', error);
    return null;
  }
};

/**
 * Synchronous version of mapCompanyIdToUUID that uses a fallback mapping
 * This is used when an async function cannot be used
 */
export const mapCompanyIdToUUIDSync = (companyId: string): string | null => {
  // If it's already a UUID, return it as-is
  if (isValidUUID(companyId)) {
    return companyId;
  }
  
  // If we have a cache, use it
  if (companyCache && companyCache[companyId]) {
    return companyCache[companyId];
  }
  
  // Otherwise, use a fallback mapping
  // Note: This is a fallback and may not be accurate
  // It's better to use the async version whenever possible
  console.warn('Using fallback company mapping. This may not be accurate.');
  const fallbackMap: Record<string, string> = {
    'system': '00000000-0000-0000-0000-000000000000',
    'company-001': '11111111-1111-1111-1111-111111111111',
    'company-002': '22222222-2222-2222-2222-222222222222',
    'company-003': '33333333-3333-3333-3333-333333333333',
    'company-004': '44444444-4444-4444-4444-444444444444'
  };
  
  return fallbackMap[companyId] || null;
};

/**
 * Maps company UUIDs back to company IDs
 * This function is the reverse of mapCompanyIdToUUID
 */
export const mapCompanyUUIDToId = (uuid: string): string => {
  // If it's not a UUID, return it as-is
  if (!isValidUUID(uuid)) {
    return uuid;
  }
  
  // Reverse mapping from UUIDs to company IDs
  const reverseMap: Record<string, string> = {
    '00000000-0000-0000-0000-000000000000': 'system',
    '11111111-1111-1111-1111-111111111111': 'company-001',
    '22222222-2222-2222-2222-222222222222': 'company-002',
    '33333333-3333-3333-3333-333333333333': 'company-003',
    '44444444-4444-4444-4444-444444444444': 'company-004'
  };
  
  return reverseMap[uuid] || uuid;
};
