
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SensorType } from "@/components/SensorCard";
import { getSensorColor, getSensorIconComponent } from "@/utils/sensorUtils";
import { getStatusIndicatorColor } from "@/utils/sensorCardUtils";

type SensorCardHeaderProps = {
  name: string;
  status: "online" | "offline" | "warning";
  primaryType: SensorType;
  expanded: boolean;
  onToggle: () => void;
};

const SensorCardHeader: React.FC<SensorCardHeaderProps> = ({
  name,
  status,
  primaryType,
  expanded,
  onToggle,
}) => {
  const sensorColor = getSensorColor(primaryType);
  const IconComponent = getSensorIconComponent(primaryType);

  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <div className={cn("sensor-pulse", sensorColor)}>
          <IconComponent className="h-6 w-6" />
        </div>
        <span className="font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <div 
          className={cn(
            "h-2.5 w-2.5 rounded-full", 
            getStatusIndicatorColor(status)
          )} 
        />
        <span className="text-xs text-muted-foreground">
          {status === "online" ? "Live" : status === "warning" ? "Warning" : "Offline"}
        </span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </div>
    </div>
  );
};

export default SensorCardHeader;
