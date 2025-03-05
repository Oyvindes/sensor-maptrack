
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, X } from "lucide-react";

interface AssignedSensorsListProps {
  assignedSensors: Array<{ id: string; name: string }>;
  onRemoveSensor: (sensorId: string, e: React.MouseEvent) => void;
}

const AssignedSensorsList: React.FC<AssignedSensorsListProps> = ({
  assignedSensors,
  onRemoveSensor
}) => {
  if (assignedSensors.length === 0) {
    return null;
  }

  return (
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
              onClick={(e) => onRemoveSensor(sensor.id, e)}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedSensorsList;
