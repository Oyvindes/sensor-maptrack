
import { useState } from "react";
import { SensorFolder, Company } from "@/types/users";
import { toast } from "sonner";
import { AdminMode } from "@/hooks/useAdminState";
import { saveSensorFolder } from "@/services/folder/supabaseFolderService";

export const useFolderHandlers = (
  sensorFolders: SensorFolder[],
  setSensorFolders: React.Dispatch<React.SetStateAction<SensorFolder[]>>,
  setSelectedFolder: React.Dispatch<React.SetStateAction<SensorFolder | null>>,
  setMode: React.Dispatch<React.SetStateAction<AdminMode>>,
  companies: Company[]
) => {
  const [isUpdatingFolder, setIsUpdatingFolder] = useState(false);

  const handleFolderSelect = (folder: SensorFolder) => {
    setSelectedFolder(folder);
    setMode("editFolder" as AdminMode);
  };

  const handleFolderSelectById = (folderId: string) => {
    console.log("Selecting folder by ID:", folderId);
    const folder = sensorFolders.find(f => f.id === folderId);
    if (folder) {
      setSelectedFolder(folder);
      setMode("editFolder" as AdminMode);
    } else {
      console.warn(`Folder with ID ${folderId} not found`);
    }
  };

  const handleFolderSave = async (updatedFolder: SensorFolder) => {
    setIsUpdatingFolder(true);

    try {
      // Save to Supabase
      const result = await saveSensorFolder(updatedFolder);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // Update local state
      if (result.data) {
        const isNew = !sensorFolders.some(f => f.id === result.data?.id);
        
        if (isNew) {
          setSensorFolders([...sensorFolders, result.data]);
        } else {
          setSensorFolders(
            sensorFolders.map(folder => 
              folder.id === result.data?.id ? result.data : folder
            )
          );
        }
      }
      
      toast.success(result.message);
      setMode("listFolders" as AdminMode);
      setSelectedFolder(null);
    } catch (error) {
      console.error('Error saving folder:', error);
      toast.error('Failed to save project: ' + error.message);
    } finally {
      setIsUpdatingFolder(false);
    }
  };

  const handleFolderCancel = () => {
    setSelectedFolder(null);
    setMode("listFolders" as AdminMode);
  };

  return {
    isUpdatingFolder,
    handleFolderSelect,
    handleFolderSelectById,
    handleFolderSave,
    handleFolderCancel
  };
};
