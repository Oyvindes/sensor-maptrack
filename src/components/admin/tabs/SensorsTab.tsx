import React, { useMemo } from "react";
import { SensorData } from "@/components/SensorCard";
import SensorList from "@/components/admin/SensorList";
import SensorEditor from "@/components/sensor-editor/SensorEditor";
import PowerSensorEditorWrapper from "@/components/sensor-editor/PowerSensorEditorWrapper";
import SensorImporter from "@/components/admin/sensor-import/SensorImporter";
import PowerSensorImporter from "@/components/admin/power-import/PowerSensorImporter";
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
          onAddNewPower={() => {
            // Create a new power sensor template
            const newPowerSensor: SensorData & { folderId?: string; companyId?: string; imei?: string } = {
              id: `sensor-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: 'New Smart Plug',
              status: 'offline',
              values: [],
              lastUpdated: new Date().toLocaleString(),
              sensorType: 'power' as 'power'
            };
            
            // Select the new sensor and switch to edit mode
            onSensorSelect(newPowerSensor);
            setMode("editSensor");
          }}
          onImport={() => onImportSensors ? onImportSensors([]) : null}
          onImportPower={() => setMode("importPowerSensors")}
          onDelete={() => {
            if (onDeleteByCsv && setMode) {
              setMode("deleteSensors");
            }
          }}
          currentUser={currentUser}
        />
      )}
      {mode === "editSensor" && selectedSensor && (
        selectedSensor.sensorType === 'power' ? (
          <PowerSensorEditorWrapper
            sensor={selectedSensor}
            companies={companies}
            onSave={onSensorSave}
            onCancel={onSensorCancel}
          />
        ) : (
          <SensorEditor
            sensor={selectedSensor}
            companies={companies}
            onSave={onSensorSave}
            onCancel={onSensorCancel}
          />
        )
      )}
      {mode === "importSensors" && (
        <SensorImporter
          companies={companies}
          onSensorsImport={sensors => onImportSensors ? onImportSensors(sensors) : null}
          onCancel={onSensorCancel}
        />
      )}
      {mode === "importPowerSensors" && (
        <PowerSensorImporter
          companies={companies}
          onSensorsImport={result => {
            // After import is complete, return to list view
            setMode("listSensors");
            // Show a toast or notification with the result
          }}
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
