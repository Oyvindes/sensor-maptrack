
import { toast } from "sonner";
import { getMockSensors, getMockTrackingObjects } from '@/services/sensorService';
import { getMockSensorFolders } from '@/services/folder/folderService';
import { getCurrentUser } from '@/services/authService';

export function useDashboardActions() {
  const currentUser = getCurrentUser();

  const handleRefresh = () => {
    toast.info("Refreshing data...");
    
    setTimeout(() => {
      const sensorsData = getMockSensors();
      const filteredSensors = sensorsData.filter(sensor => sensor.folderId);
      const projectsData = getMockSensorFolders();
      
      const filteredProjects = currentUser?.role === 'master' 
        ? projectsData 
        : projectsData.filter(project => project.companyId === currentUser?.companyId);
      
      toast.success("Data refreshed successfully");
      
      // Return the refreshed data
      return {
        sensors: filteredSensors,
        trackingObjects: getMockTrackingObjects(),
        projects: filteredProjects
      };
    }, 1000);
  };

  return {
    handleRefresh
  };
}
