
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useSensorInteractions } from '../useSensorInteractions';
import { mockServices, mockToast } from '../../test/test-utils';
import { toast } from 'sonner';
import { SensorType } from '@/components/SensorCard';

// Mock the dependencies
vi.mock('@/services/sensorService', () => ({
  sendCommandToSensor: mockServices.sendCommandToSensor
}));

vi.mock('sonner', () => ({
  toast: mockToast()
}));

describe('useSensorInteractions hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle sensor click and show success toast', async () => {
    const { result } = renderHook(() => useSensorInteractions());
    
    const testSensor = {
      id: 'sensor-001',
      name: 'Test Sensor',
      values: [{ type: 'temperature' as SensorType, value: 22, unit: '°C' }],
      status: 'online',
      lastUpdated: '10:00:00'
    };

    await act(async () => {
      await result.current.handleSensorClick(testSensor);
    });

    expect(mockServices.sendCommandToSensor).toHaveBeenCalledWith('sensor-001', 'get_status');
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Connected to Test Sensor'), expect.any(Object));
  });

  it('should handle errors and show error toast', async () => {
    // Mock the sendCommandToSensor to throw an error
    mockServices.sendCommandToSensor.mockRejectedValueOnce(new Error('Connection failed'));
    
    const { result } = renderHook(() => useSensorInteractions());
    
    const testSensor = {
      id: 'sensor-001',
      name: 'Test Sensor',
      values: [{ type: 'temperature' as SensorType, value: 22, unit: '°C' }],
      status: 'online',
      lastUpdated: '10:00:00'
    };

    await act(async () => {
      await result.current.handleSensorClick(testSensor);
    });

    expect(mockServices.sendCommandToSensor).toHaveBeenCalledWith('sensor-001', 'get_status');
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Failed to connect to Test Sensor'));
  });
});
