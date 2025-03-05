
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TrackingObject } from "@/types/sensors";
import { SensorData } from "@/components/SensorCard";
import { SensorFolder } from "@/types/users"; 
import { 
  getMockSensors, 
  getMockTrackingObjects,
  sendCommandToSensor 
} from '@/services/sensorService';
import { getMockSensorFolders } from '@/services/folder/folderService';
import { getCurrentUser } from '@/services/authService';
import { useNavigate } from "react-router-dom";

export function useDashboardData() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [trackingObjects, setTrackingObjects] = useState<TrackingObject[]>([]);
  const [projects, setProjects] = useState<SensorFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sensorsData = getMockSensors();
        const objectsData = getMockTrackingObjects();
        const projectsData = getMockSensorFolders();
        
        // Filter out sensors that don't have a folderId
        const filteredSensors = sensorsData.filter(sensor => sensor.folderId);
        
        // Filter projects based on user's company if not master admin
        const filteredProjects = currentUser?.role === 'master' 
          ? projectsData 
          : projectsData.filter(project => project.companyId === currentUser?.companyId);
        
        setSensors(filteredSensors);
        setTrackingObjects(objectsData);
        setProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    const interval = setInterval(() => {
      setSensors(prev => 
        prev.map(sensor => ({
          ...sensor,
          values: sensor.values.map(value => ({
            ...value,
            value: value.type === "temperature" 
              ? parseFloat((value.value + (Math.random() * 0.4 - 0.2)).toFixed(1))
              : value.type === "humidity"
              ? parseFloat((value.value + (Math.random() * 2 - 1)).toFixed(1))
              : value.type === "battery"
              ? Math.max(0, Math.min(100, value.value - Math.random() * 0.5))
              : parseFloat((value.value + (Math.random() * 2 - 1)).toFixed(1)),
          })),
          lastUpdated: new Date().toLocaleTimeString()
        }))
      );
      
      setTrackingObjects(prev => 
        prev.map(obj => ({
          ...obj,
          position: {
            lat: obj.position.lat + (Math.random() * 0.002 - 0.001),
            lng: obj.position.lng + (Math.random() * 0.002 - 0.001)
          },
          lastUpdated: new Date().toLocaleTimeString()
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleSensorClick = async (sensor: SensorData) => {
    setSelectedSensor(sensor);
    
    try {
      const result = await sendCommandToSensor(sensor.id, "get_status");
      if (result.success) {
        toast.success(`Connected to ${sensor.name}`, {
          description: "Real-time data monitoring enabled"
        });
      }
    } catch (error) {
      toast.error(`Failed to connect to ${sensor.name}`);
    }
  };

  const handleProjectSelect = (project: SensorFolder) => {
    console.log("Navigating to admin for project:", project.id);
    // Navigate to admin page and set the folder tab and selected folder
    navigate('/admin');
    
    // Store the selected project ID in sessionStorage so we can select it after navigation
    sessionStorage.setItem('selectedProjectId', project.id);
    sessionStorage.setItem('adminActiveTab', 'folders');
    
    toast.info(`Opening project: ${project.name}`, {
      description: 'Redirecting to project details'
    });
  };

  const handleObjectSelect = (object: TrackingObject) => {
    toast.info(`${object.name} selected`, {
      description: `Speed: ${object.speed}mph, Battery: ${object.batteryLevel}%`
    });
  };

  const handleRefresh = () => {
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
    sensors,
    trackingObjects,
    projects,
    isLoading,
    selectedSensor,
    handleSensorClick,
    handleObjectSelect,
    handleProjectSelect,
    handleRefresh
  };
}
