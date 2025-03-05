
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Gauge, 
  Cpu, 
  Users as UsersIcon,
  FolderTree
} from 'lucide-react';

interface ModeSwitcherProps {
  currentMode: "sensors" | "devices" | "users" | "folders";
  onModeChange: (mode: "sensors" | "devices" | "users" | "folders") => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ 
  currentMode = "sensors", 
  onModeChange
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="glass-card rounded-lg p-1 flex space-x-1">
        <Button
          variant={currentMode === "sensors" ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange("sensors")}
          className="gap-2"
        >
          <Gauge className="h-4 w-4" />
          <span>Sensors</span>
        </Button>
        
        <Button
          variant={currentMode === "devices" ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange("devices")}
          className="gap-2"
        >
          <Cpu className="h-4 w-4" />
          <span>Devices</span>
        </Button>
        
        <Button
          variant={currentMode === "folders" ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange("folders")}
          className="gap-2"
        >
          <FolderTree className="h-4 w-4" />
          <span>Folders</span>
        </Button>
        
        <Button
          variant={currentMode === "users" ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange("users")}
          className="gap-2"
        >
          <UsersIcon className="h-4 w-4" />
          <span>Users</span>
        </Button>
      </div>
    </div>
  );
};

export default ModeSwitcher;
