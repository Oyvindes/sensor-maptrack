
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useTrackingObjects } from '../useTrackingObjects';
import { mockServices, mockToast } from '../../test/test-utils';
import { toast } from 'sonner';

// Mock the dependencies
vi.mock('@/services/sensorService', () => ({
  getMockTrackingObjects: mockServices.getMockTrackingObjects
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
    
    expect(mockServices.getMockTrackingObjects).toHaveBeenCalled();
    expect(result.current.trackingObjects).toEqual(mockServices.getMockTrackingObjects());
  });

  it('should update tracking objects position over time', () => {
    const { result } = renderHook(() => useTrackingObjects());
    
    const initialObjects = [...result.current.trackingObjects];
    
    // Fast-forward time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // Positions should be updated
    expect(result.current.trackingObjects[0].position).not.toEqual(initialObjects[0].position);
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
});
