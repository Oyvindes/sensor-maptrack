import React from "react";
import { cn } from "@/lib/utils";
import { getSensorColor, getSensorIconComponent } from "@/utils/sensorUtils";

export type SensorType = "temperature" | "humidity" | "battery" | "proximity" | "signal";

export type SensorData = {
  id: string;
  name: string;
  type: SensorType;
  value: number;
  unit: string;
  status: "online" | "offline" | "warning";
  lastUpdated: string;
  companyId?: string;
};

const ranges = {
  temperature: { min: -20, max: 50 },
  humidity: { min: 0, max: 100 },
  battery: { min: 0, max: 100 },
  proximity: { min: 0, max: 100 },
  signal: { min: 0, max: 100 },
};

type SensorCardProps = {
  sensor: SensorData;
  onClick?: () => void;
  className?: string;
};

const getStatusIndicatorColor = (status: "online" | "offline" | "warning"): string => {
  switch (status) {
    case "online":
      return "bg-sensor-battery";
    case "offline":
      return "bg-muted-foreground";
    case "warning":
      return "bg-sensor-signal";
    default:
      return "bg-muted-foreground";
  }
};

const SensorCard: React.FC<SensorCardProps> = ({ sensor, onClick, className }) => {
  const { type, value, unit, status, name, lastUpdated, companyId } = sensor;
  const sensorColor = getSensorColor(type);
  const formattedValue = typeof value === "number" ? value.toFixed(1) : value;
  const IconComponent = getSensorIconComponent(type);
  
  const range = ranges[type];
  const percentage = Math.min(
    100,
    Math.max(
      0,
      ((value - range.min) / (range.max - range.min)) * 100
    )
  );

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 cursor-pointer transition-all-ease hover:shadow-xl group",
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("sensor-pulse", sensorColor)}>
            <IconComponent className="h-6 w-6" />
          </div>
          <span className="font-medium text-sm">{name}</span>
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
        </div>
      </div>
      
      <div className="mt-4 mb-3">
        <div className="flex items-baseline">
          <span className={cn("text-3xl font-bold", sensorColor)}>{formattedValue}</span>
          <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>
      
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all ease-out duration-700", sensorColor)}
          style={{ width: `${percentage}%`, opacity: 0.7 }}
        />
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        Last updated: {lastUpdated}
      </div>

      <div className="mt-4 h-0 overflow-hidden opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all-ease">
        <div className="text-sm pt-2 border-t border-border">
          <div className="flex justify-between">
            <span>Range</span>
            <span>{range.min} - {range.max} {unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorCard;
