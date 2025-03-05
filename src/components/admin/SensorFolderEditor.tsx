
import React from "react";
import { SensorFolder, Company } from "@/types/users";
import { SectionContainer } from "@/components/Layout";
import { getCurrentUser } from "@/services/authService";
import ProjectInfoFields from "./editor/ProjectInfoFields";
import CompanySelector from "./editor/CompanySelector";
import SensorAssignment from "./editor/SensorAssignment";
import ProjectMetadata from "./editor/ProjectMetadata";
import EditorHeader from "./editor/folder-editor/EditorHeader";
import MapDisplay from "./editor/folder-editor/MapDisplay";
import EditorActionButtons from "./editor/folder-editor/EditorActionButtons";
import { useFolderEditor } from "./editor/folder-editor/useFolderEditor";

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
  const currentUser = getCurrentUser();
  const isMasterAdmin = currentUser?.role === 'master';
  
  const {
    formData,
    availableSensors,
    mapLocation,
    mapFocusPosition,
    directionsDialogOpen,
    handleChange,
    handleSensorToggle,
    handleSubmit,
    handleCompanyChange
  } = useFolderEditor(folder, onSave);

  return (
    <SectionContainer>
      <EditorHeader folder={folder} onCancel={onCancel} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <ProjectInfoFields 
          formData={formData}
          onChange={handleChange}
        />

        <MapDisplay 
          mapLocation={mapLocation}
          mapFocusPosition={mapFocusPosition}
          projectName={formData.name}
          companyId={formData.companyId}
          visible={!directionsDialogOpen}
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
            companyId={formData.companyId}
          />
        </div>

        <ProjectMetadata
          creatorName={formData.creatorName}
          createdAt={formData.createdAt}
        />

        <EditorActionButtons onCancel={onCancel} />
      </form>
    </SectionContainer>
  );
};

export default SensorFolderEditor;
