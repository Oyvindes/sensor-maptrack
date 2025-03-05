
import React from "react";
import { SensorData } from "@/components/SensorCard";
import SensorList from "@/components/admin/SensorList";
import SensorEditor from "@/components/SensorEditor";

interface SensorsTabProps {
  mode: string;
  sensors: (SensorData & { folderId?: string; companyId?: string })[];
  selectedSensor: (SensorData & { folderId?: string; companyId?: string }) | null;
  onSensorSelect: (sensor: SensorData & { folderId?: string }) => void;
  onSensorSave: (sensor: SensorData & { folderId?: string; companyId?: string }) => void;
  onSensorCancel: () => void;
  onAddNewSensor: () => void;
}

const SensorsTab: React.FC<SensorsTabProps> = ({
  mode,
  sensors,
  selectedSensor,
  onSensorSelect,
  onSensorSave,
  onSensorCancel,
  onAddNewSensor
}) => {
  return (
    <>
      {mode === "listSensors" && (
        <SensorList
          sensors={sensors}
          onSensorSelect={onSensorSelect}
          onAddNew={onAddNewSensor}
        />
      )}
      {mode === "editSensor" && selectedSensor && (
        <SensorEditor
          sensor={selectedSensor}
          onSave={onSensorSave}
          onCancel={onSensorCancel}
        />
      )}
    </>
  );
};

export default SensorsTab;
