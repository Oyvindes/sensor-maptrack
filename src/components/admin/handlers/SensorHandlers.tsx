
import { SensorData } from "@/components/SensorCard";
import { getCurrentUser } from "@/services/authService";
import { toast } from "sonner";
import { saveSensor, deleteSensor } from "@/services/sensor/supabaseSensorService";

export interface SensorHandlers {
  handleSensorSelect: (sensor: SensorData & { folderId?: string; companyId?: string; imei?: string }) => void;
  handleSensorSave: (updatedSensor: SensorData & { folderId?: string; companyId?: string; imei?: string }) => void;
  handleSensorCancel: () => void;
  handleAddNewSensor: () => void;
  handleImportSensors: (sensors: (SensorData & { folderId?: string; companyId?: string; imei?: string })[]) => void;
  handleDeleteSensors: (sensorIdentifiers: { imei: string }[]) => void;
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
      companyId: sensor.companyId || "company-001", // Will be mapped to UUID in the service layer
      imei: sensor.imei || ""
    };
    
    setSelectedSensor(enhancedSensor);
    setMode("editSensor");
  };

  const handleSensorSave = async (updatedSensor: SensorData & { folderId?: string; companyId?: string; imei?: string }) => {
    // Check permissions again before saving
    if (!canEditSensor(updatedSensor)) {
      toast.error("You don't have permission to modify this sensor");
      return;
    }
    
    try {
      // Save to Supabase
      const result = await saveSensor(updatedSensor);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // Update local state
      if (result.data) {
        const isNew = !sensors.some(s => s.id === result.data?.id);
        
        if (isNew) {
          setSensors([...sensors, result.data]);
        } else {
          setSensors(
            sensors.map(s => s.id === result.data?.id ? result.data : s)
          );
        }
      }
      
      setMode("listSensors");
      setSelectedSensor(null);
      
      toast.success(result.message);
    } catch (error) {
      console.error('Error saving sensor:', error);
      toast.error('Failed to save sensor: ' + error.message);
    }
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
      id: `temp-${Date.now()}`,
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
  
  const handleImportSensors = async (importedSensors: (SensorData & { folderId?: string; companyId?: string; imei?: string })[]) => {
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
    
    // Save each new sensor to the database
    const savedSensors = [];
    const failedSensors = [];
    
    for (const sensor of newSensors) {
      try {
        const result = await saveSensor(sensor);
        if (result.success && result.data) {
          savedSensors.push(result.data);
        } else {
          failedSensors.push(sensor);
        }
      } catch (error) {
        console.error("Error saving imported sensor:", error);
        failedSensors.push(sensor);
      }
    }
    
    // Add the new sensors to the existing sensors
    if (savedSensors.length > 0) {
      setSensors(prevSensors => [...prevSensors, ...savedSensors]);
    }
    
    // Show success/error message
    if (savedSensors.length > 0) {
      toast.success(
        `Imported ${savedSensors.length} sensors successfully` + 
        (duplicates > 0 ? ` (${duplicates} duplicates skipped)` : "") +
        (failedSensors.length > 0 ? ` (${failedSensors.length} failed)` : "")
      );
    } else if (failedSensors.length > 0) {
      toast.error(`Failed to import ${failedSensors.length} sensors`);
    } else if (duplicates > 0) {
      toast.info(`All ${duplicates} sensors already exist in the database`);
    }
    
    setMode("listSensors");
  };

  const handleDeleteSensors = async (sensorIdentifiers: { imei: string }[]) => {
    if (!currentUser) {
      toast.error("You must be logged in to delete sensors");
      return;
    }

    if (sensorIdentifiers.length === 0) {
      toast.error("No sensor IMEIs provided for deletion");
      return;
    }

    // Find sensors matching the provided IMEIs
    const sensorsToDelete = sensors.filter(sensor =>
      sensor.imei && sensorIdentifiers.some(identifier => identifier.imei === sensor.imei)
    );

    if (sensorsToDelete.length === 0) {
      toast.error("No sensors found matching the provided IMEIs");
      return;
    }

    // Check permissions for all sensors
    const unauthorizedSensors = sensorsToDelete.filter(sensor => !canEditSensor(sensor));
    if (unauthorizedSensors.length > 0) {
      toast.error(`You don't have permission to delete ${unauthorizedSensors.length} sensors`);
      return;
    }

    // Delete each sensor
    const deletedSensors = [];
    const failedSensors = [];

    for (const sensor of sensorsToDelete) {
      try {
        const result = await deleteSensor(sensor.id);
        if (result.success) {
          deletedSensors.push(sensor);
        } else {
          failedSensors.push(sensor);
        }
      } catch (error) {
        console.error("Error deleting sensor:", error);
        failedSensors.push(sensor);
      }
    }

    // Update local state by removing deleted sensors
    if (deletedSensors.length > 0) {
      setSensors(prevSensors =>
        prevSensors.filter(s => !deletedSensors.some(ds => ds.id === s.id))
      );
    }

    // Show results
    if (deletedSensors.length > 0) {
      toast.success(
        `Deleted ${deletedSensors.length} sensors successfully` +
        (failedSensors.length > 0 ? ` (${failedSensors.length} failed)` : "")
      );
    } else if (failedSensors.length > 0) {
      toast.error(`Failed to delete ${failedSensors.length} sensors`);
    }

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
    handleImportSensors,
    handleDeleteSensors
  };
}
