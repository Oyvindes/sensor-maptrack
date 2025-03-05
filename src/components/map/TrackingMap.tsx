
import React, { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Sensor, Device, TrackingObject } from "@/types/sensors";
import FlyToLocation from "./FlyToLocation";
import DeviceMarker from "./DeviceMarker";
import SensorMarker from "./SensorMarker";
import TrackingObjectMarker from "./TrackingObjectMarker";
import { getMapCenter, addPopupInteractionStyles } from "./mapUtils";
import "./MapIcon"; // Import to ensure default icon is set

interface TrackingMapProps {
  devices?: Device[];
  sensors?: Sensor[];
  objects?: TrackingObject[];
  highlightId?: string;
  focusLocation?: [number, number];
  focusZoom?: number;
  onDeviceClick?: (deviceId: string) => void;
  onSensorClick?: (sensorId: string) => void;
  onObjectSelect?: (object: TrackingObject) => void;
  className?: string;
  renderCustomPopup?: (item: Device | Sensor | TrackingObject) => React.ReactNode;
}

const TrackingMap: React.FC<TrackingMapProps> = ({
  devices = [],
  sensors = [],
  objects = [],
  highlightId,
  focusLocation,
  focusZoom = 16,
  onDeviceClick,
  onSensorClick,
  onObjectSelect,
  className = "h-[500px] w-full rounded-md border",
  renderCustomPopup
}) => {
  const mapCenter = getMapCenter(focusLocation, devices, sensors, objects);

  useEffect(() => {
    // Disable auto-close for popups when clicking inside them (for buttons)
    const style = addPopupInteractionStyles();
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className={className}>
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        // Need to explicitly type this as any to work around the type error
        // The react-leaflet types are not correctly matching the actual props
        {...{center: mapCenter, zoom: focusLocation ? focusZoom : 13} as any}
      >
        <TileLayer
          // Need to explicitly type this as any to work around the type error
          {...{
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          } as any}
        />
        
        {/* Add FlyToLocation component to handle dynamic location changes */}
        {focusLocation && <FlyToLocation position={focusLocation} zoom={focusZoom} />}
        
        {/* Display devices */}
        {devices.map((device) => (
          <DeviceMarker 
            key={device.id}
            device={device}
            onDeviceClick={onDeviceClick}
            renderCustomPopup={renderCustomPopup as (device: Device) => React.ReactNode}
          />
        ))}
        
        {/* Display sensors */}
        {sensors.map((sensor) => (
          <SensorMarker
            key={sensor.id}
            sensor={sensor}
            onSensorClick={onSensorClick}
            renderCustomPopup={renderCustomPopup as (sensor: Sensor) => React.ReactNode}
          />
        ))}

        {/* Display tracking objects */}
        {objects?.map((object) => (
          <TrackingObjectMarker
            key={object.id}
            object={object}
            onObjectSelect={onObjectSelect}
            renderCustomPopup={renderCustomPopup as (object: TrackingObject) => React.ReactNode}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export type { TrackingMapProps };
export default TrackingMap;
