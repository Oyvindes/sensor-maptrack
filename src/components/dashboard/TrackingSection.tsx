
import React from "react";
import TrackingMap from "@/components/TrackingMap";
import { TrackingObject } from "@/types/sensors";
import { SectionContainer, SectionTitle } from "@/components/Layout";

interface TrackingSectionProps {
  trackingObjects: TrackingObject[];
  onObjectSelect: (object: TrackingObject) => void;
}

const TrackingSection: React.FC<TrackingSectionProps> = ({ 
  trackingObjects, 
  onObjectSelect 
}) => {
  return (
    <SectionContainer>
      <SectionTitle>Tracking Map</SectionTitle>
      <TrackingMap 
        objects={trackingObjects} 
        className="w-full animate-fade-up [animation-delay:300ms]"
        onObjectSelect={onObjectSelect}
      />
    </SectionContainer>
  );
};

export default TrackingSection;
