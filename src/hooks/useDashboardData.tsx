
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TrackingObject } from "@/types/sensors";
import { SensorData } from "@/components/SensorCard";
import { 
  getMockSensors, 
  getMockTrackingObjects,
  sendCommandToSensor 
} from '@/services/sensorService';

export function useDashboardData() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [trackingObjects, setTrackingObjects] = useState<TrackingObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sensorsData = getMockSensors();
        const objectsData = getMockTrackingObjects();
        
        // Filter out sensors that don't have a folderId
        const filteredSensors = sensorsData.filter(sensor => sensor.folderId);
        
        setSensors(filteredSensors);
        setTrackingObjects(objectsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
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
      
      setTrackingObjects(prev => 
        prev.map(obj => ({
          ...obj,
          position: {
            lat: obj.position.lat + (Math.random() * 0.002 - 0.001),
            lng: obj.position.lng + (Math.random() * 0.002 - 0.001)
          },
          lastUpdated: new Date().toLocaleTimeString()
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const handleObjectSelect = (object: TrackingObject) => {
    toast.info(`${object.name} selected`, {
      description: `Speed: ${object.speed}mph, Battery: ${object.batteryLevel}%`
    });
  };

  const handleRefresh = () => {
    toast.info("Refreshing data...");
    
    setTimeout(() => {
      setSensors(getMockSensors());
      setTrackingObjects(getMockTrackingObjects());
      toast.success("Data refreshed successfully");
    }, 1000);
  };

  return {
    sensors,
    trackingObjects,
    isLoading,
    selectedSensor,
    handleSensorClick,
    handleObjectSelect,
    handleRefresh
  };
}
