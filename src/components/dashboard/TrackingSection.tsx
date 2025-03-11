import React from "react";
import TrackingMap from "@/components/map/TrackingMap";
import { useTrackingObjects } from "@/hooks/useTrackingObjects";
import { Device } from "@/types/sensors";

interface TrackingSectionProps {
  className?: string;
}

const TrackingSection: React.FC<TrackingSectionProps> = ({ className }) => {
  const { devices, isLoading } = useTrackingObjects();

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">Tracking</h2>
      <div className="rounded-lg overflow-hidden border bg-background">
        <TrackingMap
          devices={devices}
          fitAllMarkers={true}
          className="h-[600px] w-full"
          onDeviceClick={(deviceId) => {
            console.log('Device clicked:', deviceId);
            // Add device click handler implementation here
          }}
          renderCustomPopup={(item: Device) => (
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-muted-foreground">ID: {item.id}</p>
              {item.location && (
                <p className="text-sm text-muted-foreground">
                  Location: {item.location.lat.toFixed(6)}, {item.location.lng.toFixed(6)}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default TrackingSection;
