
import React from "react";
import { TrackingObject } from "@/types/sensors";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionContainer, SectionTitle } from "@/components/Layout";

interface DeviceListProps {
  devices: TrackingObject[];
  onDeviceSelect: (device: TrackingObject) => void;
  onAddNew: () => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ 
  devices, 
  onDeviceSelect, 
  onAddNew 
}) => {
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map(device => (
          <div 
            key={device.id}
            className="glass-card p-4 rounded-lg hover:shadow-md transition-all-ease"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{device.name}</h3>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onDeviceSelect(device)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Position: {device.position.lat.toFixed(4)}, {device.position.lng.toFixed(4)}
            </div>
            <div className="text-xs mt-2 text-muted-foreground">
              Speed: {device.speed} mph • Battery: {device.batteryLevel}%
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
};

export default DeviceList;
