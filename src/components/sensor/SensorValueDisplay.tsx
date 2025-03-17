
import React from "react";
import { cn } from "@/lib/utils";
import { getSensorColor, getSensorIconComponent } from "@/utils/sensorUtils";
import { sensorRanges, calculatePercentage } from "@/utils/sensorCardUtils";
import { SensorValue } from "@/types/sensor";
import { SensorType } from "@/components/SensorCard";

type SensorValueDisplayProps = {
  sensorValue: SensorValue;
};

const SensorValueDisplay: React.FC<SensorValueDisplayProps> = ({ sensorValue }) => {
  const sensorType = sensorValue.type as SensorType;
  const valueColor = getSensorColor(sensorType as any);
  const ValueIcon = getSensorIconComponent(sensorType as any);
  const range = sensorRanges[sensorType] || { min: 0, max: 100 };
  const formattedValue = typeof sensorValue.value === "number" 
    ? sensorValue.value.toFixed(1) 
    : sensorValue.value;
  
  const percentage = calculatePercentage(sensorValue.value, sensorType);
  
  return (
    <div className="border-t pt-3 first:border-t-0 first:pt-0">
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
};

export default SensorValueDisplay;
