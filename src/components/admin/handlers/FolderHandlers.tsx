
import { SensorFolder, Company } from "@/types/users";
import { createSensorFolder, updateSensorFolder } from "@/services/folder/folderService";
import { toast } from "sonner";

export interface FolderHandlers {
  handleFolderSelect: (folder: SensorFolder) => void;
  handleFolderSelectById: (folderId: string) => void;
  handleFolderSave: (updatedFolder: SensorFolder) => Promise<void>;
  handleFolderCancel: () => void;
  handleAddNewFolder: () => void;
}

export function useFolderHandlers(
  sensorFolders: SensorFolder[],
  setSensorFolders: React.Dispatch<React.SetStateAction<SensorFolder[]>>,
  setSelectedFolder: React.Dispatch<React.SetStateAction<SensorFolder | null>>,
  setMode: React.Dispatch<React.SetStateAction<string>>,
  companies: Company[]
): FolderHandlers {
  const handleFolderSelect = (folder: SensorFolder) => {
    setSelectedFolder(folder);
    setMode("editFolder");
  };

  const handleFolderSelectById = (folderId: string) => {
    const folder = sensorFolders.find(f => f.id === folderId);
    if (folder) {
      handleFolderSelect(folder);
    }
  };

  const handleFolderSave = async (updatedFolder: SensorFolder) => {
    try {
      // Handle existing folder update
      if (sensorFolders.some(f => f.id === updatedFolder.id)) {
        await updateSensorFolder(updatedFolder.id, updatedFolder);
        
        // Update local state
        setSensorFolders(prev => 
          prev.map(folder => folder.id === updatedFolder.id ? updatedFolder : folder)
        );
      } else {
        // Handle new folder creation
        const { companyId, name, description } = updatedFolder;
        if (!companyId) {
          toast.error("A company must be selected");
          return;
        }
        
        const { data: newFolder } = await createSensorFolder({
          companyId,
          name,
          description
        });
        
        // Add the new folder to the state
        setSensorFolders(prev => [...prev, newFolder]);
      }
      
      // Reset the form
      setMode("listFolders");
      setSelectedFolder(null);
    } catch (error) {
      console.error("Error saving folder:", error);
      toast.error("Failed to save project");
    }
  };

  const handleFolderCancel = () => {
    setMode("listFolders");
    setSelectedFolder(null);
  };

  const handleAddNewFolder = () => {
    // Default to first company if available
    const defaultCompanyId = companies.length > 0 ? companies[0].id : "";
    
    setSelectedFolder({
      id: `folder-${Date.now().toString().slice(-3)}`,
      name: "",
      description: "",
      companyId: defaultCompanyId,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setMode("editFolder");
  };

  return {
    handleFolderSelect,
    handleFolderSelectById,
    handleFolderSave,
    handleFolderCancel,
    handleAddNewFolder
  };
}
