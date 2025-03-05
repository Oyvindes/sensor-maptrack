
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

  useEffect(() => {
    // Get all mock sensors
    const allSensors = getMockSensors();
    
    // Filter sensors by company ID
    const filteredSensors = allSensors
      .filter(sensor => {
        // This is the fix: use sensor.companyId instead of looking for a companyId that
        // might not be directly on the sensor object
        return sensor.companyId === formData.companyId;
      })
      .map(sensor => ({
        id: sensor.id,
        name: sensor.name
      }));
    
    setAvailableSensors(filteredSensors);

    // If formData has location data, parse it for the map
    if (formData.location) {
      try {
        if (typeof formData.location === 'string') {
          const locationData = JSON.parse(formData.location);
          setMapLocation(locationData);
        } else {
          setMapLocation(formData.location);
        }
      } catch (e) {
        console.error("Error parsing location data:", e);
        setMapLocation(null);
      }
    }
  }, [formData.companyId, formData.location]);

  const handleChange = (field: keyof SensorFolder, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSensorToggle = (sensorId: string, checked: boolean) => {
    // Stay in edit mode regardless of how many sensors are left
    setFormData(prev => {
      const currentAssignedSensors = prev.assignedSensorIds || [];
      let updatedSensors: string[];
      
      if (checked) {
        // If the sensor is already in the list, don't add it again
        if (currentAssignedSensors.includes(sensorId)) {
          toast.info("This sensor is already assigned to this project");
          return prev;
        }
        
        // Add the sensor to assigned list
        updatedSensors = [...currentAssignedSensors, sensorId];
        toast.success("Sensor added successfully");
      } else {
        // Remove the sensor from assigned list
        updatedSensors = currentAssignedSensors.filter(id => id !== sensorId);
        toast.info("Sensor removed from project");
      }
      
      // Always return the updated form data, even if all sensors are removed
      return { ...prev, assignedSensorIds: updatedSensors };
    });
    
    // Don't change the mode or navigate away regardless of sensor count
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCompanyChange = (companyId: string) => {
    // When company changes, we need to:
    // 1. Update the form data with the new company ID
    // 2. Clear the assigned sensors as they might not belong to the new company
    setFormData(prev => ({
      ...prev,
      companyId,
      assignedSensorIds: [] // Reset assigned sensors
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

        {mapLocation && (
          <div className="border rounded-md overflow-hidden h-64 mb-4">
            <TrackingMap
              className="h-full w-full"
              devices={[{
                id: "project-location",
                name: formData.name || "Project Location",
                type: "project",
                status: "active",
                location: mapLocation,
                companyId: formData.companyId
              }]}
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
