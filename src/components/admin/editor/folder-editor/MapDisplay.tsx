
import React from "react";
import TrackingMap from "@/components/TrackingMap";

interface MapDisplayProps {
  mapLocation: { lat: number; lng: number } | null;
  mapFocusPosition?: [number, number];
  projectName: string;
  companyId: string;
  visible: boolean;
}

const MapDisplay: React.FC<MapDisplayProps> = ({
  mapLocation,
  mapFocusPosition,
  projectName,
  companyId,
  visible
}) => {
  if (!mapLocation || !visible) return null;

  return (
    <div className="border rounded-md overflow-hidden h-64 mb-4 relative z-0">
      <TrackingMap
        className="h-full w-full"
        devices={[{
          id: "project-location",
          name: projectName || "Project Location",
          type: "project",
          status: "online",
          location: mapLocation,
          companyId: companyId
        }]}
        focusLocation={mapFocusPosition}
        focusZoom={16}
      />
    </div>
  );
};

export default MapDisplay;
