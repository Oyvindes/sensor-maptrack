
import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "lucide-react";

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
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        <Link className="h-4 w-4" />
        <span>Assigned Sensors</span>
      </Label>
      <Card>
        <CardContent className="pt-6">
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
