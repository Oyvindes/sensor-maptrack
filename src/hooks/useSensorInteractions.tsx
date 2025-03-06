
import { sendCommandToSensor, sendMqttCommandToSensor, registerForSensorUpdates } from '@/services/sensorService';
import { SensorData } from "@/components/SensorCard";
import { toast } from "sonner";
import { useState, useEffect } from 'react';

export function useSensorInteractions() {
  const [activeSensors, setActiveSensors] = useState<Record<string, boolean>>({});
  const [useMqtt, setUseMqtt] = useState<boolean>(false);

  // Cleanup function for MQTT subscriptions
  useEffect(() => {
    const cleanupFunctions: Array<() => void> = [];
    
    // When component unmounts, clean up all subscriptions
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, []);

  const handleSensorClick = async (sensor: SensorData) => {
    try {
      // Try to send command using MQTT if enabled, otherwise fall back to HTTP
      const result = useMqtt
        ? await sendMqttCommandToSensor(sensor.id, "get_status")
        : await sendCommandToSensor(sensor.id, "get_status");
      
      if (result.success) {
        toast.success(`Connected to ${sensor.name}`, {
          description: "Real-time data monitoring enabled"
        });
        
        // If this is the first time connecting to this sensor
        if (!activeSensors[sensor.id] && useMqtt) {
          // Register for updates
          const cleanup = registerForSensorUpdates(sensor, (topic, payload) => {
            console.log(`Received update from ${sensor.name}:`, payload);
            // Here you could update UI or state based on the sensor data
          });
          
          // Store the active state
          setActiveSensors(prev => ({
            ...prev,
            [sensor.id]: true
          }));
        }
      }
    } catch (error) {
      toast.error(`Failed to connect to ${sensor.name}`);
    }
  };

  const toggleMqttMode = () => {
    setUseMqtt(prev => !prev);
    toast.info(`MQTT mode ${!useMqtt ? 'enabled' : 'disabled'}`);
  };

  return {
    handleSensorClick,
    useMqtt,
    toggleMqttMode,
    activeSensors
  };
}
