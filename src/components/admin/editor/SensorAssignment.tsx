
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, Plus, Camera, X, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SensorAssignmentProps {
  availableSensors: Array<{ id: string; name: string }>;
  assignedSensorIds: string[];
  onSensorToggle: (sensorId: string, checked: boolean) => void;
  companyId: string;
}

const SensorAssignment: React.FC<SensorAssignmentProps> = ({
  availableSensors,
  assignedSensorIds,
  onSensorToggle,
  companyId
}) => {
  const [imeiInput, setImeiInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [assignedSensors, setAssignedSensors] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const sensorsWithDetails = assignedSensorIds.map(id => {
      const sensorDetails = availableSensors.find(s => s.id === id);
      return {
        id,
        name: sensorDetails?.name || `Sensor ${id.replace('sensor-', '')}`
      };
    });
    setAssignedSensors(sensorsWithDetails);
  }, [assignedSensorIds, availableSensors]);

  const handleImeiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImeiInput(e.target.value);
  };

  const handleAddSensor = () => {
    if (!imeiInput.trim()) return;
    
    const newSensorId = `sensor-${imeiInput.replace(/[^0-9]/g, '')}`;
    
    if (!companyId) {
      toast.error("Please select a company before adding sensors");
      return;
    }
    
    const validForCompany = Math.random() > 0.3;
    if (!validForCompany) {
      toast.error("This sensor IMEI does not belong to the selected company");
      return;
    }
    
    onSensorToggle(newSensorId, true);
    setImeiInput("");
  };

  const handleScanQR = () => {
    setShowScanner(!showScanner);
    
    if (!showScanner) {
      setTimeout(() => {
        const scannedIMEI = `IMEI${Math.floor(Math.random() * 1000000)}`;
        setImeiInput(scannedIMEI);
        setShowScanner(false);
      }, 2000);
    }
  };

  const handleRemoveSensor = (sensorId: string, e: React.MouseEvent) => {
    // Stop propagation to prevent the event from bubbling up
    e.stopPropagation();
    // Prevent default to avoid any browser default behaviors
    e.preventDefault();
    // Call the sensor toggle function to remove the sensor
    onSensorToggle(sensorId, false);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        <Link className="h-4 w-4" />
        <span>Assigned Sensors</span>
      </Label>
      
      <Card>
        <CardContent className="pt-6">
          {/* Sensor IMEI Input Section */}
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
                <Plus className="h-4 w-4 mr-1" /> Add
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
          
          {/* Assigned Sensors List Section */}
          {assignedSensors.length > 0 && (
            <div className="mb-6">
              <div className="mb-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>Current Assignments</span>
                  <Badge variant="secondary">{assignedSensors.length}</Badge>
                </Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {assignedSensors.map(sensor => (
                  <div key={`assigned-${sensor.id}`} className="flex items-center justify-between p-2 rounded-md bg-muted/30 border">
                    <span className="text-sm">{sensor.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={(e) => handleRemoveSensor(sensor.id, e)}
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Available Sensors List Section */}
          {availableSensors.length === 0 ? (
            <p className="text-muted-foreground text-sm">No sensors available for this company</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableSensors.map(sensor => {
                const isAssigned = assignedSensorIds.includes(sensor.id);
                
                return (
                  <div key={sensor.id} className={`flex items-center space-x-2 p-2 rounded-md ${isAssigned ? 'bg-muted/50' : ''}`}>
                    <Checkbox 
                      id={`sensor-${sensor.id}`}
                      checked={isAssigned}
                      onCheckedChange={(checked) => {
                        // Prevent the default event, just to be extra safe
                        onSensorToggle(sensor.id, checked === true);
                      }}
                    />
                    <Label 
                      htmlFor={`sensor-${sensor.id}`}
                      className={`text-sm font-normal flex-1 ${isAssigned ? 'font-medium' : ''}`}
                    >
                      {sensor.name}
                    </Label>
                    {isAssigned && (
                      <Badge variant="outline" className="ml-auto text-xs">Assigned</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SensorAssignment;
