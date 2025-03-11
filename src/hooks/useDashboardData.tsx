
import { useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { TrackingObject } from "@/types/sensors";
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
  
  const [trackingObjects, setTrackingObjects] = useState<TrackingObject[]>([]);
  const { devices, isLoading: trackingLoading } = useTrackingObjects();
  const { handleSensorClick } = useSensorInteractions();

  // Update trackingObjects when devices change
  useEffect(() => {
    // Map devices to tracking objects with all required properties
    const mappedObjects = devices.map(device => ({
      ...device,
      position: { lat: 0, lng: 0 },
      speed: 0,
      direction: 0,
      batteryLevel: 100,
      lastUpdated: device.lastUpdated || new Date().toISOString()
    }));
    setTrackingObjects(mappedObjects);
  }, [devices]);

  const handleObjectSelect = useCallback((object: TrackingObject) => {
    // Add any object selection logic here if needed
    console.log('Object selected:', object);
  }, []);
  const {
    handleProjectSave: projectSaveHandler,
    handleAddNewProject: addNewProjectHandler,
    handleProjectStatusChange: projectStatusHandler,
    handleProjectDelete: projectDeleteHandler,
    setDefaultDataTypes,
    isGeneratingReportOnStop
  } = useProjectManagement();
  const { handleRefresh: refreshHandler } = useDashboardActions();

  // Wrapper functions to maintain the same API for consumers
  const [viewingSensorData, setViewingSensorData] = useState(false);

  const handleProjectSelect = (project: SensorFolder) => {
    console.log("Project selected:", project.id);
    setSelectedProject(project);
    
    if (project.status === "running") {
      setViewingSensorData(true);
      setEditingProject(false);
    } else {
      setViewingSensorData(false);
      setEditingProject(true);
    }
  };

  const handleCloseGraphs = () => {
    setViewingSensorData(false);
    setSelectedProject(null);
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
    // The useEffect hook will handle mapping devices to trackingObjects when they update
  };

  const handleProjectStatusChange = async (projectId: string, status: "running" | "stopped") => {
    const success = await projectStatusHandler(projectId, status, projects, setProjects);
    return success;
  };

  const handleProjectDelete = async (projectId: string) => {
    await projectDeleteHandler(projectId, projects, setProjects, setSelectedProject);
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
    handleProjectStatusChange,
    viewingSensorData,
    handleCloseGraphs,
    setDefaultDataTypes,
    isGeneratingReportOnStop,
    handleProjectDelete
  };
}
