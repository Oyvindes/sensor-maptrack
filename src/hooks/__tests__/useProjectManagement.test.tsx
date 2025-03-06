
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useProjectManagement } from '../useProjectManagement';
import { mockServices, mockToast } from '../../test/test-utils';
import { toast } from 'sonner';
import { SensorFolder } from '@/types/users';

// Mock the dependencies
vi.mock('@/services/authService', () => ({
  getCurrentUser: mockServices.getCurrentUser
}));

vi.mock('sonner', () => ({
  toast: mockToast()
}));

describe('useProjectManagement hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle adding a new project', () => {
    const { result } = renderHook(() => useProjectManagement());
    
    const setSelectedProject = vi.fn();
    const setEditingProject = vi.fn();
    
    act(() => {
      result.current.handleAddNewProject(setSelectedProject, setEditingProject);
    });
    
    // Check if setSelectedProject was called with a new project
    expect(setSelectedProject).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.stringContaining('temp-'),
      name: "",
      companyId: "company-001",
      projectNumber: expect.stringContaining('PRJ-')
    }));
    
    // Check if editing mode was enabled
    expect(setEditingProject).toHaveBeenCalledWith(true);
  });

  it('should handle saving a project - new project case', async () => {
    const { result } = renderHook(() => useProjectManagement());
    
    const newProject: SensorFolder = {
      id: 'temp-123',
      name: 'New Project',
      description: 'Test Description',
      companyId: 'company-001',
      createdAt: '2023-01-01',
      createdBy: 'user-001',
      creatorName: 'Test User',
      projectNumber: 'PRJ-2023-001',
      address: 'Test Address',
      assignedSensorIds: []
    };
    
    const projects: SensorFolder[] = [];
    const setProjects = vi.fn();
    const setIsUpdatingProject = vi.fn();
    const setEditingProject = vi.fn();
    const setSelectedProject = vi.fn();
    
    await act(async () => {
      await result.current.handleProjectSave(
        newProject,
        projects,
        setProjects,
        setIsUpdatingProject,
        setEditingProject,
        setSelectedProject
      );
    });
    
    // Check if updating state was set
    expect(setIsUpdatingProject).toHaveBeenCalledWith(true);
    
    // Check if the project was added to the projects list
    expect(setProjects).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'New Project' })
    ]));
    
    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Project created successfully');
    
    // Check if editing mode was disabled
    expect(setEditingProject).toHaveBeenCalledWith(false);
    expect(setSelectedProject).toHaveBeenCalledWith(null);
    
    // Check if updating state was reset
    expect(setIsUpdatingProject).toHaveBeenCalledWith(false);
  });

  it('should handle saving a project - update existing project case', async () => {
    const { result } = renderHook(() => useProjectManagement());
    
    const existingProject: SensorFolder = {
      id: 'folder-123',
      name: 'Existing Project',
      description: 'Old Description',
      companyId: 'company-001',
      createdAt: '2023-01-01',
      createdBy: 'user-001',
      creatorName: 'Test User',
      projectNumber: 'PRJ-2023-001',
      address: 'Old Address',
      assignedSensorIds: []
    };
    
    const updatedProject: SensorFolder = {
      ...existingProject,
      name: 'Updated Project',
      description: 'New Description',
      address: 'New Address'
    };
    
    const projects: SensorFolder[] = [existingProject];
    const setProjects = vi.fn();
    const setIsUpdatingProject = vi.fn();
    const setEditingProject = vi.fn();
    const setSelectedProject = vi.fn();
    
    await act(async () => {
      await result.current.handleProjectSave(
        updatedProject,
        projects,
        setProjects,
        setIsUpdatingProject,
        setEditingProject,
        setSelectedProject
      );
    });
    
    // Check if the project was updated in the projects list
    expect(setProjects).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'Updated Project' })
    ]));
    
    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Project updated successfully');
  });
});
