import React, { useState, useEffect } from "react";
import TrackingMap from "@/components/map/TrackingMap";
import { useTrackingObjects } from "@/hooks/useTrackingObjects";
import { Device, TrackingObject } from "@/types/sensors";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface TrackingSectionProps {
  className?: string;
}

const TrackingSection: React.FC<TrackingSectionProps> = ({ className }) => {
  const { devices, trackingObjects, isLoading } = useTrackingObjects();
  const [shouldResetView, setShouldResetView] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Handle initial load to fit all markers once
  useEffect(() => {
    if (!isLoading && initialLoad) {
      // Set initialLoad to false after a short delay to allow the map to load
      setTimeout(() => setInitialLoad(false), 1000);
    }
  }, [isLoading, initialLoad]);

  // Handle reset view button click
  const handleResetView = () => {
    setShouldResetView(true);
    // Reset the state after a short delay to allow the map to reset
    setTimeout(() => setShouldResetView(false), 1000);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-48 sm:h-96">Loading...</div>;
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Asset Tracking</h2>
        <Button
          onClick={handleResetView}
          variant="outline"
          size="sm"
          className="h-7 sm:h-9 text-xs sm:text-sm"
        >
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Reset View
        </Button>
      </div>
      <div className="rounded-lg overflow-hidden border bg-background">
        <TrackingMap
          devices={devices}
          objects={trackingObjects}
          fitAllMarkers={initialLoad || shouldResetView}
          autoFitMarkers={false} // Ensure map doesn't auto-fit after initial load
          className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] w-full"
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
                <div className="max-w-[250px] sm:max-w-[300px]">
                  <h3 className="font-medium text-sm sm:text-base">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">ID: {item.id}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Location: {item.position.lat.toFixed(4)}, {item.position.lng.toFixed(4)}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Speed: {item.speed} mph</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Battery: {item.batteryLevel}%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Last Update: {item.lastUpdated}</p>
                </div>
              );
            } else {
              // It's a device
              return (
                <div className="max-w-[250px] sm:max-w-[300px]">
                  <h3 className="font-medium text-sm sm:text-base">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">ID: {item.id}</p>
                  {item.location && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Location: {item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}
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
