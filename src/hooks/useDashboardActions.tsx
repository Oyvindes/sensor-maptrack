
import { toast } from "sonner";
import { getMockSensors, getMockTrackingObjects } from '@/services/sensorService';
import { getMockSensorFolders } from '@/services/folder/folderService';
import { getCurrentUser } from '@/services/authService';
import { SensorData } from "@/components/SensorCard";
import { TrackingObject } from "@/types/sensors";
import { SensorFolder } from "@/types/users";

export function useDashboardActions() {
  const currentUser = getCurrentUser();

  const handleRefresh = (
    setSensors: React.Dispatch<React.SetStateAction<SensorData[]>>,
    setTrackingObjects: React.Dispatch<React.SetStateAction<TrackingObject[]>>,
    setProjects: React.Dispatch<React.SetStateAction<SensorFolder[]>>
  ) => {
    toast.info("Refreshing data...");
    
    setTimeout(() => {
      const sensorsData = getMockSensors();
      const filteredSensors = sensorsData.filter(sensor => sensor.folderId);
      const projectsData = getMockSensorFolders();
      
      const filteredProjects = currentUser?.role === 'master' 
        ? projectsData 
        : projectsData.filter(project => project.companyId === currentUser?.companyId);
      
      setSensors(filteredSensors);
      setTrackingObjects(getMockTrackingObjects());
      setProjects(filteredProjects);
      toast.success("Data refreshed successfully");
    }, 1000);
  };

  return {
    handleRefresh
  };
}
