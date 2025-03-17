import { StoreServiceInterface } from './storeService';
import { mockStoreService } from './mockStoreService';
import { storeService as realStoreService } from './storeService';

// Set this to true to use mock data, false to use Supabase
const USE_MOCK_SERVICE = true;

// Create singleton instance
export const storeService: StoreServiceInterface = USE_MOCK_SERVICE 
  ? mockStoreService
  : realStoreService;

// Re-export types
export * from '@/types/store';
export * from './storeService';