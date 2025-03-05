
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageContainer, ContentContainer } from "@/components/Layout";
import { 
  getMockSensors, 
  getMockTrackingObjects, 
  sendCommandToSensor,
  updateTrackingObject
} from "@/services/sensorService";
import { SensorData } from "@/components/SensorCard";
import { TrackingObject } from "@/components/TrackingMap";
import SensorEditor from "@/components/SensorEditor";
import DeviceEditor from "@/components/DeviceEditor";
import AdminHeader from "@/components/admin/AdminHeader";
import ModeSwitcher from "@/components/admin/ModeSwitcher";
import SensorList from "@/components/admin/SensorList";
import DeviceList from "@/components/admin/DeviceList";

const Admin: React.FC = () => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [trackingObjects, setTrackingObjects] = useState<TrackingObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<TrackingObject | null>(null);
  const [editMode, setEditMode] = useState<"sensors" | "devices">("sensors");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sensorsData = getMockSensors();
        const objectsData = getMockTrackingObjects();
        
        setSensors(sensorsData);
        setTrackingObjects(objectsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSensorUpdate = async (updatedSensor: SensorData) => {
    try {
      // In a real app, we would call an API to update the sensor
      await sendCommandToSensor(updatedSensor.id, "update", updatedSensor);
      
      // Update local state
      setSensors(prev => 
        prev.map(sensor => 
          sensor.id === updatedSensor.id ? updatedSensor : sensor
        )
      );
      
      toast.success(`Sensor ${updatedSensor.name} updated successfully`);
      setSelectedSensor(null);
    } catch (error) {
      toast.error("Failed to update sensor");
      console.error(error);
    }
  };

  const handleDeviceUpdate = async (updatedDevice: TrackingObject) => {
    try {
      // In a real app, we would call an API to update the device
      await updateTrackingObject(updatedDevice.id, updatedDevice);
      
      // Update local state
      setTrackingObjects(prev => 
        prev.map(device => 
          device.id === updatedDevice.id ? updatedDevice : device
        )
      );
      
      toast.success(`Device ${updatedDevice.name} updated successfully`);
      setSelectedDevice(null);
    } catch (error) {
      toast.error("Failed to update device");
      console.error(error);
    }
  };

  const handleAddNewSensor = () => {
    const newSensor: SensorData = {
      id: `sensor-${Date.now()}`,
      name: "New Sensor",
      type: "temperature",
      value: 0,
      unit: "°C",
      status: "offline",
      lastUpdated: new Date().toLocaleTimeString()
    };
    
    setSelectedSensor(newSensor);
  };

  const handleAddNewDevice = () => {
    const newDevice: TrackingObject = {
      id: `device-${Date.now()}`,
      name: "New Device",
      position: { lat: 40.7128, lng: -74.006 },
      lastUpdated: new Date().toLocaleTimeString(),
      speed: 0,
      direction: 0,
      batteryLevel: 100
    };
    
    setSelectedDevice(newDevice);
  };

  return (
    <PageContainer>
      <AdminHeader />

      <ContentContainer>
        <ModeSwitcher 
          currentMode={editMode} 
          onModeChange={setEditMode} 
        />

        {editMode === "sensors" ? (
          selectedSensor ? (
            <SensorEditor 
              sensor={selectedSensor} 
              onSave={handleSensorUpdate}
              onCancel={() => setSelectedSensor(null)}
            />
          ) : (
            <SensorList 
              sensors={sensors}
              onSensorSelect={setSelectedSensor}
              onAddNew={handleAddNewSensor}
            />
          )
        ) : (
          selectedDevice ? (
            <DeviceEditor 
              device={selectedDevice} 
              onSave={handleDeviceUpdate}
              onCancel={() => setSelectedDevice(null)}
            />
          ) : (
            <DeviceList 
              devices={trackingObjects}
              onDeviceSelect={setSelectedDevice}
              onAddNew={handleAddNewDevice}
            />
          )
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default Admin;
