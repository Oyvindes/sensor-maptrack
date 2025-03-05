
import React from "react";
import { SensorFolder, Company } from "@/types/users";
import SensorFolderList from "@/components/admin/SensorFolderList";
import SensorFolderEditor from "@/components/admin/SensorFolderEditor";
import { getCurrentUser } from "@/services/authService";
import { createSensorFolder, updateSensorFolder } from "@/services/userService";
import { toast } from "sonner";

interface FoldersTabProps {
  mode: string;
  sensorFolders: SensorFolder[];
  companies: Company[];
  selectedFolder: SensorFolder | null;
  onFolderSelect: (folderId: string) => void;
  onFolderSave: (folder: SensorFolder) => void;
  onFolderCancel: () => void;
}

const FoldersTab: React.FC<FoldersTabProps> = ({
  mode,
  sensorFolders,
  companies,
  selectedFolder,
  onFolderSelect,
  onFolderSave,
  onFolderCancel
}) => {
  const currentUser = getCurrentUser();
  
  // Note: Folders are now for organization only, not ownership
  const handleFolderCreate = async (folderData: Omit<SensorFolder, "id" | "createdAt">) => {
    try {
      const response = await createSensorFolder(folderData);
      if (response.success) {
        toast.success("Folder created successfully");
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(response.message));
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
      return Promise.reject(error);
    }
  };
  
  const handleFolderUpdate = async (folderId: string, data: Partial<SensorFolder>) => {
    try {
      const response = await updateSensorFolder(folderId, data);
      if (response.success) {
        toast.success("Folder updated successfully");
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(response.message));
      }
    } catch (error) {
      console.error("Error updating folder:", error);
      toast.error("Failed to update folder");
      return Promise.reject(error);
    }
  };

  return (
    <>
      {mode === "listFolders" && (
        <SensorFolderList
          folders={sensorFolders}
          companies={companies}
          onFolderSelect={onFolderSelect}
          onFolderCreate={handleFolderCreate}
          onFolderUpdate={handleFolderUpdate}
          selectedCompanyId={currentUser?.role === 'master' ? undefined : currentUser?.companyId}
        />
      )}
      {mode === "editFolder" && selectedFolder && (
        <SensorFolderEditor
          folder={selectedFolder}
          companies={companies}
          onSave={onFolderSave}
          onCancel={onFolderCancel}
        />
      )}
    </>
  );
};

export default FoldersTab;
