
import { SensorData } from "@/components/SensorCard";
import { getCurrentUser } from "@/services/authService";
import { toast } from "sonner";

export interface SensorHandlers {
  handleSensorSelect: (sensor: SensorData & { folderId?: string; companyId?: string; imei?: string }) => void;
  handleSensorSave: (updatedSensor: SensorData & { folderId?: string; companyId?: string; imei?: string }) => void;
  handleSensorCancel: () => void;
  handleAddNewSensor: () => void;
  handleImportSensors: (sensors: (SensorData & { folderId?: string; companyId?: string; imei?: string })[]) => void;
}

export function useSensorHandlers(
  sensors: (SensorData & { folderId?: string; companyId?: string; imei?: string })[],
  setSensors: React.Dispatch<React.SetStateAction<(SensorData & { folderId?: string; companyId?: string; imei?: string })[]>>,
  setSelectedSensor: React.Dispatch<React.SetStateAction<(SensorData & { folderId?: string; companyId?: string; imei?: string }) | null>>,
  setMode: React.Dispatch<React.SetStateAction<string>>,
  companies: { id: string }[]
): SensorHandlers {
  const currentUser = getCurrentUser();
  
  const handleSensorSelect = (sensor: SensorData & { folderId?: string; companyId?: string; imei?: string }) => {
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
      companyId: sensor.companyId || "company-001",
      imei: sensor.imei || ""
    };
    
    setSelectedSensor(enhancedSensor);
    setMode("editSensor");
  };

  const handleSensorSave = (updatedSensor: SensorData & { folderId?: string; companyId?: string; imei?: string }) => {
    // Check permissions again before saving
    if (!canEditSensor(updatedSensor)) {
      toast.error("You don't have permission to modify this sensor");
      return;
    }
    
    setSensors(prevSensors => {
      // Check if we're updating an existing sensor
      const existingIndex = prevSensors.findIndex(s => s.id === updatedSensor.id);
      
      if (existingIndex >= 0) {
        // Update existing sensor
        const newSensors = [...prevSensors];
        newSensors[existingIndex] = updatedSensor;
        return newSensors;
      } else {
        // Add new sensor
        return [...prevSensors, updatedSensor];
      }
    });
    
    setMode("listSensors");
    setSelectedSensor(null);
    
    toast.success(`Sensor ${updatedSensor.name} saved successfully`);
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
  
  const handleImportSensors = (importedSensors: (SensorData & { folderId?: string; companyId?: string; imei?: string })[]) => {
    if (!currentUser) {
      toast.error("You must be logged in to import sensors");
      return;
    }
    
    if (importedSensors.length === 0) {
      // If no sensors provided, we're just starting the import process
      setMode("importSensors");
      return;
    }
    
    // Check if any of the imported sensors already exist
    const existingImeis = sensors
      .filter(s => s.imei)
      .map(s => s.imei);
    
    const newSensors = importedSensors.filter(s => !existingImeis.includes(s.imei));
    const duplicates = importedSensors.length - newSensors.length;
    
    // Add the new sensors to the existing sensors
    setSensors(prevSensors => [...prevSensors, ...newSensors]);
    
    // Show success message
    toast.success(
      `Imported ${newSensors.length} sensors successfully` + 
      (duplicates > 0 ? ` (${duplicates} duplicates skipped)` : "")
    );
    
    setMode("listSensors");
  };
  
  // Helper function to check if user can edit a specific sensor
  const canEditSensor = (sensor: SensorData & { folderId?: string; companyId?: string; imei?: string }): boolean => {
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
    handleAddNewSensor,
    handleImportSensors
  };
}
