
import React from 'react';
import { SensorFolder, Company } from '@/types/users';
import { Button } from "@/components/ui/button";
import { Folder, Edit, UserRound, Clock, MapPin, Hash, Link, MapIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FolderListItemProps {
  folder: SensorFolder;
  companies: Company[];
  onFolderSelect: (folderId: string) => void;
  onEdit: (folder: SensorFolder, e: React.MouseEvent) => void;
  canEdit: boolean;
  sensorCount: number;
}

const FolderListItem: React.FC<FolderListItemProps> = ({
  folder,
  companies,
  onFolderSelect,
  onEdit,
  canEdit,
  sensorCount
}) => {
  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };

  const hasLocation = folder.location && (
    typeof folder.location === 'string' 
      ? JSON.parse(folder.location).lat && JSON.parse(folder.location).lng
      : folder.location.lat && folder.location.lng
  );

  return (
    <div
      key={folder.id}
      className="flex flex-col p-4 border rounded-md hover:bg-muted/50 cursor-pointer"
      onClick={() => onFolderSelect(folder.id)}
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
          {canEdit && (
            <Button variant="ghost" size="sm" onClick={(e) => onEdit(folder, e)}>
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
            {hasLocation && <MapIcon className="h-3 w-3 ml-1 text-blue-500" />}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap items-center mt-2 gap-x-4 gap-y-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link className="h-3 w-3" />
          <span>{sensorCount} sensor{sensorCount !== 1 ? 's' : ''} assigned</span>
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
  );
};

export default FolderListItem;
