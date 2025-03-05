
import { Device, TrackingObject } from "@/types/sensors";

export interface DeviceHandlers {
  handleDeviceSelect: (device: Device) => void;
  handleTrackingObjectSelect: (object: TrackingObject) => void;
  handleDeviceSave: (updatedDevice: Device) => void;
  handleDeviceCancel: () => void;
  handleAddNewDevice: () => void;
}

export function useDeviceHandlers(
  devices: Device[],
  trackingObjects: TrackingObject[],
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>,
  setTrackingObjects: React.Dispatch<React.SetStateAction<TrackingObject[]>>,
  setSelectedDevice: React.Dispatch<React.SetStateAction<Device | null>>,
  setMode: React.Dispatch<React.SetStateAction<string>>,
  companies: { id: string }[]
): DeviceHandlers {

  const mapDeviceToTrackingObject = (device: Device): TrackingObject => {
    return {
      id: device.id,
      name: device.name,
      position: device.location || { lat: 0, lng: 0 },
      lastUpdated: new Date().toLocaleTimeString(),
      speed: 0,
      direction: 0,
      batteryLevel: 100,
    };
  };
  
  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setMode("editDevice");
  };

  const handleTrackingObjectSelect = (object: TrackingObject) => {
    const device = devices.find(d => d.id === object.id);
    if (device) {
      setSelectedDevice(device);
      setMode("editDevice");
    }
  };

  const handleDeviceSave = (updatedDevice: Device) => {
    setDevices(devices.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    setTrackingObjects(trackingObjects.map(obj => 
      obj.id === updatedDevice.id ? mapDeviceToTrackingObject(updatedDevice) : obj
    ));
    setMode("listDevices");
    setSelectedDevice(null);
  };

  const handleDeviceCancel = () => {
    setMode("listDevices");
    setSelectedDevice(null);
  };

  const handleAddNewDevice = () => {
    setSelectedDevice({
      id: `device-${Date.now().toString().slice(-3)}`,
      name: "",
      type: "",
      status: "online",
      location: { lat: 0, lng: 0 },
      companyId: companies[0]?.id || "system"
    });
    setMode("editDevice");
  };

  return {
    handleDeviceSelect,
    handleTrackingObjectSelect,
    handleDeviceSave,
    handleDeviceCancel,
    handleAddNewDevice
  };
}
