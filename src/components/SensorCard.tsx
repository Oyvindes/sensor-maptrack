
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { getSensorColor, getSensorIconComponent } from "@/utils/sensorUtils";
import { ChevronDown, ChevronUp } from "lucide-react";

export type SensorType = "temperature" | "humidity" | "battery" | "proximity" | "signal";

export type SensorValue = {
  type: SensorType;
  value: number;
  unit: string;
};

export type SensorData = {
  id: string;
  name: string;
  values: SensorValue[];
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
  const [expanded, setExpanded] = useState(false);
  const { values, status, name, lastUpdated } = sensor;
  
  const handleToggle = () => {
    setExpanded(!expanded);
    if (onClick) onClick();
  };

  // Get the primary sensor value (first in the array) for the card header
  const primaryValue = values && values.length > 0 ? values[0] : null;
  const primaryType = primaryValue ? primaryValue.type : "temperature";
  const sensorColor = getSensorColor(primaryType);
  const IconComponent = getSensorIconComponent(primaryType);

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 cursor-pointer transition-all-ease hover:shadow-xl",
        className
      )}
      onClick={handleToggle}
    >
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
      
      {expanded && values && values.length > 0 && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {values.map((sensorValue, index) => {
            const valueColor = getSensorColor(sensorValue.type);
            const ValueIcon = getSensorIconComponent(sensorValue.type);
            const range = ranges[sensorValue.type];
            const formattedValue = typeof sensorValue.value === "number" ? sensorValue.value.toFixed(1) : sensorValue.value;
            
            const percentage = Math.min(
              100,
              Math.max(
                0,
                ((sensorValue.value - range.min) / (range.max - range.min)) * 100
              )
            );
            
            return (
              <div key={index} className="border-t pt-3 first:border-t-0 first:pt-0">
                <div className="flex items-center gap-2 mb-2">
                  <ValueIcon className={cn("h-4 w-4", valueColor)} />
                  <span className="text-sm">{sensorValue.type}</span>
                </div>
                
                <div className="flex items-baseline mb-2">
                  <span className={cn("text-2xl font-bold", valueColor)}>
                    {formattedValue}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    {sensorValue.unit}
                  </span>
                </div>
                
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all ease-out duration-700", valueColor)}
                    style={{ width: `${percentage}%`, opacity: 0.7 }}
                  />
                </div>
                
                <div className="text-xs text-muted-foreground mt-1">
                  Range: {range.min} - {range.max} {sensorValue.unit}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-4 text-xs text-muted-foreground">
        Last updated: {lastUpdated}
      </div>
    </div>
  );
};

export default SensorCard;
