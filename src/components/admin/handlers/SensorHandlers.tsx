
import { SensorData } from "@/components/SensorCard";
import { getCurrentUser } from "@/services/authService";
import { toast } from "sonner";

export interface SensorHandlers {
  handleSensorSelect: (sensor: SensorData & { folderId?: string; companyId?: string }) => void;
  handleSensorSave: (updatedSensor: SensorData & { folderId?: string; companyId?: string }) => void;
  handleSensorCancel: () => void;
  handleAddNewSensor: () => void;
}

export function useSensorHandlers(
  sensors: (SensorData & { folderId?: string; companyId?: string })[],
  setSensors: React.Dispatch<React.SetStateAction<(SensorData & { folderId?: string; companyId?: string })[]>>,
  setSelectedSensor: React.Dispatch<React.SetStateAction<(SensorData & { folderId?: string; companyId?: string }) | null>>,
  setMode: React.Dispatch<React.SetStateAction<string>>,
  companies: { id: string }[]
): SensorHandlers {
  const currentUser = getCurrentUser();
  
  const handleSensorSelect = (sensor: SensorData & { folderId?: string; companyId?: string }) => {
    // Check if user has permissions for this sensor
    if (!canEditSensor(sensor)) {
      toast.error("You don't have permission to edit this sensor");
      return;
    }
    
    const enhancedSensor = {
      ...sensor,
      values: sensor.values || [{
        type: "temperature",
        value: 0,
        unit: "°C"
      }],
      companyId: sensor.companyId || "company-001"
    };
    
    setSelectedSensor(enhancedSensor);
    setMode("editSensor");
  };

  const handleSensorSave = (updatedSensor: SensorData & { folderId?: string; companyId?: string }) => {
    // Check permissions again before saving
    if (!canEditSensor(updatedSensor)) {
      toast.error("You don't have permission to modify this sensor");
      return;
    }
    
    setSensors(sensors.map(s => s.id === updatedSensor.id ? updatedSensor : s));
    setMode("listSensors");
    setSelectedSensor(null);
  };

  const handleSensorCancel = () => {
    setMode("listSensors");
    setSelectedSensor(null);
  };

  const handleAddNewSensor = () => {
    if (!currentUser) {
      toast.error("You must be logged in to create sensors");
      return;
    }
    
    // For new sensors, set the company ID to the user's company
    const companyId = currentUser.role === 'master' 
      ? (companies[0]?.id || "system") 
      : currentUser.companyId;
    
    setSelectedSensor({
      id: `sensor-${Date.now().toString().slice(-3)}`,
      name: "",
      values: [{
        type: "temperature",
        value: 0,
        unit: "°C"
      }],
      status: "online",
      lastUpdated: new Date().toLocaleTimeString(),
      companyId: companyId
    });
    setMode("editSensor");
  };
  
  // Helper function to check if user can edit a specific sensor
  const canEditSensor = (sensor: SensorData & { folderId?: string; companyId?: string }): boolean => {
    if (!currentUser) return false;
    
    // Site-wide admins can edit any sensor
    if (currentUser.role === 'master') return true;
    
    // Company admins can edit sensors in their company
    if (currentUser.role === 'admin' && sensor.companyId === currentUser.companyId) return true;
    
    // Regular users can edit sensors in their company
    return sensor.companyId === currentUser.companyId;
  };

  return {
    handleSensorSelect,
    handleSensorSave,
    handleSensorCancel,
    handleAddNewSensor
  };
}
