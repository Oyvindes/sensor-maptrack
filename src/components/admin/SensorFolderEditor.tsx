
import React, { useState, useEffect } from "react";
import { SensorFolder, Company } from "@/types/users";
import { Button } from "@/components/ui/button";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/services/authService";
import { getMockSensors } from "@/services/sensorService";
import ProjectInfoFields from "./editor/ProjectInfoFields";
import CompanySelector from "./editor/CompanySelector";
import SensorAssignment from "./editor/SensorAssignment";
import ProjectMetadata from "./editor/ProjectMetadata";
import { toast } from "sonner";
import TrackingMap from "@/components/TrackingMap";

interface SensorFolderEditorProps {
  folder: SensorFolder;
  companies: Company[];
  onSave: (folder: SensorFolder) => void;
  onCancel: () => void;
}

const SensorFolderEditor: React.FC<SensorFolderEditorProps> = ({
  folder,
  companies,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<SensorFolder>(folder);
  const [availableSensors, setAvailableSensors] = useState<Array<{ id: string; name: string }>>([]);
  const currentUser = getCurrentUser();
  const isMasterAdmin = currentUser?.role === 'master';
  const [mapLocation, setMapLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapFocusPosition, setMapFocusPosition] = useState<[number, number] | undefined>(undefined);
  const [directionsDialogOpen, setDirectionsDialogOpen] = useState(false);

  useEffect(() => {
    const allSensors = getMockSensors();
    
    const filteredSensors = allSensors
      .filter(sensor => {
        return sensor.companyId === formData.companyId;
      })
      .map(sensor => ({
        id: sensor.id,
        name: sensor.name
      }));
    
    setAvailableSensors(filteredSensors);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCompanyChange = (companyId: string) => {
    setFormData(prev => ({
      ...prev,
      companyId,
      assignedSensorIds: []
    }));
  };

  return (
    <SectionContainer>
      <div className="flex items-center mb-4 gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <SectionTitle>
          {folder.id.startsWith("folder-") && folder.id.length > 15 
            ? "Add New Project" 
            : `Edit Project: ${folder.name}`}
        </SectionTitle>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ProjectInfoFields 
          formData={formData}
          onChange={handleChange}
        />

        {mapLocation && !directionsDialogOpen && (
          <div className="border rounded-md overflow-hidden h-64 mb-4">
            <TrackingMap
              className="h-full w-full"
              devices={[{
                id: "project-location",
                name: formData.name || "Project Location",
                type: "project",
                status: "online",
                location: mapLocation,
                companyId: formData.companyId
              }]}
              focusLocation={mapFocusPosition}
              focusZoom={16}
            />
          </div>
        )}

        <CompanySelector
          companyId={formData.companyId}
          companies={companies}
          isMasterAdmin={isMasterAdmin}
          onCompanyChange={handleCompanyChange}
        />

        <div className="space-y-2 pt-4 border-t">
          <SensorAssignment
            availableSensors={availableSensors}
            assignedSensorIds={formData.assignedSensorIds || []}
            onSensorToggle={handleSensorToggle}
            companyId={formData.companyId}
          />
        </div>

        <ProjectMetadata
          creatorName={formData.creatorName}
          createdAt={formData.createdAt}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </SectionContainer>
  );
};

export default SensorFolderEditor;
