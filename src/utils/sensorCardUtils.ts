
import { SensorType } from "@/components/SensorCard";

export const sensorRanges = {
  temperature: { min: -20, max: 50 },
  humidity: { min: 0, max: 100 },
  battery: { min: 0, max: 100 },
  proximity: { min: 0, max: 100 },
  signal: { min: 0, max: 100 },
  adc1: { min: 0, max: 100 },
};

export const getStatusIndicatorColor = (status: "online" | "offline" | "warning"): string => {
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

export const calculatePercentage = (value: number, sensorType: SensorType): number => {
  const range = sensorRanges[sensorType];
  return Math.min(
    100,
    Math.max(
      0,
      ((value - range.min) / (range.max - range.min)) * 100
    )
  );
};
