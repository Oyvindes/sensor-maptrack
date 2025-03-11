
import { Device, TrackingObject } from "@/types/sensors";
import { getCurrentUser } from "@/services/authService";
import { toast } from "sonner";

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
  companies: { id: string }[],
  updateTrackingObject?: (updatedDevice: Device) => Promise<boolean>
): DeviceHandlers {
  const currentUser = getCurrentUser();

  const mapDeviceToTrackingObject = (device: Device): TrackingObject => {
    return {
      id: device.id,
      name: device.name,
      position: device.location || { lat: 0, lng: 0 },
      lastUpdated: new Date().toLocaleTimeString(),
      speed: 0,
      direction: 0,
      batteryLevel: 100,
      ...(device.folderId && { folderId: device.folderId }) // Keep folderId for organization purposes
    };
  };
  
  const handleDeviceSelect = (device: Device) => {
    // Check if user has permissions for this device
    if (!canEditDevice(device)) {
      toast.error("You don't have permission to edit this device");
      return;
    }
    
    setSelectedDevice(device);
    setMode("editDevice");
  };

  const handleTrackingObjectSelect = (object: TrackingObject) => {
    const device = devices.find(d => d.id === object.id);
    if (device) {
      // Check if user has permissions for this device
      if (!canEditDevice(device)) {
        toast.error("You don't have permission to edit this device");
        return;
      }
      
      // If the tracking object has a folderId, make sure it's preserved
      if ((object as any).folderId && !device.folderId) {
        device.folderId = (object as any).folderId;
      }
      setSelectedDevice(device);
      setMode("editDevice");
    }
  };

  const handleDeviceSave = async (updatedDevice: Device) => {
    // Check permissions again before saving
    if (!canEditDevice(updatedDevice)) {
      toast.error("You don't have permission to modify this device");
      return;
    }
    
    // First, try to update in Supabase if the function is provided
    if (updateTrackingObject) {
      const success = await updateTrackingObject(updatedDevice);
      if (success) {
        // If successfully updated in Supabase, we don't need to update local state
        // as the fetchData function called inside updateTrackingObject will have already done that
        setMode("listDevices");
        setSelectedDevice(null);
        return;
      }
    }
    
    // Fallback to local state update if Supabase update fails or function not provided
    setDevices(devices.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    
    // When updating tracking objects, preserve the folderId
    setTrackingObjects(trackingObjects.map(obj => 
      obj.id === updatedDevice.id ? {
        ...mapDeviceToTrackingObject(updatedDevice),
        ...(updatedDevice.folderId && { folderId: updatedDevice.folderId })
      } : obj
    ));
    
    setMode("listDevices");
    setSelectedDevice(null);
  };

  const handleDeviceCancel = () => {
    setMode("listDevices");
    setSelectedDevice(null);
  };

  const handleAddNewDevice = () => {
    if (!currentUser) {
      toast.error("You must be logged in to create devices");
      return;
    }
    
    // For new devices, set the company ID to the user's company
    const companyId = currentUser.role === 'master' 
      ? (companies[0]?.id || "system") 
      : currentUser.companyId;
    
    setSelectedDevice({
      id: `device-${Date.now().toString().slice(-3)}`,
      name: "",
      type: "",
      status: "online",
      location: { lat: 0, lng: 0 },
      companyId: companyId
    });
    setMode("editDevice");
  };
  
  // Helper function to check if user can edit a specific device
  const canEditDevice = (device: Device): boolean => {
    if (!currentUser) return false;
    
    // Site-wide admins can edit any device
    if (currentUser.role === 'master') return true;
    
    // Company admins can edit devices in their company
    if (currentUser.role === 'admin' && device.companyId === currentUser.companyId) return true;
    
    // Regular users can edit devices in their company
    return device.companyId === currentUser.companyId;
  };

  return {
    handleDeviceSelect,
    handleTrackingObjectSelect,
    handleDeviceSave,
    handleDeviceCancel,
    handleAddNewDevice
  };
}
