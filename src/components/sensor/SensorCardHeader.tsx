
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { SensorType } from "@/components/SensorCard";
import { getSensorColor, getSensorIconComponent } from "@/utils/sensorUtils";
import { getStatusIndicatorColor } from "@/utils/sensorCardUtils";
import { Button } from "@/components/ui/button";

type SensorCardHeaderProps = {
  name: string;
  status: "online" | "offline" | "warning";
  primaryType: SensorType;
  expanded: boolean;
  onToggle: () => void;
  sensorType?: 'wood' | 'concrete' | 'power';
};

const SensorCardHeader: React.FC<SensorCardHeaderProps> = ({
  name,
  status,
  primaryType,
  expanded,
  onToggle,
  sensorType,
}) => {
  const sensorColor = getSensorColor(primaryType);
  const IconComponent = getSensorIconComponent(primaryType);

  // Function to handle dashboard button click without triggering card expansion
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from bubbling up to the card
  };

  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <div className={cn("sensor-pulse", sensorColor)}>
          <IconComponent className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
          {sensorType && (
            <span className="text-xs text-muted-foreground capitalize">
              {sensorType} sensor
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {sensorType === 'power' && (
          <Link
            to="/power"
            onClick={handleDashboardClick}
            className="mr-1"
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Dashboard
            </Button>
          </Link>
        )}
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
