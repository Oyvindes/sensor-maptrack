
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useProjectData } from '../useProjectData';
import { mockServices, mockToast } from '../../test/test-utils';
import { toast } from 'sonner';

// Mock the dependencies
vi.mock('@/services/sensorService', () => ({
  getMockSensors: mockServices.getMockSensors
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

describe('useProjectData hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize data with filtered sensors and projects', () => {
    const { result } = renderHook(() => useProjectData());
    
    // Check if services were called
    expect(mockServices.getMockSensors).toHaveBeenCalled();
    expect(mockServices.getMockSensorFolders).toHaveBeenCalled();
    expect(mockServices.getCurrentUser).toHaveBeenCalled();
    
    // Check if loading state is set to false after initialization
    expect(result.current.isLoading).toBe(false);
    
    // Check if sensors are filtered
    expect(result.current.sensors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ folderId: expect.any(String) })
      ])
    );
  });

  it('should update sensor values periodically', () => {
    const { result } = renderHook(() => useProjectData());
    
    const initialSensors = [...result.current.sensors];
    
    // Fast-forward time by 5 seconds to trigger the interval
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // Sensor values should be updated
    const updatedSensors = result.current.sensors;
    expect(updatedSensors[0].values[0].value).not.toEqual(initialSensors[0].values[0].value);
    expect(updatedSensors[0].lastUpdated).not.toEqual(initialSensors[0].lastUpdated);
  });

  it('should provide state setters that work correctly', () => {
    const { result } = renderHook(() => useProjectData());
    
    // Test setSelectedSensor
    act(() => {
      result.current.setSelectedSensor({
        id: 'sensor-test',
        name: 'Test Sensor',
        values: [{ type: 'temperature', value: 22, unit: '°C' }],
        status: 'online',
        lastUpdated: '10:00:00'
      });
    });
    
    expect(result.current.selectedSensor).toEqual(expect.objectContaining({
      id: 'sensor-test',
      name: 'Test Sensor'
    }));
    
    // Test setSelectedProject
    act(() => {
      result.current.setSelectedProject({
        id: 'folder-test',
        name: 'Test Project',
        description: 'Test Description',
        companyId: 'company-001',
        createdAt: '2023-01-01',
        projectNumber: 'PRJ-2023-999',
        address: 'Test Address',
        assignedSensorIds: []
      });
    });
    
    expect(result.current.selectedProject).toEqual(expect.objectContaining({
      id: 'folder-test',
      name: 'Test Project'
    }));
  });
});
