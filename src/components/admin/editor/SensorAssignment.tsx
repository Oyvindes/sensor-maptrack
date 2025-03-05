
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, Plus, Camera } from "lucide-react";

interface SensorAssignmentProps {
  availableSensors: Array<{ id: string; name: string }>;
  assignedSensorIds: string[];
  onSensorToggle: (sensorId: string, checked: boolean) => void;
}

const SensorAssignment: React.FC<SensorAssignmentProps> = ({
  availableSensors,
  assignedSensorIds,
  onSensorToggle
}) => {
  const [imeiInput, setImeiInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const handleImeiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImeiInput(e.target.value);
  };

  const handleAddSensor = () => {
    if (!imeiInput.trim()) return;
    
    // In a real application, you would search for a sensor with this IMEI
    // or create a new one if it doesn't exist
    
    // Simulating a new sensor ID based on the IMEI
    const newSensorId = `sensor-${imeiInput.replace(/[^0-9]/g, '')}`;
    
    // Add the sensor to assigned sensors
    onSensorToggle(newSensorId, true);
    
    // Clear input
    setImeiInput("");
  };

  const handleScanQR = () => {
    // In a real implementation, this would activate the camera
    setShowScanner(!showScanner);
    
    // Simulating a successful scan after 2 seconds
    if (!showScanner) {
      setTimeout(() => {
        const scannedIMEI = `IMEI${Math.floor(Math.random() * 1000000)}`;
        setImeiInput(scannedIMEI);
        setShowScanner(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        <Link className="h-4 w-4" />
        <span>Assigned Sensors</span>
      </Label>
      
      <Card>
        <CardContent className="pt-6">
          {/* IMEI Input and Scanner */}
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <Input 
                placeholder="Enter sensor IMEI number" 
                value={imeiInput}
                onChange={handleImeiChange}
                className="flex-1"
              />
              <Button onClick={handleScanQR} variant="outline" size="icon">
                <Camera className="h-4 w-4" />
              </Button>
              <Button onClick={handleAddSensor} disabled={!imeiInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {showScanner && (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-center">
                <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 mb-2 flex items-center justify-center">
                  <Camera className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-sm text-muted-foreground">Point camera at QR code</p>
              </div>
            )}
          </div>
          
          {/* Available Sensors List */}
          <div className="mb-2">
            <Label className="text-sm font-medium">Available Sensors</Label>
          </div>
          
          {availableSensors.length === 0 ? (
            <p className="text-muted-foreground text-sm">No sensors available for this company</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableSensors.map(sensor => (
                <div key={sensor.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`sensor-${sensor.id}`}
                    checked={(assignedSensorIds || []).includes(sensor.id)}
                    onCheckedChange={(checked) => 
                      onSensorToggle(sensor.id, checked === true)
                    }
                  />
                  <Label 
                    htmlFor={`sensor-${sensor.id}`}
                    className="text-sm font-normal"
                  >
                    {sensor.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SensorAssignment;
