
import React from "react";
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

export const getSensorIcon = (type: "temperature" | "humidity" | "battery" | "proximity" | "signal", className: string) => {
  switch (type) {
    case "temperature":
      return <ThermometerSnowflake className={className} />;
    case "humidity":
      return <Gauge className={className} />;
    case "battery":
      return <Battery className={className} />;
    case "proximity":
      return <Zap className={className} />;
    case "signal":
      return <Wifi className={className} />;
    default:
      return <Gauge className={className} />;
  }
};
