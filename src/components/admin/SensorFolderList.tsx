
import React, { useState } from 'react';
import { SensorFolder, Company } from '@/types/users';
import { SectionContainer } from "@/components/Layout";
import SensorFolderEditor from './SensorFolderEditor';
import { toast } from 'sonner';
import { getCurrentUser } from '@/services/authService';
import { getMockSensors } from '@/services/sensorService';
import FolderListHeader from './folder-list/FolderListHeader';
import EmptyFolderState from './folder-list/EmptyFolderState';
import FolderListItem from './folder-list/FolderListItem';

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

  const handleEdit = (folder: SensorFolder, e: React.MouseEvent) => {
    e.stopPropagation();
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
      <FolderListHeader onAddNew={handleAddNew} />

      {displayedFolders.length === 0 && (
        <EmptyFolderState hasSelectedCompany={Boolean(selectedCompanyId)} />
      )}

      <div className="space-y-2">
        {displayedFolders.map(folder => (
          <FolderListItem
            key={folder.id}
            folder={folder}
            companies={companies}
            onFolderSelect={(folderId) => onFolderSelect && onFolderSelect(folderId)}
            onEdit={handleEdit}
            canEdit={canEditFolder(folder)}
            sensorCount={getSensorCount(folder)}
          />
        ))}
      </div>
    </SectionContainer>
  );
};

export default SensorFolderList;
