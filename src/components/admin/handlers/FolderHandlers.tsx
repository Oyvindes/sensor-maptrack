
import { useState } from "react";
import { SensorFolder, Company } from "@/types/users";
import { toast } from "sonner";
import { AdminMode } from "@/hooks/useAdminState";

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
      // Simulate an API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if we're editing an existing folder or creating a new one
      if (sensorFolders.some(f => f.id === updatedFolder.id)) {
        setSensorFolders(
          sensorFolders.map(folder => 
            folder.id === updatedFolder.id ? updatedFolder : folder
          )
        );
        toast.success('Project updated successfully');
      } else {
        // Create new folder with a real ID
        const newFolder = {
          ...updatedFolder,
          id: `folder-${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        setSensorFolders([...sensorFolders, newFolder]);
        toast.success('Project created successfully');
      }

      setMode("listFolders" as AdminMode);
      setSelectedFolder(null);
    } catch (error) {
      console.error('Error saving folder:', error);
      toast.error('Failed to save project');
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
