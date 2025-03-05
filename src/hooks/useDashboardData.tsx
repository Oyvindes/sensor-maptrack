
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
  const [selectedProject, setSelectedProject] = useState<SensorFolder | null>(null);
  const [editingProject, setEditingProject] = useState(false);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
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
