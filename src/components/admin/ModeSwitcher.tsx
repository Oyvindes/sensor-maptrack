
import React from "react";
import { Button } from "@/components/ui/button";

interface ModeSwitcherProps {
  currentMode: "sensors" | "devices";
  onModeChange: (mode: "sensors" | "devices") => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ 
  currentMode, 
  onModeChange 
}) => {
  return (
    <div className="flex gap-4 mb-8">
      <Button 
        variant={currentMode === "sensors" ? "default" : "outline"} 
        onClick={() => onModeChange("sensors")}
      >
        Sensors
      </Button>
      <Button 
        variant={currentMode === "devices" ? "default" : "outline"} 
        onClick={() => onModeChange("devices")}
      >
        Tracking Devices
      </Button>
    </div>
  );
};

export default ModeSwitcher;
