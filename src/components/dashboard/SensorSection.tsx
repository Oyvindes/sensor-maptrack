
import React from "react";
import { SensorData } from "@/components/SensorCard";
import SensorCard from "@/components/SensorCard";
import { SectionContainer, SectionTitle } from "@/components/Layout";

interface SensorSectionProps {
  sensors: SensorData[];
  isLoading: boolean;
  onSensorClick: (sensor: SensorData) => void;
}

const SensorSection: React.FC<SensorSectionProps> = ({ 
  sensors, 
  isLoading, 
  onSensorClick 
}) => {
  return (
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
                onClick={() => onSensorClick(sensor)}
                className={`animate-fade-up [animation-delay:${index * 100 + 200}ms]`}
              />
            ))
          )}
        </div>
      )}
    </SectionContainer>
  );
};

export default SensorSection;
