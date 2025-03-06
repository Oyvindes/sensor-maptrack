
import React from "react";
import { SensorData } from "@/components/SensorCard";
import SensorList from "@/components/admin/SensorList";
import SensorEditor from "@/components/sensor-editor/SensorEditor";
import SensorImporter from "@/components/admin/sensor-import/SensorImporter";
import { Company } from "@/types/users";

interface SensorsTabProps {
  mode: string;
  sensors: (SensorData & { folderId?: string; companyId?: string; imei?: string })[];
  selectedSensor: (SensorData & { folderId?: string; companyId?: string; imei?: string }) | null;
  companies?: Company[];
  onSensorSelect: (sensor: SensorData & { folderId?: string; imei?: string }) => void;
  onSensorSave: (sensor: SensorData & { folderId?: string; companyId?: string; imei?: string }) => void;
  onSensorCancel: () => void;
  onAddNewSensor: () => void;
  onImportSensors?: (sensors: (SensorData & { folderId?: string; companyId?: string; imei?: string })[]) => void;
}

const SensorsTab: React.FC<SensorsTabProps> = ({
  mode,
  sensors,
  selectedSensor,
  companies = [],
  onSensorSelect,
  onSensorSave,
  onSensorCancel,
  onAddNewSensor,
  onImportSensors
}) => {
  return (
    <>
      {mode === "listSensors" && (
        <SensorList
          sensors={sensors}
          onSensorSelect={onSensorSelect}
          onAddNew={onAddNewSensor}
          onImport={() => onImportSensors ? onImportSensors([]) : null}
        />
      )}
      {mode === "editSensor" && selectedSensor && (
        <SensorEditor
          sensor={selectedSensor}
          companies={companies}
          onSave={onSensorSave}
          onCancel={onSensorCancel}
        />
      )}
      {mode === "importSensors" && (
        <SensorImporter
          companies={companies}
          onSensorsImport={sensors => onImportSensors ? onImportSensors(sensors) : null}
          onCancel={onSensorCancel}
        />
      )}
    </>
  );
};

export default SensorsTab;
