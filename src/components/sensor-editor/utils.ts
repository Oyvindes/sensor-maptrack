
import { SensorType } from "@/components/SensorCard";

export function getDefaultUnit(type: SensorType): string {
  switch (type) {
    case "temperature":
      return "°C";
    case "humidity":
      return "%";
    case "battery":
      return "%";
    case "proximity":
      return "cm";
    case "signal":
      return "dBm";
    case "adc1":
      return "%";
    default:
      return "";
  }
}
