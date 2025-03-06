
import React from "react";
import { SensorData } from "@/components/SensorCard";
import { Plus, Folder, Pencil, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { getSensorColor, getSensorIconComponent } from "@/utils/sensorUtils";

interface SensorListProps {
  sensors: (SensorData & { folderId?: string })[];
  onSensorSelect: (sensor: SensorData & { folderId?: string }) => void;
  onAddNew: () => void;
  onImport: () => void;
}

const SensorList: React.FC<SensorListProps> = ({ 
  sensors, 
  onSensorSelect, 
  onAddNew,
  onImport
}) => {
  // Get folder/project names
  const getFolderName = (folderId?: string) => {
    // This could be improved to fetch actual folder names from a service
    // For now, we'll extract a name from the ID for demonstration
    if (!folderId) return "";
    
    // Extract a readable name from the folder ID (e.g., "folder-001" -> "Project 001")
    const folderNumber = folderId.replace("folder-", "");
    return `Project ${folderNumber}`;
  };

  return (
    <SectionContainer>
      <div className="flex justify-between items-center mb-4">
        <SectionTitle>Manage Sensors</SectionTitle>
        <div className="flex gap-2">
          <Button 
            onClick={onImport} 
            size="sm" 
            variant="outline"
            className="gap-2"
          >
            <FileUp className="h-4 w-4" />
            <span>Import CSV</span>
          </Button>
          <Button 
            onClick={onAddNew} 
            size="sm" 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Sensor</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map(sensor => {
          const primaryValue = sensor.values && sensor.values.length > 0 ? sensor.values[0] : null;
          const primaryType = primaryValue ? primaryValue.type : "temperature";
          const IconComponent = getSensorIconComponent(primaryType);
          const projectName = getFolderName(sensor.folderId);
          
          return (
            <div 
              key={sensor.id}
              className="glass-card p-4 rounded-lg hover:shadow-md transition-all-ease"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`sensor-pulse ${getSensorColor(primaryType)}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">{sensor.name}</h3>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onSensorSelect(sensor)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {sensor.values.length} sensor value{sensor.values.length !== 1 ? 's' : ''}
              </div>
              <div className="flex justify-between mt-2">
                <div className="text-xs text-muted-foreground">
                  Status: {sensor.status}
                </div>
                {sensor.folderId && (
                  <div className="text-xs flex items-center gap-1">
                    <Folder className="h-3 w-3" />
                    <span>{projectName}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionContainer>
  );
};

export default SensorList;
