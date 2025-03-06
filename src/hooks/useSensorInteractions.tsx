
import { sendCommandToSensor } from '@/services/sensorService';
import { SensorData } from "@/components/SensorCard";
import { toast } from "sonner";

export function useSensorInteractions() {
  const handleSensorClick = async (sensor: SensorData) => {
    try {
      const result = await sendCommandToSensor(sensor.id, "get_status");
      if (result.success) {
        toast.success(`Connected to ${sensor.name}`, {
          description: "Real-time data monitoring enabled"
        });
      }
    } catch (error) {
      toast.error(`Failed to connect to ${sensor.name}`);
    }
  };

  return {
    handleSensorClick
  };
}
