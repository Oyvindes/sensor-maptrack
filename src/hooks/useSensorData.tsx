
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SensorData } from "@/components/SensorCard";
import { getMockSensors, sendCommandToSensor } from '@/services/sensorService';
import { getCurrentUser } from '@/services/authService';

export function useSensorData() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const sensorsData = getMockSensors();
        // Filter out sensors that don't have a folderId
        const filteredSensors = sensorsData.filter(sensor => sensor.folderId);
        setSensors(filteredSensors);
      } catch (error) {
        console.error("Error fetching sensors:", error);
        toast.error("Failed to load sensor data");
      }
    };

    fetchSensors();
    
    const interval = setInterval(() => {
      setSensors(prev => 
        prev.map(sensor => ({
          ...sensor,
          values: sensor.values.map(value => ({
            ...value,
            value: value.type === "temperature" 
              ? parseFloat((value.value + (Math.random() * 0.4 - 0.2)).toFixed(1))
              : value.type === "humidity"
              ? parseFloat((value.value + (Math.random() * 2 - 1)).toFixed(1))
              : value.type === "battery"
              ? Math.max(0, Math.min(100, value.value - Math.random() * 0.5))
              : parseFloat((value.value + (Math.random() * 2 - 1)).toFixed(1)),
          })),
          lastUpdated: new Date().toLocaleTimeString()
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleSensorClick = async (sensor: SensorData) => {
    setSelectedSensor(sensor);
    
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
    sensors,
    selectedSensor,
    handleSensorClick
  };
}
