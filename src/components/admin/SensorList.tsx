
import React from "react";
import { SensorData } from "@/components/SensorCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { getSensorColor, getSensorIconComponent } from "@/utils/sensorUtils";

interface SensorListProps {
  sensors: SensorData[];
  onSensorSelect: (sensor: SensorData) => void;
  onAddNew: () => void;
}

const SensorList: React.FC<SensorListProps> = ({ 
  sensors, 
  onSensorSelect, 
  onAddNew 
}) => {
  return (
    <SectionContainer>
      <div className="flex justify-between items-center mb-4">
        <SectionTitle>Manage Sensors</SectionTitle>
        <Button 
          onClick={onAddNew} 
          size="sm" 
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Sensor</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map(sensor => {
          const IconComponent = getSensorIconComponent(sensor.type);
          return (
            <div 
              key={sensor.id}
              className="glass-card p-4 rounded-lg cursor-pointer hover:shadow-md transition-all-ease"
              onClick={() => onSensorSelect(sensor)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`sensor-pulse ${getSensorColor(sensor.type)}`}>
                  <IconComponent className="h-5 w-5" />
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
          );
        })}
      </div>
    </SectionContainer>
  );
};

export default SensorList;
