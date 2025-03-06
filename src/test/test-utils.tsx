
import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom renderer that includes providers
export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: BrowserRouter });
}

// Helper to mock the toast functions
export function mockToast() {
  return {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  };
}

// Mock services used by the hooks
export const mockServices = {
  getCurrentUser: vi.fn().mockReturnValue({
    id: 'user-001',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    companyId: 'company-001'
  }),
  getMockSensors: vi.fn().mockReturnValue([
    {
      id: 'sensor-001',
      name: 'Test Sensor 1',
      values: [{ type: 'temperature', value: 22, unit: '°C' }],
      status: 'online',
      lastUpdated: '10:00:00',
      folderId: 'folder-001',
      companyId: 'company-001'
    }
  ]),
  getMockTrackingObjects: vi.fn().mockReturnValue([
    {
      id: 'tracking-001',
      name: 'Test Tracking Object',
      position: { lat: 0, lng: 0 },
      lastUpdated: '10:00:00',
      speed: 0,
      direction: 0,
      batteryLevel: 100
    }
  ]),
  getMockSensorFolders: vi.fn().mockReturnValue([
    {
      id: 'folder-001',
      name: 'Test Folder',
      description: 'Test Description',
      companyId: 'company-001',
      createdAt: '2023-01-01',
      projectNumber: 'PRJ-2023-001',
      address: 'Test Address',
      assignedSensorIds: ['sensor-001']
    }
  ]),
  sendCommandToSensor: vi.fn().mockResolvedValue({
    success: true,
    message: 'Command sent successfully'
  })
};
