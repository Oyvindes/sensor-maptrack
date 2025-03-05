
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SensorFolder } from "@/types/users";
import { getMockSensorFolders } from '@/services/folder/folderService';
import { getCurrentUser } from '@/services/authService';

export function useProjects() {
  const [projects, setProjects] = useState<SensorFolder[]>([]);
  const [selectedProject, setSelectedProject] = useState<SensorFolder | null>(null);
  const [editingProject, setEditingProject] = useState(false);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = getMockSensorFolders();
        
        // Filter projects based on user's company if not master admin
        const filteredProjects = currentUser?.role === 'master' 
          ? projectsData 
          : projectsData.filter(project => project.companyId === currentUser?.companyId);
        
        setProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load project data");
      }
    };

    fetchProjects();
  }, [currentUser]);

  const handleProjectSelect = (project: SensorFolder) => {
    console.log("Project selected:", project.id);
    setSelectedProject(project);
    setEditingProject(true);
  };

  const handleProjectSave = async (updatedProject: SensorFolder) => {
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

  const handleProjectCancel = () => {
    setSelectedProject(null);
    setEditingProject(false);
  };

  const handleAddNewProject = () => {
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

  return {
    projects,
    selectedProject,
    editingProject,
    isUpdatingProject,
    handleProjectSelect,
    handleProjectSave,
    handleProjectCancel,
    handleAddNewProject
  };
}
