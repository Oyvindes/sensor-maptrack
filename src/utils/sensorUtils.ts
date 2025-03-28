
import { ThermometerSnowflake, Gauge, Battery, Wifi, Zap, Power } from "lucide-react";

// Helper functions for sensor icons and colors
export const getSensorColor = (type: "temperature" | "humidity" | "battery" | "proximity" | "signal" | "adc1" | "power"): string => {
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
    case "adc1":
      return "text-sensor-adc1"; // Wood color (brown)
    case "power":
      return "text-green-500"; // Green for power sensors
    default:
      return "text-primary";
  }
};

// Return the icon component class rather than JSX
export const getSensorIconComponent = (type: "temperature" | "humidity" | "battery" | "proximity" | "signal" | "adc1" | "power") => {
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
    case "adc1":
      return Gauge; // Using Gauge icon for wood moisture
    case "power":
      return Power; // Power icon for smart plugs
    default:
      return Gauge;
  }
};
