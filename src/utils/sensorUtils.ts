
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

/**
 * Transforms wood sensor readings (adc1) from the range 0-3600 to a percentage value.
 * @param reading - The raw wood sensor reading (0-3600)
 * @returns A string representing the percentage with one decimal place and % symbol
 */
export const woodSensorToPercentage = (reading: number): string => {
  // Calculate percentage: (reading / 3600) * 100
  const percentage = (reading / 3600) * 100;
  
  // Round to one decimal place and ensure it always shows one decimal place
  const roundedPercentage = percentage.toFixed(1);
  
  // Return with % symbol
  return `${roundedPercentage}%`;
};
