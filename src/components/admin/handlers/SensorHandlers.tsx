
import { SensorData } from "@/components/SensorCard";

export interface SensorHandlers {
  handleSensorSelect: (sensor: SensorData & { folderId?: string }) => void;
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
  
  const handleSensorSelect = (sensor: SensorData & { folderId?: string }) => {
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
    setSensors(sensors.map(s => s.id === updatedSensor.id ? updatedSensor : s));
    setMode("listSensors");
    setSelectedSensor(null);
  };

  const handleSensorCancel = () => {
    setMode("listSensors");
    setSelectedSensor(null);
  };

  const handleAddNewSensor = () => {
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
      companyId: companies[0]?.id || "system"
    });
    setMode("editSensor");
  };

  return {
    handleSensorSelect,
    handleSensorSave,
    handleSensorCancel,
    handleAddNewSensor
  };
}
