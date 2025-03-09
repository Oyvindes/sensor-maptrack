
import { useState, useEffect } from "react";
import { SensorFolder } from "@/types/users";
import { getMockSensors } from "@/services/sensorService";
import { toast } from "sonner";

export const useFolderEditor = (
  folder: SensorFolder,
  onSave: (folder: SensorFolder) => void
) => {
  const [formData, setFormData] = useState<SensorFolder>(folder);
  const [availableSensors, setAvailableSensors] = useState<Array<{ id: string; name: string }>>([]);
  const [mapLocation, setMapLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapFocusPosition, setMapFocusPosition] = useState<[number, number] | undefined>(undefined);
  const [directionsDialogOpen, setDirectionsDialogOpen] = useState(false);
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const allSensors = await getMockSensors();
        
        const filteredSensors = allSensors
          .filter(sensor => {
            return sensor.companyId === formData.companyId;
          })
          .map(sensor => ({
            id: sensor.id,
            name: sensor.name
          }));
        
        setAvailableSensors(filteredSensors);
      } catch (error) {
        console.error("Error fetching sensors:", error);
        setAvailableSensors([]);
      }
    };

    fetchSensors();

    if (formData.location) {
      try {
        let locationData: {lat: number, lng: number};
        
        if (typeof formData.location === 'string') {
          locationData = JSON.parse(formData.location as string);
        } else {
          locationData = formData.location as {lat: number, lng: number};
        }
        
        setMapLocation(locationData);
        setMapFocusPosition([locationData.lat, locationData.lng]);
      } catch (e) {
        console.error("Error parsing location data:", e);
        setMapLocation(null);
        setMapFocusPosition(undefined);
      }
    }

    // Listen for dialog state changes from ProjectInfoFields
    const handleDialogStateChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      setDirectionsDialogOpen(customEvent.detail.isOpen);
    };

    window.addEventListener('directionsDialogStateChange', handleDialogStateChange);

    return () => {
      window.removeEventListener('directionsDialogStateChange', handleDialogStateChange);
    };
  }, [formData.companyId, formData.location]);

  const handleChange = (field: keyof SensorFolder, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "location" && typeof value === 'string') {
      try {
        const locationData = JSON.parse(value);
        if (locationData.lat && locationData.lng) {
          setMapFocusPosition([locationData.lat, locationData.lng]);
        }
      } catch (e) {
        console.error("Error parsing updated location data:", e);
      }
    }
  };

  const handleSensorToggle = (sensorId: string, checked: boolean) => {
    setFormData(prev => {
      const currentAssignedSensors = prev.assignedSensorIds || [];
      let updatedSensors: string[];
      
      if (checked) {
        if (currentAssignedSensors.includes(sensorId)) {
          toast.info("This sensor is already assigned to this project");
          return prev;
        }
        
        updatedSensors = [...currentAssignedSensors, sensorId];
        toast.success("Sensor added successfully");
      } else {
        updatedSensors = currentAssignedSensors.filter(id => id !== sensorId);
        toast.info("Sensor removed from project");
      }
      
      return { ...prev, assignedSensorIds: updatedSensors };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSavingInProgress) {
      console.log("Save already in progress, ignoring duplicate submission");
      return;
    }
    
    try {
      setIsSavingInProgress(true);
      // In a real application, this would include validation
      onSave(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save project");
    } finally {
      setIsSavingInProgress(false);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    setFormData(prev => ({
      ...prev,
      companyId,
      assignedSensorIds: []
    }));
  };

  return {
    formData,
    availableSensors,
    mapLocation,
    mapFocusPosition,
    directionsDialogOpen,
    isSavingInProgress,
    handleChange,
    handleSensorToggle,
    handleSubmit,
    handleCompanyChange
  };
};
