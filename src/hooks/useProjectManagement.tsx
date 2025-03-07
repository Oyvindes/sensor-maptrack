
import { toast } from "sonner";
import { SensorFolder } from "@/types/users";
import { getCurrentUser } from '@/services/authService';

export function useProjectManagement() {
  const currentUser = getCurrentUser();

  const handleProjectSave = async (
    updatedProject: SensorFolder,
    projects: SensorFolder[],
    setProjects: React.Dispatch<React.SetStateAction<SensorFolder[]>>,
    setIsUpdatingProject: React.Dispatch<React.SetStateAction<boolean>>,
    setEditingProject: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedProject: React.Dispatch<React.SetStateAction<SensorFolder | null>>
  ) => {
    setIsUpdatingProject(true);

    try {
      // Simulate an API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if we're editing an existing project or creating a new one
      if (projects.some(p => p.id === updatedProject.id)) {
        setProjects(
          projects.map(project => 
            project.id === updatedProject.id ? updatedProject : project
          )
        );
        toast.success('Project updated successfully');
      } else {
        // Create new project with a real ID
        const newProject = {
          ...updatedProject,
          id: `folder-${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        setProjects([...projects, newProject]);
        toast.success('Project created successfully');
      }

      setEditingProject(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setIsUpdatingProject(false);
    }
  };

  const handleAddNewProject = (setSelectedProject: React.Dispatch<React.SetStateAction<SensorFolder | null>>, setEditingProject: React.Dispatch<React.SetStateAction<boolean>>) => {
    const newProject: SensorFolder = {
      id: `temp-${Date.now()}`,
      name: "",
      description: "",
      companyId: currentUser?.companyId || "",
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser?.id,
      creatorName: currentUser?.name,
      projectNumber: `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      address: "",
      assignedSensorIds: []
    };
    
    setSelectedProject(newProject);
    setEditingProject(true);
  };

  const handleProjectStatusChange = async (
    projectId: string,
    newStatus: "running" | "stopped",
    projects: SensorFolder[],
    setProjects: React.Dispatch<React.SetStateAction<SensorFolder[]>>
  ) => {
    try {
      // Update the project status
      const updatedProjects = projects.map(project =>
        project.id === projectId
          ? {
              ...project,
              status: newStatus,
              startedAt: newStatus === "running" ? new Date().toISOString() : undefined
            }
          : project
      );
      
      setProjects(updatedProjects);
      return true;
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Failed to update project status');
      return false;
    }
  };

  return {
    handleProjectSave,
    handleAddNewProject,
    handleProjectStatusChange
  };
}
