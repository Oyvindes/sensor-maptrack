import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SensorData } from '@/components/SensorCard';
import { toast } from 'sonner';
import { PageContainer, ContentContainer } from '@/components/Layout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';
import { useNavigate } from 'react-router-dom';

// Local storage key for power sensors
const POWER_SENSORS_STORAGE_KEY = 'power_sensors_data';

const PowerSensorTest: React.FC = () => {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [newSensorName, setNewSensorName] = useState('');
  const [newSensorImei, setNewSensorImei] = useState('');

  // Handle view change for navigation
  const handleViewChange = (view: "dashboard" | "projects" | "tracking" | "help" | "store") => {
    switch(view) {
      case "dashboard":
        navigate("/overview");
        break;
      case "projects":
        navigate("/projects");
        break;
      case "tracking":
        navigate("/track");
        break;
      case "help":
        navigate("/support");
        break;
      case "store":
        navigate("/shop");
        break;
    }
  };

  // Load sensors from local storage on component mount
  useEffect(() => {
    loadSensorsFromLocalStorage();
  }, []);

  // Load sensors from local storage
  const loadSensorsFromLocalStorage = () => {
    try {
      const storedSensors = localStorage.getItem(POWER_SENSORS_STORAGE_KEY);
      if (storedSensors) {
        const parsedSensors = JSON.parse(storedSensors) as SensorData[];
        console.log('Loaded sensors from local storage:', parsedSensors);
        setSensors(parsedSensors);
        toast.success(`Loaded ${parsedSensors.length} sensors from local storage`);
      } else {
        console.log('No sensors found in local storage');
        toast.info('No sensors found in local storage');
      }
    } catch (error) {
      console.error('Error loading sensors from local storage:', error);
      toast.error('Error loading sensors from local storage');
    }
  };

  // Save sensors to local storage
  const saveSensorsToLocalStorage = (sensorsToSave: SensorData[]) => {
    try {
      localStorage.setItem(POWER_SENSORS_STORAGE_KEY, JSON.stringify(sensorsToSave));
      console.log('Saved sensors to local storage:', sensorsToSave);
      toast.success(`Saved ${sensorsToSave.length} sensors to local storage`);
    } catch (error) {
      console.error('Error saving sensors to local storage:', error);
      toast.error('Error saving sensors to local storage');
    }
  };

  // Add a new sensor
  const addSensor = () => {
    if (!newSensorName || !newSensorImei) {
      toast.error('Please enter a name and IMEI for the new sensor');
      return;
    }

    const newSensor: SensorData = {
      id: `sensor-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: newSensorName,
      imei: newSensorImei,
      status: 'online',
      values: [],
      lastUpdated: new Date().toLocaleString(),
      sensorType: 'power'
    };

    const updatedSensors = [...sensors, newSensor];
    setSensors(updatedSensors);
    saveSensorsToLocalStorage(updatedSensors);
    
    // Clear input fields
    setNewSensorName('');
    setNewSensorImei('');
  };

  // Delete a sensor
  const deleteSensor = (id: string) => {
    const updatedSensors = sensors.filter(sensor => sensor.id !== id);
    setSensors(updatedSensors);
    saveSensorsToLocalStorage(updatedSensors);
  };

  // Clear all sensors
  const clearAllSensors = () => {
    setSensors([]);
    localStorage.removeItem(POWER_SENSORS_STORAGE_KEY);
    toast.success('Cleared all sensors from local storage');
  };

  return (
    <PageContainer>
      <DashboardHeader onViewChange={handleViewChange} />
      <DashboardNavigation currentView="dashboard" onViewChange={handleViewChange} />
      <ContentContainer>
        <h1 className="text-2xl font-bold mb-4">Power Sensor Local Storage Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Sensor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Sensor Name</Label>
                <Input
                  id="name"
                  value={newSensorName}
                  onChange={(e) => setNewSensorName(e.target.value)}
                  placeholder="Enter sensor name"
                />
              </div>
              
              <div>
                <Label htmlFor="imei">Sensor IMEI</Label>
                <Input
                  id="imei"
                  value={newSensorImei}
                  onChange={(e) => setNewSensorImei(e.target.value)}
                  placeholder="Enter sensor IMEI"
                />
              </div>
              
              <Button onClick={addSensor}>Add Sensor</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Local Storage Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={loadSensorsFromLocalStorage} className="w-full">
                Reload from Local Storage
              </Button>
              
              <Button onClick={() => saveSensorsToLocalStorage(sensors)} className="w-full">
                Save to Local Storage
              </Button>
              
              <Button onClick={clearAllSensors} variant="destructive" className="w-full">
                Clear All Sensors
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sensors in Local Storage ({sensors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sensors.length === 0 ? (
            <p className="text-center text-muted-foreground">No sensors found in local storage</p>
          ) : (
            <div className="space-y-4">
              {sensors.map((sensor) => (
                <div key={sensor.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-medium">{sensor.name}</p>
                    <p className="text-sm text-muted-foreground">IMEI: {sensor.imei}</p>
                    <p className="text-sm text-muted-foreground">Status: {sensor.status}</p>
                    <p className="text-sm text-muted-foreground">Last Updated: {sensor.lastUpdated}</p>
                    <p className="text-sm text-muted-foreground">ID: {sensor.id}</p>
                  </div>
                  <Button variant="destructive" onClick={() => deleteSensor(sensor.id)}>
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Local Storage Debug</h2>
        <pre className="p-4 bg-gray-100 rounded overflow-auto max-h-96">
          {JSON.stringify(sensors, null, 2)}
        </pre>
      </div>
    </ContentContainer>
  </PageContainer>
);
};

export default PowerSensorTest;