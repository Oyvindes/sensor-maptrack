
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import SensorCard, { SensorData, SensorValue } from "./SensorCard";
import TrackingMap from "./TrackingMap";
import { TrackingObject } from "@/types/sensors";
import { 
  PageContainer, 
  PageHeader, 
  PageTitle, 
  PageSubtitle, 
  ContentContainer,
  SectionContainer,
  SectionTitle
} from "./Layout";
import { 
  getMockSensors, 
  getMockTrackingObjects, 
  sendCommandToSensor 
} from '@/services/sensorService';
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings } from "lucide-react";
import { getCurrentUser } from "@/services/authService";

const Dashboard: React.FC = () => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [trackingObjects, setTrackingObjects] = useState<TrackingObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const currentUser = getCurrentUser();

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

  return (
    <PageContainer>
      <PageHeader>
        <div className="flex items-center justify-between">
          <div>
            <PageTitle>Sensor Monitoring & Tracking</PageTitle>
            <PageSubtitle>
              Real-time dashboard for sensor data and object tracking
            </PageSubtitle>
            {currentUser && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span>Logged in as: {currentUser.name} ({currentUser.role})</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="gap-2"
              asChild
            >
              <Link to="/admin">
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            </Button>
          </div>
        </div>
      </PageHeader>

      <ContentContainer>
        <SectionContainer>
          <SectionTitle>Tracking Map</SectionTitle>
          <TrackingMap 
            objects={trackingObjects} 
            className="w-full animate-fade-up [animation-delay:300ms]"
            onObjectSelect={handleObjectSelect}
          />
        </SectionContainer>

        <SectionContainer>
          <SectionTitle>Sensor Readings</SectionTitle>
          {sensors.length === 0 && !isLoading ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No sensors found that are assigned to folders.</p>
              <p className="text-sm mt-2">Go to Admin page to assign sensors to folders.</p>
            </div>
          ) : (
            <div className="sensor-grid animate-fade-up [animation-delay:400ms]">
              {isLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <div 
                    key={index}
                    className="glass-card rounded-xl p-6 animate-pulse-soft"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="h-4 bg-secondary rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-secondary rounded w-1/2 mb-2"></div>
                    <div className="h-2 bg-secondary rounded-full w-full"></div>
                    <div className="h-4 bg-secondary rounded w-1/3 mt-4"></div>
                  </div>
                ))
              ) : (
                sensors.map((sensor, index) => (
                  <SensorCard 
                    key={sensor.id} 
                    sensor={sensor} 
                    onClick={() => handleSensorClick(sensor)}
                    className={`animate-fade-up [animation-delay:${index * 100 + 200}ms]`}
                  />
                ))
              )}
            </div>
          )}
        </SectionContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default Dashboard;
