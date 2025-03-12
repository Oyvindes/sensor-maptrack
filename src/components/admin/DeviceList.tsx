
import React from "react";
import { TrackingObject } from "@/types/sensors";
import { Plus, Pencil, Trash, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionContainer, SectionTitle } from "@/components/Layout";

interface DeviceListProps {
  devices: TrackingObject[];
  onDeviceSelect: (device: TrackingObject) => void;
  onAddNew: () => void;
  onDelete?: (deviceId: string) => Promise<boolean>;
}

const DeviceList: React.FC<DeviceListProps> = ({ 
  devices, 
  onDeviceSelect, 
  onAddNew,
  onDelete
}) => {
  const handleDelete = async (deviceId: string, deviceName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other click handlers
    
    if (!onDelete) return;
    
    if (window.confirm(`Are you sure you want to delete "${deviceName}"?`)) {
      await onDelete(deviceId);
    }
  };

  return (
    <SectionContainer>
      <div className="flex justify-between items-center mb-4">
        <SectionTitle>Manage Tracking Devices</SectionTitle>
        <Button 
          onClick={onAddNew} 
          size="sm" 
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Device</span>
        </Button>
      </div>
      
      {devices.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No tracking devices found. Click 'Add Device' to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map(device => (
            <div 
              key={device.id}
              className="glass-card p-4 rounded-lg hover:shadow-md transition-all-ease"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{device.name}</h3>
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onDeviceSelect(device)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  {onDelete && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDelete(device.id, device.name, e)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Position: {device.position.lat.toFixed(4)}, {device.position.lng.toFixed(4)}
              </div>
              <div className="flex justify-between mt-2">
                <div className="text-xs text-muted-foreground">
                  Speed: {device.speed} mph • Battery: {device.batteryLevel}%
                </div>
                {(device as any).folderId && (
                  <div className="text-xs flex items-center gap-1">
                    <Folder className="h-3 w-3" />
                    <span>In folder</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionContainer>
  );
};

export default DeviceList;
