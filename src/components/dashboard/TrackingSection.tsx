
import React from "react";
import TrackingMap from "@/components/map/TrackingMap";
import { useTrackingObjects } from "@/hooks/useTrackingObjects";
import { Device, TrackingObject } from "@/types/sensors";

interface TrackingSectionProps {
  className?: string;
}

const TrackingSection: React.FC<TrackingSectionProps> = ({ className }) => {
  const { devices, trackingObjects, isLoading } = useTrackingObjects();

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">Asset Tracking</h2>
      <div className="rounded-lg overflow-hidden border bg-background">
        <TrackingMap
          devices={devices}
          objects={trackingObjects}
          fitAllMarkers={true}
          className="h-[600px] w-full"
          onDeviceClick={(deviceId) => {
            console.log('Device clicked:', deviceId);
            // Add device click handler implementation here
          }}
          onObjectSelect={(object) => {
            console.log('Object selected:', object);
            // Handle object selection here
          }}
          renderCustomPopup={(item: Device | TrackingObject) => {
            if ('position' in item) {
              // It's a tracking object
              return (
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {item.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Location: {item.position.lat.toFixed(6)}, {item.position.lng.toFixed(6)}
                  </p>
                  <p className="text-sm text-muted-foreground">Speed: {item.speed} mph</p>
                  <p className="text-sm text-muted-foreground">Battery: {item.batteryLevel}%</p>
                  <p className="text-sm text-muted-foreground">Last Update: {item.lastUpdated}</p>
                </div>
              );
            } else {
              // It's a device
              return (
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {item.id}</p>
                  {item.location && (
                    <p className="text-sm text-muted-foreground">
                      Location: {item.location.lat.toFixed(6)}, {item.location.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              );
            }
          }}
        />
      </div>
    </div>
  );
};

export default TrackingSection;
