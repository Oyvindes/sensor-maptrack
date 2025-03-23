import React, { useState, useEffect } from "react";
import TrackingMap from "@/components/map/TrackingMap";
import { useTrackingObjects } from "@/hooks/useTrackingObjects";
import { Device, TrackingObject } from "@/types/sensors";

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
      </div>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-150px)]">
        <div className="rounded-lg overflow-hidden border bg-background lg:w-2/3 h-full">
          <TrackingMap
            devices={devices}
            objects={trackingObjects}
            fitAllMarkers={initialLoad || shouldResetView}
            autoFitMarkers={false} // Ensure map doesn't auto-fit after initial load
            className="h-full w-full"
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
        
        {/* Device List */}
        <div className="rounded-lg border bg-background p-4 lg:w-1/3 h-full overflow-auto">
          <h3 className="text-md font-medium mb-3">Tracked Devices</h3>
          
          {devices.length === 0 && trackingObjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No devices currently being tracked.</p>
          ) : (
            <div className="space-y-3">
              {/* Tracking Objects */}
              {trackingObjects.map(object => (
                <div key={object.id} className="p-3 border rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{object.name}</h4>
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-0.5 rounded-full">Tracker</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">ID: {object.id.substring(0, 8)}...</p>
                  <p className="text-xs text-muted-foreground">
                    Location: {object.position.lat.toFixed(4)}, {object.position.lng.toFixed(4)}
                  </p>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-muted-foreground">Speed: {object.speed} mph</p>
                    <p className="text-xs text-muted-foreground">Battery: {object.batteryLevel}%</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last Update: {object.lastUpdated}</p>
                </div>
              ))}
              
              {/* Devices that don't have a corresponding tracking object */}
              {devices
                .filter(device => !trackingObjects.some(obj => obj.id === device.id))
                .map(device => (
                  <div key={device.id} className="p-3 border rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{device.name}</h4>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded-full">Device</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">ID: {device.id.substring(0, 8)}...</p>
                    {device.location && (
                      <p className="text-xs text-muted-foreground">
                        Location: {device.location.lat.toFixed(4)}, {device.location.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingSection;
