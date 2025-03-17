import React, { useMemo } from "react";
import { SensorData } from "@/components/SensorCard";
import SensorList from "@/components/admin/SensorList";
import SensorEditor from "@/components/sensor-editor/SensorEditor";
import SensorImporter from "@/components/admin/sensor-import/SensorImporter";
import DeleteSensorsImporter from "@/components/admin/sensor-import/DeleteSensorsImporter";
import { Company, User } from "@/types/users";
import { filterSensorsByCompany } from "@/utils/authUtils";

type SetMode = React.Dispatch<React.SetStateAction<string>>;

interface SensorsTabProps {
  setMode: SetMode;
  mode: string;
  sensors: (SensorData & { folderId?: string; companyId?: string; imei?: string })[];
  selectedSensor: (SensorData & { folderId?: string; companyId?: string; imei?: string }) | null;
  companies?: Company[];
  onSensorSelect: (sensor: SensorData & { folderId?: string; imei?: string }) => void;
  onSensorSave: (sensor: SensorData & { folderId?: string; companyId?: string; imei?: string }) => void;
  onSensorCancel: () => void;
  onAddNewSensor: () => void;
  onImportSensors?: (sensors: (SensorData & { folderId?: string; companyId?: string; imei?: string })[]) => void;
  onDeleteByCsv?: (sensorIdentifiers: { id?: string; imei?: string }[]) => void;
  currentUser: User | null;
}

const SensorsTab: React.FC<SensorsTabProps> = ({
  mode,
  setMode,
  sensors,
  selectedSensor,
  companies = [],
  onSensorSelect,
  onSensorSave,
  onSensorCancel,
  onAddNewSensor,
  onImportSensors,
  onDeleteByCsv,
  currentUser
}) => {
  // Filter sensors by company for non-master users
  const filteredSensors = useMemo(() => {
    return filterSensorsByCompany(sensors, currentUser);
  }, [sensors, currentUser]);
  return (
    <>
      {mode === "listSensors" && (
        <SensorList
          sensors={filteredSensors}
          onSensorSelect={onSensorSelect}
          onAddNew={onAddNewSensor}
          onImport={() => onImportSensors ? onImportSensors([]) : null}
          onDelete={() => {
            if (onDeleteByCsv && setMode) {
              setMode("deleteSensors");
            }
          }}
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
      {mode === "deleteSensors" && (
        <DeleteSensorsImporter
          onSensorsDelete={sensorIdentifiers => onDeleteByCsv ? onDeleteByCsv(sensorIdentifiers) : null}
          onCancel={onSensorCancel}
        />
      )}
    </>
  );
};

export default SensorsTab;
