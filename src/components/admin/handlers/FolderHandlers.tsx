
import { SensorFolder } from "@/types/users";

export interface FolderHandlers {
  handleFolderSelect: (folder: SensorFolder) => void;
  handleFolderSelectById: (folderId: string) => void;
  handleFolderSave: (updatedFolder: SensorFolder) => void;
  handleFolderCancel: () => void;
  handleAddNewFolder: () => void;
}

export function useFolderHandlers(
  sensorFolders: SensorFolder[],
  setSensorFolders: React.Dispatch<React.SetStateAction<SensorFolder[]>>,
  setSelectedFolder: React.Dispatch<React.SetStateAction<SensorFolder | null>>,
  setMode: React.Dispatch<React.SetStateAction<string>>,
  companies: { id: string }[]
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

  const handleFolderSave = (updatedFolder: SensorFolder) => {
    setSensorFolders(sensorFolders.map(f => f.id === updatedFolder.id ? updatedFolder : f));
    setMode("listFolders");
    setSelectedFolder(null);
  };

  const handleFolderCancel = () => {
    setMode("listFolders");
    setSelectedFolder(null);
  };

  const handleAddNewFolder = () => {
    setSelectedFolder({
      id: `folder-${Date.now().toString().slice(-3)}`,
      name: "",
      companyId: companies[0]?.id || "system",
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
