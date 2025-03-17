import { vi } from 'vitest';

// Mock response builder
const createMockResponse = (data: any = null, error: any = null) => ({
  data,
  error,
  count: null,
  status: 200,
  statusText: 'OK',
  body: null,
});

// Create a mock Supabase client
export const createSupabaseMock = () => {
  return {
    from: (table: string) => ({
      select: vi.fn().mockImplementation((query?: string) => ({
        single: () => Promise.resolve(createMockResponse({})),
        eq: () => Promise.resolve(createMockResponse({})),
        order: () => ({
          select: () => Promise.resolve(createMockResponse([]))
        }),
        limit: () => Promise.resolve(createMockResponse([])),
      })),
      insert: vi.fn().mockImplementation((data: any) => {
        // Check for invalid data
        if (!data.name || data.status === 'invalid_status') {
          return {
            select: () => ({
              single: () => Promise.resolve(createMockResponse(null, {
                message: 'Invalid data provided',
                code: 'VALIDATION_ERROR'
              }))
            })
          };
        }
        return {
          select: () => ({
            single: () => Promise.resolve(createMockResponse({ id: 'test-id' }))
          })
        };
      }),
      update: vi.fn().mockImplementation((data: any) => ({
        eq: () => Promise.resolve(createMockResponse({}))
      })),
      delete: vi.fn().mockImplementation(() => ({
        eq: () => Promise.resolve(createMockResponse({}))
      })),
      eq: vi.fn().mockReturnThis(),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: {}, error: null })
    }
  };
};

// Create default test data
export const testData = {
  sensors: [
    {
      id: 'test-sensor-1',
      name: 'Test Sensor 1',
      imei: 'TEST123456789',
      status: 'online',
      folder_id: 'test-folder-1',
      company_id: 'test-company-1',
      updated_at: new Date().toISOString()
    }
  ],
  folders: [
    {
      id: 'test-folder-1',
      name: 'Test Folder',
      project_number: 'TEST001',
      company_id: 'test-company-1'
    }
  ],
  sensor_values: [
    {
      sensor_imei: 'TEST123456789',
      created_at: new Date().toISOString(),
      payload: { temperature: 25, humidity: 60 }
    }
  ]
};

// Helper to create custom mock responses
export const createMockQueryBuilder = (customData: any = null) => ({
  data: customData,
  error: null,
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: customData, error: null }),
  execute: vi.fn().mockResolvedValue({ data: customData, error: null })
});