
import { toast } from "sonner";
import { SensorFolder } from "@/types/users";
import { getCurrentUser } from '@/services/authService';
import { useState } from "react";

export function useProjectManagement() {
  const [isGeneratingReportOnStop, setIsGeneratingReportOnStop] = useState(false);
  const [selectedDataTypesForReport, setSelectedDataTypesForReport] = useState<string[]>([]);
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

  // Set default data types for automatic PDF reports (when stopping projects)
  const setDefaultDataTypes = (dataTypes: string[]) => {
    setSelectedDataTypesForReport(dataTypes);
  };

  const handleProjectStatusChange = async (
    projectId: string,
    newStatus: "running" | "stopped",
    projects: SensorFolder[],
    setProjects: React.Dispatch<React.SetStateAction<SensorFolder[]>>,
    dataTypesToInclude?: string[]
  ) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Update the project status
      const updatedProjects = projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              status: newStatus,
              startedAt: newStatus === "running" ? new Date().toISOString() : undefined,
              stoppedAt: newStatus === "stopped" ? new Date().toISOString() : undefined
            }
          : p
      );
      
      setProjects(updatedProjects);

      // Generate and download PDF report when stopping a project
      if (newStatus === "stopped") {
        setIsGeneratingReportOnStop(true);
        try {
          const { downloadProjectReport } = await import('@/services/pdfService');
          const updatedProject = updatedProjects.find(p => p.id === projectId);
          
          if (updatedProject) {
            // Use provided data types, selected data types, or all data types
            const dataTypes = dataTypesToInclude ||
                             selectedDataTypesForReport.length > 0 ?
                             selectedDataTypesForReport :
                             ['temperature', 'humidity', 'battery', 'signal'];
            
            const projectWithHistory = await downloadProjectReport(updatedProject, dataTypes);
            
            // Update project with the new PDF history
            const finalUpdatedProjects = updatedProjects.map(p =>
              p.id === projectId ? projectWithHistory : p
            );
            
            setProjects(finalUpdatedProjects);
            toast.success('Project report generated successfully');
          }
        } catch (error) {
          console.error('Error generating PDF on project stop:', error);
          toast.error('Failed to generate project report');
        } finally {
          setIsGeneratingReportOnStop(false);
        }
      }

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
    handleProjectStatusChange,
    setDefaultDataTypes,
    isGeneratingReportOnStop
  };
}
