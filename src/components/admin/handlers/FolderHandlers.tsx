
import { SensorFolder } from "@/types/users";
import { getCurrentUser } from "@/services/authService";
import { toast } from "sonner";

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
  const currentUser = getCurrentUser();
  
  const handleFolderSelect = (folder: SensorFolder) => {
    // Check if user has permission to edit this folder
    if (!canEditFolder(folder)) {
      toast.error("You don't have permission to edit this folder");
      return;
    }
    
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
    // Check permission again before saving
    if (!canEditFolder(updatedFolder)) {
      toast.error("You don't have permission to modify this folder");
      return;
    }
    
    // For non-master users, ensure company ID doesn't change
    if (currentUser?.role !== 'master') {
      const originalFolder = sensorFolders.find(f => f.id === updatedFolder.id);
      if (originalFolder && originalFolder.companyId !== updatedFolder.companyId) {
        toast.error("You don't have permission to change the company assignment");
        return;
      }
    }
    
    setSensorFolders(sensorFolders.map(f => f.id === updatedFolder.id ? updatedFolder : f));
    setMode("listFolders");
    setSelectedFolder(null);
  };

  const handleFolderCancel = () => {
    setMode("listFolders");
    setSelectedFolder(null);
  };

  const handleAddNewFolder = () => {
    if (!currentUser) {
      toast.error("You must be logged in to create folders");
      return;
    }
    
    // For new folders, set the company ID to the user's company
    const companyId = currentUser.role === 'master' 
      ? (companies[0]?.id || "system") 
      : currentUser.companyId;
    
    setSelectedFolder({
      id: `folder-${Date.now().toString().slice(-3)}`,
      name: "",
      companyId: companyId,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser.id,
      creatorName: currentUser.name
    });
    setMode("editFolder");
  };
  
  // Helper function to check if user can edit a specific folder
  const canEditFolder = (folder: SensorFolder): boolean => {
    if (!currentUser) return false;
    
    // Site-wide admins can edit any folder
    if (currentUser.role === 'master') return true;
    
    // Company admins can edit folders in their company
    if (currentUser.role === 'admin' && folder.companyId === currentUser.companyId) return true;
    
    // Regular users can edit only folders they've created
    if (folder.createdBy === currentUser.id) return true;
    
    return false;
  };

  return {
    handleFolderSelect,
    handleFolderSelectById,
    handleFolderSave,
    handleFolderCancel,
    handleAddNewFolder
  };
}
