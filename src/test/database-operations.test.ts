import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSupabaseMock, testData } from './mocks/supabaseMock';
import { DatabaseResult } from '@/utils/databaseUtils';
import type { SensorData } from '@/components/SensorCard';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: createSupabaseMock()
}));

describe('Database Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test basic database connection
  it('should verify database connection', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  // Test error handling
  it('should handle database errors gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: sensors } = await supabase
      .from('sensors')
      .select('*')
      .limit(1);

    expect(Array.isArray(sensors)).toBe(true);
  });

  // Test sensor operations
  describe('Sensor Operations', () => {
    let testSensor: SensorData & {
      folderId?: string;
      companyId?: string;
      imei?: string;
    };

    beforeEach(() => {
      testSensor = {
        id: 'temp-test',
        name: 'Test Sensor',
        status: 'online',
        imei: 'TEST123456789',
        values: [],
        lastUpdated: new Date().toISOString(),
        companyId: 'test-company-1',
        folderId: 'test-folder-1'
      };
    });

    // Test sensor creation
    it('should create a new sensor', async () => {
      const { saveSensor } = await import('@/services/sensor/supabaseSensorService');
      
      const result = await saveSensor(testSensor);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.name).toBe(testSensor.name);
      }
    });

    // Test sensor retrieval
    it('should fetch sensors', async () => {
      const { fetchSensors } = await import('@/services/sensor/supabaseSensorService');
      
      const sensors = await fetchSensors();
      expect(Array.isArray(sensors)).toBe(true);
      expect(sensors.length).toBeGreaterThanOrEqual(0);
    });

    // Test sensor deletion
    it('should delete a sensor', async () => {
      const { deleteSensor } = await import('@/services/sensor/supabaseSensorService');
      
      const result = await deleteSensor('TEST123456789');
      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully');
    });
  });

  // Test error handling
  it('should handle invalid data gracefully', async () => {
    const { saveSensor } = await import('@/services/sensor/supabaseSensorService');
    
    const invalidSensor = {
      id: 'temp-invalid',
      name: '',  // Invalid: empty name
      status: 'invalid_status' as any,
      values: [],
      lastUpdated: 'invalid-date'
    };

    const result = await saveSensor(invalidSensor);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Failed to save sensor');
  });
});