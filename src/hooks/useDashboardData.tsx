
import { useNavigate } from "react-router-dom";
import { SensorFolder } from "@/types/users";
import { useProjectData } from "./useProjectData";
import { useTrackingObjects } from "./useTrackingObjects";
import { useSensorInteractions } from "./useSensorInteractions";
import { useProjectManagement } from "./useProjectManagement";
import { useDashboardActions } from "./useDashboardActions";

export function useDashboardData() {
  const navigate = useNavigate();
  
  // Use our smaller hooks
  const {
    sensors,
    projects,
    isLoading,
    selectedSensor,
    selectedProject,
    editingProject,
    isUpdatingProject,
    setSensors,
    setProjects,
    setSelectedSensor,
    setSelectedProject,
    setEditingProject,
    setIsUpdatingProject
  } = useProjectData();
  
  const { trackingObjects, setTrackingObjects, handleObjectSelect } = useTrackingObjects();
  const { handleSensorClick } = useSensorInteractions();
  const {
    handleProjectSave: projectSaveHandler,
    handleAddNewProject: addNewProjectHandler,
    handleProjectStatusChange: projectStatusHandler
  } = useProjectManagement();
  const { handleRefresh: refreshHandler } = useDashboardActions();

  // Wrapper functions to maintain the same API for consumers
  const handleProjectSelect = (project: SensorFolder) => {
    console.log("Project selected:", project.id);
    setSelectedProject(project);
    setEditingProject(true);
  };

  const handleProjectSave = async (updatedProject: SensorFolder) => {
    await projectSaveHandler(
      updatedProject, 
      projects, 
      setProjects, 
      setIsUpdatingProject, 
      setEditingProject, 
      setSelectedProject
    );
  };

  const handleProjectCancel = () => {
    setSelectedProject(null);
    setEditingProject(false);
  };

  const handleAddNewProject = () => {
    addNewProjectHandler(setSelectedProject, setEditingProject);
  };

  const handleRefresh = () => {
    refreshHandler(setSensors, setTrackingObjects, setProjects);
  };

  const handleProjectStatusChange = async (projectId: string, status: "running" | "stopped") => {
    const success = await projectStatusHandler(projectId, status, projects, setProjects);
    return success;
  };

  return {
    sensors,
    trackingObjects,
    projects,
    isLoading,
    selectedSensor,
    selectedProject,
    editingProject,
    isUpdatingProject,
    handleSensorClick,
    handleObjectSelect,
    handleProjectSelect,
    handleProjectSave,
    handleProjectCancel,
    handleAddNewProject,
    handleRefresh,
    handleProjectStatusChange
  };
}
