
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "lucide-react";
import { toast } from "sonner";
import SensorImeiInput from "./sensor-assignment/SensorImeiInput";
import AssignedSensorsList from "./sensor-assignment/AssignedSensorsList";
import AvailableSensorsList from "./sensor-assignment/AvailableSensorsList";
import { scanSensorQrCode } from "@/utils/cameraUtils";

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
  const [scanning, setScanning] = useState(false);
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

  const handleScanQR = async () => {
    try {
      setScanning(true);
      setShowScanner(true);
      
      // This is a simulated delay to show the scanning UI
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = await scanSensorQrCode();
      
      if (result.success && result.data) {
        // Set the IMEI input value
        setImeiInput(result.data);
        
        // Create sensor ID from the scanned data
        const newSensorId = `sensor-${result.data.replace(/[^0-9]/g, '')}`;
        
        if (!companyId) {
          toast.error("Please select a company before adding sensors");
          return;
        }
        
        // Check if the sensor is valid for the company (same logic as in handleAddSensor)
        const validForCompany = Math.random() > 0.3;
        if (!validForCompany) {
          toast.error("This sensor IMEI does not belong to the selected company");
          return;
        }
        
        // Add the sensor to the project
        onSensorToggle(newSensorId, true);
        
        // Clear the input field after adding
        setImeiInput("");
        
        toast.success("QR code scanned and sensor added successfully");
      } else {
        toast.error(result.error || "Failed to scan QR code");
      }
    } catch (error) {
      console.error("Error scanning QR code:", error);
      toast.error("An error occurred while scanning");
    } finally {
      // Use a small delay before hiding the scanner UI to make the transition smoother
      setTimeout(() => {
        setScanning(false);
        setShowScanner(false);
      }, 300);
    }
  };

  const handleRemoveSensor = (sensorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
            scanning={scanning}
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
