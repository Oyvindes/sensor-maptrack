
import { ThermometerSnowflake, Gauge, Battery, Wifi, Zap } from "lucide-react";

// Helper functions for sensor icons and colors
export const getSensorColor = (type: "temperature" | "humidity" | "battery" | "proximity" | "signal"): string => {
  switch (type) {
    case "temperature":
      return "text-sensor-temp";
    case "humidity":
      return "text-sensor-humidity";
    case "battery":
      return "text-sensor-battery";
    case "proximity":
      return "text-sensor-proximity";
    case "signal":
      return "text-sensor-signal";
    default:
      return "text-primary";
  }
};

// Return the icon component class rather than JSX
export const getSensorIconComponent = (type: "temperature" | "humidity" | "battery" | "proximity" | "signal") => {
  switch (type) {
    case "temperature":
      return ThermometerSnowflake;
    case "humidity":
      return Gauge;
    case "battery":
      return Battery;
    case "proximity":
      return Zap;
    case "signal":
      return Wifi;
    default:
      return Gauge;
  }
};
