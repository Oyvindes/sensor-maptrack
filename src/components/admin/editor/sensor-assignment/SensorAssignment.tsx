
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "lucide-react";
import { toast } from "sonner";

import SensorImeiInput from "./sensor-assignment/SensorImeiInput";
import AssignedSensorsList from "./sensor-assignment/AssignedSensorsList";
import AvailableSensorsList from "./sensor-assignment/AvailableSensorsList";

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
    e.stopPropagation();
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
          <SensorImeiInput
            imeiInput={imeiInput}
            showScanner={showScanner}
            onImeiChange={handleImeiChange}
            onScanQR={handleScanQR}
            onAddSensor={handleAddSensor}
          />
          
          <AssignedSensorsList
            assignedSensors={assignedSensors}
            onRemoveSensor={handleRemoveSensor}
          />
          
          <AvailableSensorsList
            availableSensors={availableSensors}
            assignedSensorIds={assignedSensorIds}
            onSensorToggle={onSensorToggle}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SensorAssignment;
