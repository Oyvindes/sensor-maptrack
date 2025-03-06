
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useDashboardActions } from '../useDashboardActions';
import { mockServices, mockToast } from '../../test/test-utils';
import { toast } from 'sonner';

// Mock the dependencies
vi.mock('@/services/sensorService', () => ({
  getMockSensors: mockServices.getMockSensors,
  getMockTrackingObjects: mockServices.getMockTrackingObjects
}));

vi.mock('@/services/folder/folderService', () => ({
  getMockSensorFolders: mockServices.getMockSensorFolders
}));

vi.mock('@/services/authService', () => ({
  getCurrentUser: mockServices.getCurrentUser
}));

vi.mock('sonner', () => ({
  toast: mockToast()
}));

describe('useDashboardActions hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should refresh data and show toasts', async () => {
    const { result } = renderHook(() => useDashboardActions());
    
    const setSensors = vi.fn();
    const setTrackingObjects = vi.fn();
    const setProjects = vi.fn();
    
    act(() => {
      result.current.handleRefresh(setSensors, setTrackingObjects, setProjects);
    });
    
    // Check if info toast was shown
    expect(toast.info).toHaveBeenCalledWith('Refreshing data...');
    
    // Fast-forward time to complete the refresh
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    // Check if services were called
    expect(mockServices.getMockSensors).toHaveBeenCalled();
    expect(mockServices.getMockTrackingObjects).toHaveBeenCalled();
    expect(mockServices.getMockSensorFolders).toHaveBeenCalled();
    
    // Check if state updaters were called
    expect(setSensors).toHaveBeenCalled();
    expect(setTrackingObjects).toHaveBeenCalled();
    expect(setProjects).toHaveBeenCalled();
    
    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Data refreshed successfully');
  });
});
