
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
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-card rounded-full p-2 flex space-x-2 shadow-lg border-2 border-primary/20">
        <Button
          variant={currentMode === "sensors" ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange("sensors")}
          className="gap-2 rounded-full"
        >
          <Gauge className="h-4 w-4" />
          <span className="hidden sm:inline">Sensors</span>
        </Button>
        
        <Button
          variant={currentMode === "devices" ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange("devices")}
          className="gap-2 rounded-full"
        >
          <Cpu className="h-4 w-4" />
          <span className="hidden sm:inline">Devices</span>
        </Button>
        
        <Button
          variant={currentMode === "folders" ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange("folders")}
          className="gap-2 rounded-full"
        >
          <FolderTree className="h-4 w-4" />
          <span className="hidden sm:inline">Folders</span>
        </Button>
        
        <Button
          variant={currentMode === "users" ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange("users")}
          className="gap-2 rounded-full"
        >
          <UsersIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Users</span>
        </Button>
      </div>
    </div>
  );
};

export default ModeSwitcher;
