import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  PageContainer, 
  PageHeader, 
  PageTitle, 
  PageSubtitle, 
  ContentContainer,
  SectionContainer,
  SectionTitle
} from "@/components/Layout";
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
import { Button } from "@/components/ui/button";
import { Plus, Save, ArrowLeft, ThermometerSnowflake, Gauge, Battery, Wifi, Zap } from "lucide-react";
import { Link } from "react-router-dom";

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
      <PageHeader>
        <div className="flex items-center justify-between">
          <div>
            <PageTitle>Admin Panel</PageTitle>
            <PageSubtitle>
              Manage sensors and tracking devices
            </PageSubtitle>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              asChild
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </PageHeader>

      <ContentContainer>
        <div className="flex gap-4 mb-8">
          <Button 
            variant={editMode === "sensors" ? "default" : "outline"} 
            onClick={() => setEditMode("sensors")}
          >
            Sensors
          </Button>
          <Button 
            variant={editMode === "devices" ? "default" : "outline"} 
            onClick={() => setEditMode("devices")}
          >
            Tracking Devices
          </Button>
        </div>

        {editMode === "sensors" ? (
          <SectionContainer>
            <div className="flex justify-between items-center mb-4">
              <SectionTitle>Manage Sensors</SectionTitle>
              <Button 
                onClick={handleAddNewSensor} 
                size="sm" 
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Sensor</span>
              </Button>
            </div>
            
            {selectedSensor ? (
              <SensorEditor 
                sensor={selectedSensor} 
                onSave={handleSensorUpdate}
                onCancel={() => setSelectedSensor(null)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sensors.map(sensor => (
                  <div 
                    key={sensor.id}
                    className="glass-card p-4 rounded-lg cursor-pointer hover:shadow-md transition-all-ease"
                    onClick={() => setSelectedSensor(sensor)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`sensor-pulse ${getSensorColor(sensor.type)}`}>
                        {getSensorIcon(sensor.type, "h-5 w-5")}
                      </div>
                      <h3 className="font-medium">{sensor.name}</h3>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sensor.type} - {sensor.value} {sensor.unit}
                    </div>
                    <div className="text-xs mt-2 text-muted-foreground">
                      Status: {sensor.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionContainer>
        ) : (
          <SectionContainer>
            <div className="flex justify-between items-center mb-4">
              <SectionTitle>Manage Tracking Devices</SectionTitle>
              <Button 
                onClick={handleAddNewDevice} 
                size="sm" 
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Device</span>
              </Button>
            </div>
            
            {selectedDevice ? (
              <DeviceEditor 
                device={selectedDevice} 
                onSave={handleDeviceUpdate}
                onCancel={() => setSelectedDevice(null)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trackingObjects.map(device => (
                  <div 
                    key={device.id}
                    className="glass-card p-4 rounded-lg cursor-pointer hover:shadow-md transition-all-ease"
                    onClick={() => setSelectedDevice(device)}
                  >
                    <h3 className="font-medium mb-2">{device.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      Position: {device.position.lat.toFixed(4)}, {device.position.lng.toFixed(4)}
                    </div>
                    <div className="text-xs mt-2 text-muted-foreground">
                      Speed: {device.speed} mph • Battery: {device.batteryLevel}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionContainer>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

// Helper functions for sensor icons and colors
const getSensorColor = (type: "temperature" | "humidity" | "battery" | "proximity" | "signal"): string => {
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

const getSensorIcon = (type: "temperature" | "humidity" | "battery" | "proximity" | "signal", className: string) => {
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

export default Admin;
