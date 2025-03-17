import React, { useMemo } from "react";
import { TrackingObject, Device } from "@/types/sensors";
import DeviceList from "@/components/admin/DeviceList";
import DeviceEditor from "@/components/DeviceEditor";
import { Company, User } from "@/types/users";
import { filterTrackingObjectsByCompany } from "@/utils/authUtils";

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
  currentUser: User | null;
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
  onDeviceDelete,
  currentUser
}) => {
  // Filter tracking objects by company for non-master users
  const filteredTrackingObjects = useMemo(() => {
    return filterTrackingObjectsByCompany(trackingObjects, currentUser);
  }, [trackingObjects, currentUser]);
  return (
    <>
      {mode === "listDevices" && (
        <DeviceList
          devices={filteredTrackingObjects}
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
