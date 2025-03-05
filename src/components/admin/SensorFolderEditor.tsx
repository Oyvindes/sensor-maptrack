
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

  useEffect(() => {
    // Filter sensors by company ID
    const allSensors = getMockSensors();
    const filteredSensors = allSensors
      .filter(sensor => sensor.companyId === formData.companyId)
      .map(sensor => ({
        id: sensor.id,
        name: sensor.name
      }));
    
    setAvailableSensors(filteredSensors);
  }, [formData.companyId]);

  const handleChange = (field: keyof SensorFolder, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSensorToggle = (sensorId: string, checked: boolean) => {
    setFormData(prev => {
      const currentAssignedSensors = prev.assignedSensorIds || [];
      let updatedSensors: string[];
      
      if (checked) {
        // Add the sensor to assigned list
        updatedSensors = [...currentAssignedSensors, sensorId];
      } else {
        // Remove the sensor from assigned list
        updatedSensors = currentAssignedSensors.filter(id => id !== sensorId);
      }
      
      return { ...prev, assignedSensorIds: updatedSensors };
    });
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
