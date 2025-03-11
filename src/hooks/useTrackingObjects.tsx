import { useState, useEffect } from 'react';
import { Device } from '@/types/sensors';
import { getMockDevices } from '@/services/device/mockDeviceData';

export const useTrackingObjects = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = () => {
      try {
        const deviceData = getMockDevices();
        setDevices(deviceData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching devices:', error);
        setIsLoading(false);
      }
    };

    fetchDevices();
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(fetchDevices, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    devices,
    isLoading,
  };
};
