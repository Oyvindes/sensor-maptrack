
import { useState, useEffect } from "react";
import { TrackingObject } from "@/types/sensors";
import { getMockTrackingObjects } from '@/services/sensorService';
import { toast } from "sonner";

export function useTrackingObjects() {
  const [trackingObjects, setTrackingObjects] = useState<TrackingObject[]>([]);

  useEffect(() => {
    try {
      const objectsData = getMockTrackingObjects();
      setTrackingObjects(objectsData);
    } catch (error) {
      console.error("Error fetching tracking objects:", error);
    }
    
    const interval = setInterval(() => {
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

  const handleObjectSelect = (object: TrackingObject) => {
    toast.info(`${object.name} selected`, {
      description: `Speed: ${object.speed}mph, Battery: ${object.batteryLevel}%`
    });
  };

  return {
    trackingObjects,
    setTrackingObjects,
    handleObjectSelect
  };
}
