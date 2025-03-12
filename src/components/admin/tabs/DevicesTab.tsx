
import React from "react";
import { TrackingObject, Device } from "@/types/sensors";
import DeviceList from "@/components/admin/DeviceList";
import DeviceEditor from "@/components/DeviceEditor";
import { Company } from "@/types/users";

interface DevicesTabProps {
  mode: string;
  trackingObjects: TrackingObject[];
  selectedDevice: Device | null;
  companies?: Company[];
  onDeviceSelect: (device: TrackingObject) => void;
  onDeviceSave: (device: Device) => void;
  onDeviceCancel: () => void;
  onAddNewDevice: () => void;
  onDeviceDelete?: (deviceId: string) => Promise<boolean>;
}

const DevicesTab: React.FC<DevicesTabProps> = ({
  mode,
  trackingObjects,
  selectedDevice,
  companies = [],
  onDeviceSelect,
  onDeviceSave,
  onDeviceCancel,
  onAddNewDevice,
  onDeviceDelete
}) => {
  return (
    <>
      {mode === "listDevices" && (
        <DeviceList
          devices={trackingObjects}
          onDeviceSelect={onDeviceSelect}
          onAddNew={onAddNewDevice}
          onDelete={onDeviceDelete}
        />
      )}
      {mode === "editDevice" && selectedDevice && (
        <DeviceEditor
          device={selectedDevice}
          companies={companies}
          onSave={onDeviceSave}
          onCancel={onDeviceCancel}
        />
      )}
    </>
  );
};

export default DevicesTab;
