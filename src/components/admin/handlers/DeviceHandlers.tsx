
import { Device, TrackingObject } from "@/types/sensors";
import { getCurrentUser } from "@/services/authService";
import { toast } from "sonner";

export interface DeviceHandlers {
  handleDeviceSelect: (device: Device) => void;
  handleTrackingObjectSelect: (object: TrackingObject) => void;
  handleDeviceSave: (updatedDevice: Device) => void;
  handleDeviceCancel: () => void;
  handleAddNewDevice: () => void;
  handleDeviceDelete: (deviceId: string) => Promise<boolean>;
}

export function useDeviceHandlers(
  devices: Device[],
  trackingObjects: TrackingObject[],
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>,
  setTrackingObjects: React.Dispatch<React.SetStateAction<TrackingObject[]>>,
  setSelectedDevice: React.Dispatch<React.SetStateAction<Device | null>>,
  setMode: React.Dispatch<React.SetStateAction<string>>,
  companies: { id: string }[],
  updateTrackingObject?: (updatedDevice: Device) => Promise<boolean>,
  deleteTrackingObject?: (deviceId: string) => Promise<boolean>,
  loadDevicesAndTracking?: () => Promise<void> // Add the loadDevicesAndTracking function
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
    // First try to find a corresponding device
    let device = devices.find(d => d.id === object.id);
    
    // If no device is found, create one from the tracking object
    if (!device) {
      device = {
        id: object.id,
        name: object.name,
        type: "tracker",
        status: "online",
        location: object.position,
        lastUpdated: object.lastUpdated,
        companyId: currentUser?.companyId || "",
        folderId: (object as any).folderId
      };
    } else {
      // If the tracking object has a folderId, make sure it's preserved
      if ((object as any).folderId && !device.folderId) {
        device.folderId = (object as any).folderId;
      }
    }
    
    // Check if user has permissions for this device
    if (!canEditDevice(device)) {
      toast.error("You don't have permission to edit this device");
      return;
    }
    
    setSelectedDevice(device);
    setMode("editDevice");
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
        // If successfully updated in Supabase, don't update local state
        // as the fetchData function called inside updateTrackingObject will have already done that
        setMode("listDevices");
        setSelectedDevice(null);
        
        // Force a refresh of the devices and tracking objects
        if (loadDevicesAndTracking) {
          console.log('Calling loadDevicesAndTracking after device save');
          setTimeout(() => {
            loadDevicesAndTracking();
          }, 1000); // Add a delay to ensure the database has time to update
        }
        
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
    
    // Force a refresh of the devices and tracking objects
    if (loadDevicesAndTracking) {
      console.log('Calling loadDevicesAndTracking after local device save');
      setTimeout(() => {
        loadDevicesAndTracking();
      }, 1000); // Add a delay to ensure the database has time to update
    }
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
    
    // Check if user is a site-wide admin
    if (currentUser.role !== 'master') {
      toast.error("Adding tracker devices is only reserved for site wide admins");
      return;
    }
    
    // Generate a temporary ID for new device
    const tempId = `temp-${Date.now()}`;
    
    // For new devices, set the company ID to the first company or system
    const companyId = companies[0]?.id || "system";
    
    setSelectedDevice({
      id: tempId,
      name: "",
      type: "tracker",
      status: "online",
      location: { lat: 63.4305, lng: 10.3951 }, // Default to Trondheim
      companyId: companyId
    });
    setMode("editDevice");
  };
  
  const handleDeviceDelete = async (deviceId: string): Promise<boolean> => {
    // Find the device by ID
    const device = devices.find(d => d.id === deviceId);
    if (!device) {
      toast.error("Device not found");
      return false;
    }
    
    // Check if user has permissions to delete this device
    if (!canEditDevice(device)) {
      toast.error("You don't have permission to delete this device");
      return false;
    }
    
    // Use the provided deleteTrackingObject function if available
    if (deleteTrackingObject) {
      return await deleteTrackingObject(deviceId);
    }
    
    // Fallback to local state update if delete function not provided
    setDevices(devices.filter(d => d.id !== deviceId));
    setTrackingObjects(trackingObjects.filter(obj => obj.id !== deviceId));
    toast.success("Device deleted successfully");
    return true;
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
    handleAddNewDevice,
    handleDeviceDelete
  };
}
