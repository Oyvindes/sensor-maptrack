
import React, { useState } from 'react';
import { SensorFolder, Company } from '@/types/users';
import { Button } from "@/components/ui/button";
import { Plus, Folder, Edit, Trash } from "lucide-react";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import SensorFolderEditor from './SensorFolderEditor';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { getCurrentUser } from '@/services/authService';

interface SensorFolderListProps {
  folders: SensorFolder[];
  companies: Company[];
  selectedCompanyId?: string;
  onFolderCreate: (folder: Omit<SensorFolder, "id" | "createdAt">) => Promise<void>;
  onFolderUpdate: (folderId: string, data: Partial<SensorFolder>) => Promise<void>;
  onFolderSelect?: (folderId: string) => void;
  onAddNew?: () => void;
}

const SensorFolderList: React.FC<SensorFolderListProps> = ({
  folders,
  companies,
  selectedCompanyId,
  onFolderCreate,
  onFolderUpdate,
  onFolderSelect,
  onAddNew
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<SensorFolder | null>(null);
  const currentUser = getCurrentUser();
  
  // Filter folders based on user role and permissions
  const filteredFolders = folders.filter(folder => {
    // Site-wide admin (master) can see all folders
    if (currentUser?.role === 'master') {
      return true;
    }
    
    // Regular admin can see folders from their company only
    if (currentUser?.role === 'admin') {
      return folder.companyId === currentUser.companyId;
    }
    
    // Regular users can only see folders they've created (for now we don't track creator,
    // so we'll just check company until that's implemented)
    return folder.companyId === currentUser?.companyId;
  });

  // Further filter by selected company if applicable
  const displayedFolders = selectedCompanyId
    ? filteredFolders.filter(folder => folder.companyId === selectedCompanyId)
    : filteredFolders;

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
      return;
    }
    
    const newFolder: SensorFolder = {
      id: `temp-${Date.now()}`,
      name: "",
      description: "",
      companyId: selectedCompanyId || currentUser?.companyId || "",
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCurrentFolder(newFolder);
    setIsEditing(true);
  };

  const handleEdit = (folder: SensorFolder) => {
    setCurrentFolder(folder);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentFolder(null);
  };

  const handleSave = async (folder: SensorFolder) => {
    try {
      if (folder.id.startsWith('temp-')) {
        const { id, createdAt, ...folderData } = folder;
        await onFolderCreate(folderData);
      } else {
        const { id, ...updates } = folder;
        await onFolderUpdate(id, updates);
      }
      setIsEditing(false);
      setCurrentFolder(null);
    } catch (error) {
      console.error("Error saving folder:", error);
      toast.error("Failed to save folder");
    }
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };

  // Check if user can edit a specific folder
  const canEditFolder = (folder: SensorFolder) => {
    if (!currentUser) return false;
    
    // Site-wide admins can edit any folder
    if (currentUser.role === 'master') return true;
    
    // Company admins can edit folders in their company
    if (currentUser.role === 'admin' && folder.companyId === currentUser.companyId) return true;
    
    // Regular users can edit only folders they've created (for now just company match)
    return folder.companyId === currentUser.companyId;
  };

  if (isEditing && currentFolder) {
    return (
      <SensorFolderEditor
        folder={currentFolder}
        companies={companies}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <SectionContainer>
      <div className="flex justify-between items-center mb-4">
        <SectionTitle>Sensor Folders</SectionTitle>
        <Button size="sm" onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" /> Add Folder
        </Button>
      </div>

      {displayedFolders.length === 0 && (
        <Alert className="mb-4">
          <AlertTitle>No folders found</AlertTitle>
          <AlertDescription>
            {selectedCompanyId 
              ? "This company doesn't have any sensor folders yet. Create your first folder to organize sensors."
              : "No folders found. Select a company or create a new folder."}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {displayedFolders.map(folder => (
          <div
            key={folder.id}
            className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
            onClick={() => onFolderSelect && onFolderSelect(folder.id)}
          >
            <div className="flex items-center space-x-3">
              <Folder className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{folder.name}</div>
                <div className="text-sm text-muted-foreground">
                  {folder.description || "No description"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {getCompanyName(folder.companyId)}
              </Badge>
              {canEditFolder(folder) && (
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(folder);
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
};

export default SensorFolderList;
