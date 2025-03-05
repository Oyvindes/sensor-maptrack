
import React, { useState } from "react";
import { Plus, Folder, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { SensorFolder } from "@/types/users";
import { Badge } from "@/components/ui/badge";
import { SensorData } from "@/components/SensorCard";
import SensorFolderEditor from "./SensorFolderEditor";

interface SensorFolderListProps {
  folders: SensorFolder[];
  sensors: (SensorData & { folderId?: string })[];
  companyId?: string;
  onFolderSelect: (folder: SensorFolder) => void;
  onAddNew: () => void;
  onSensorSelect: (sensor: SensorData) => void;
}

const SensorFolderList: React.FC<SensorFolderListProps> = ({ 
  folders, 
  sensors,
  companyId,
  onFolderSelect, 
  onAddNew,
  onSensorSelect
}) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  
  // Filter folders by company if a company ID is provided
  const filteredFolders = companyId 
    ? folders.filter(folder => folder.companyId === companyId)
    : folders;
  
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };
  
  return (
    <SectionContainer>
      <div className="flex justify-between items-center mb-4">
        <SectionTitle>Sensor Folders</SectionTitle>
        <Button 
          onClick={onAddNew} 
          size="sm" 
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Folder</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {filteredFolders.map(folder => {
          // Get sensors in this folder
          const folderSensors = sensors.filter(sensor => sensor.folderId === folder.id);
          const isExpanded = expandedFolders.includes(folder.id);
          
          return (
            <div 
              key={folder.id}
              className="glass-card rounded-lg"
            >
              <div 
                className="p-4 cursor-pointer hover:bg-accent/10 flex justify-between items-center"
                onClick={() => toggleFolder(folder.id)}
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{folder.name}</h3>
                  <Badge variant="outline">{folderSensors.length} sensors</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFolderSelect(folder);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
              
              {isExpanded && folderSensors.length > 0 && (
                <div className="px-4 pb-4 pt-2 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">Sensors in this folder:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {folderSensors.map(sensor => (
                      <div 
                        key={sensor.id}
                        className="p-2 rounded-md bg-background hover:bg-accent/10 cursor-pointer text-sm flex justify-between items-center"
                        onClick={() => onSensorSelect(sensor)}
                      >
                        <div>{sensor.name}</div>
                        <Badge 
                          variant={
                            sensor.status === "online" ? "default" : 
                            sensor.status === "warning" ? "warning" : "secondary"
                          }
                        >
                          {sensor.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionContainer>
  );
};

export default SensorFolderList;
