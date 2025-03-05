
import React, { useState } from 'react';
import { SensorFolder, Company } from '@/types/users';
import { Button } from "@/components/ui/button";
import { Plus, Folder, Edit, UserRound, Clock, MapPin, Hash, Link } from "lucide-react";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import SensorFolderEditor from './SensorFolderEditor';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { getCurrentUser } from '@/services/authService';
import { getMockSensors } from '@/services/sensorService';

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
  const allSensors = getMockSensors();
  
  const filteredFolders = folders.filter(folder => {
    if (currentUser?.role === 'master') {
      return true;
    }
    
    if (currentUser?.role === 'admin') {
      return folder.companyId === currentUser.companyId;
    }
    
    return folder.companyId === currentUser?.companyId;
  });

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
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser?.id,
      creatorName: currentUser?.name,
      projectNumber: `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      address: "",
      assignedSensorIds: []
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
      toast.error("Failed to save project");
    }
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };

  const getSensorCount = (folder: SensorFolder) => {
    return folder.assignedSensorIds?.length || 0;
  };

  const canEditFolder = (folder: SensorFolder) => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'master') return true;
    
    if (currentUser.role === 'admin' && folder.companyId === currentUser.companyId) return true;
    
    if (folder.createdBy === currentUser.id) return true;
    
    return false;
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
        <SectionTitle>Projects</SectionTitle>
        <Button size="sm" onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-1" /> Add Project
        </Button>
      </div>

      {displayedFolders.length === 0 && (
        <Alert className="mb-4">
          <AlertTitle>No projects found</AlertTitle>
          <AlertDescription>
            {selectedCompanyId 
              ? "This company doesn't have any projects yet. Create your first project to organize sensors."
              : "No projects found. Select a company or create a new project."}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {displayedFolders.map(folder => (
          <div
            key={folder.id}
            className="flex flex-col p-4 border rounded-md hover:bg-muted/50 cursor-pointer"
            onClick={() => onFolderSelect && onFolderSelect(folder.id)}
          >
            <div className="flex items-center justify-between">
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
              {folder.projectNumber && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  <span>{folder.projectNumber}</span>
                </div>
              )}
              
              {folder.address && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground md:col-span-2">
                  <MapPin className="h-3 w-3" />
                  <span>{folder.address}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center mt-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Link className="h-3 w-3" />
                <span>{getSensorCount(folder)} sensor{getSensorCount(folder) !== 1 ? 's' : ''} assigned</span>
              </div>
              
              {folder.creatorName && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <UserRound className="h-3 w-3" />
                  <span>{folder.creatorName}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{folder.createdAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
};

export default SensorFolderList;
