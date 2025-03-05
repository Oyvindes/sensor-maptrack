
import React from "react";
import { TrackingObject, Device } from "@/types/sensors";
import DeviceList from "@/components/admin/DeviceList";
import DeviceEditor from "@/components/DeviceEditor";

interface DevicesTabProps {
  mode: string;
  trackingObjects: TrackingObject[];
  selectedDevice: Device | null;
  onDeviceSelect: (device: TrackingObject) => void;
  onDeviceSave: (device: Device) => void;
  onDeviceCancel: () => void;
  onAddNewDevice: () => void;
}

const DevicesTab: React.FC<DevicesTabProps> = ({
  mode,
  trackingObjects,
  selectedDevice,
  onDeviceSelect,
  onDeviceSave,
  onDeviceCancel,
  onAddNewDevice
}) => {
  return (
    <>
      {mode === "listDevices" && (
        <DeviceList
          devices={trackingObjects}
          onDeviceSelect={onDeviceSelect}
          onAddNew={onAddNewDevice}
        />
      )}
      {mode === "editDevice" && selectedDevice && (
        <DeviceEditor
          device={selectedDevice}
          onSave={onDeviceSave}
          onCancel={onDeviceCancel}
        />
      )}
    </>
  );
};

export default DevicesTab;
