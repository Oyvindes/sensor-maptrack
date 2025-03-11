
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useTrackingObjects } from '../useTrackingObjects';
import { mockServices, mockToast } from '../../test/test-utils';
import { toast } from 'sonner';

// Mock the dependencies
vi.mock('@/services/sensorService', () => ({
  getMockTrackingObjects: mockServices.getMockTrackingObjects
}));

vi.mock('@/services/device/mockDeviceData', () => ({
  getMockDevices: vi.fn(() => [
    {
      id: 'tracking-001',
      name: 'Test Object',
      type: 'tracker',
      status: 'online',
      location: { lat: 0, lng: 0 },
      companyId: 'company-001',
      lastUpdated: '10:00:00'
    }
  ])
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({ subscribe: vi.fn() })),
      subscribe: vi.fn()
    })),
    removeChannel: vi.fn()
  }
}));

vi.mock('sonner', () => ({
  toast: mockToast()
}));

describe('useTrackingObjects hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize tracking objects', () => {
    const { result } = renderHook(() => useTrackingObjects());
    
    expect(result.current.trackingObjects.length).toBeGreaterThan(0);
    expect(result.current.trackingObjects[0].name).toBe('Test Object');
  });

  it('should update tracking objects position over time', () => {
    const { result } = renderHook(() => useTrackingObjects());
    
    const initialObjects = [...result.current.trackingObjects];
    
    // Fast-forward time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // LastUpdated should be updated
    expect(result.current.trackingObjects[0].lastUpdated).not.toEqual(initialObjects[0].lastUpdated);
  });

  it('should handle object selection and show toast', () => {
    const { result } = renderHook(() => useTrackingObjects());
    
    const testObject = {
      id: 'tracking-001',
      name: 'Test Object',
      position: { lat: 0, lng: 0 },
      lastUpdated: '10:00:00',
      speed: 25,
      direction: 0,
      batteryLevel: 85
    };
    
    act(() => {
      result.current.handleObjectSelect(testObject);
    });
    
    expect(toast.info).toHaveBeenCalledWith(expect.stringContaining('Test Object selected'), 
      expect.objectContaining({ description: expect.stringContaining('Speed: 25mph, Battery: 85%') }));
  });
  
  it('should provide an updateTrackingObject function', () => {
    const { result } = renderHook(() => useTrackingObjects());
    
    expect(typeof result.current.updateTrackingObject).toBe('function');
  });
});
