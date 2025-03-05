
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSensorData } from "./useSensorData";
import { useTrackingObjects } from "./useTrackingObjects";
import { useProjects } from "./useProjects";
import { useDashboardActions } from "./useDashboardActions";
import { toast } from "sonner";
import { SensorData } from "@/components/SensorCard";
import { TrackingObject } from "@/types/sensors";
import { SensorFolder } from "@/types/users";
import { 
  getMockSensors, 
  getMockTrackingObjects
} from '@/services/sensorService';
import { getMockSensorFolders } from '@/services/folder/folderService';
import { getCurrentUser } from '@/services/authService';

export function useDashboardData() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // Use our new custom hooks
  const { sensors, selectedSensor, handleSensorClick } = useSensorData();
  const { trackingObjects, handleObjectSelect } = useTrackingObjects();
  const { 
    projects, 
    selectedProject, 
    editingProject, 
    isUpdatingProject,
    handleProjectSelect,
    handleProjectSave,
    handleProjectCancel,
    handleAddNewProject
  } = useProjects();
  const { handleRefresh: refreshAction } = useDashboardActions();

  // Override refresh function to update loading state
  const handleRefresh = () => {
    setIsLoading(true);
    
    toast.info("Refreshing data...");
    
    setTimeout(() => {
      const sensorsData = getMockSensors();
      const filteredSensors = sensorsData.filter(sensor => sensor.folderId);
      const projectsData = getMockSensorFolders();
      
      const filteredProjects = currentUser?.role === 'master' 
        ? projectsData 
        : projectsData.filter(project => project.companyId === currentUser?.companyId);
      
      setIsLoading(false);
      toast.success("Data refreshed successfully");
    }, 1000);
  };

  // Initialize loading state (mimicking the original useEffect behavior)
  if (isLoading && sensors.length > 0 && trackingObjects.length > 0 && projects.length > 0) {
    setIsLoading(false);
  }

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
    handleRefresh
  };
}
