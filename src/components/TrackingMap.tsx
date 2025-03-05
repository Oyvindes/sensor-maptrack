
import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Sensor, Device, TrackingObject } from "@/types/sensors";
import { renderToString } from "react-dom/server";
import { Zap } from "lucide-react";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});

// Create a cool custom icon using Lucide's Zap icon
const createCustomIcon = () => {
  const iconHtml = renderToString(
    <Zap size={24} color="#8B5CF6" strokeWidth={2.5} fill="#E5DEFF" />
  );
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const customIcon = createCustomIcon();

// Helper component to programmatically change map view
interface FlyToProps {
  position: [number, number];
  zoom?: number;
}

const FlyToLocation: React.FC<FlyToProps> = ({ position, zoom = 16 }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position[0] !== 0 && position[1] !== 0) {
      map.flyTo(position, zoom, {
        animate: true,
        duration: 1.5
      });
    }
  }, [map, position, zoom]);
  
  return null;
};

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
}) => {
  // Find map center based on first device, sensor, or tracking object, or default to Norway
  const getMapCenter = () => {
    if (focusLocation) {
      return focusLocation;
    }
    if (devices.length > 0 && devices[0].location) {
      return [devices[0].location.lat, devices[0].location.lng];
    }
    if (sensors.length > 0 && sensors[0].location) {
      return [sensors[0].location.lat, sensors[0].location.lng];
    }
    if (objects.length > 0) {
      return [objects[0].position.lat, objects[0].position.lng];
    }
    // Default to Norway
    return [60.472, 8.468];
  };

  const mapCenter = getMapCenter() as [number, number];

  return (
    <div className={className}>
      <MapContainer
        // TypeScript doesn't recognize 'center' as a valid prop for MapContainer
        // Using JSX spread attributes to pass properties to avoid TypeScript errors
        {...{
          center: mapCenter,
          zoom: focusLocation ? focusZoom : 6,
          style: { height: "100%", width: "100%" }
        } as any}
      >
        <TileLayer
          // Using JSX spread attributes to pass properties to avoid TypeScript errors
          {...{
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          } as any}
        />
        
        {/* Add FlyToLocation component to handle dynamic location changes */}
        {focusLocation && <FlyToLocation position={focusLocation} zoom={focusZoom} />}
        
        {/* Display devices */}
        {devices.map((device) => (
          device.location && (
            <Marker
              key={device.id}
              position={[device.location.lat, device.location.lng] as [number, number]}
              // Using the same JSX spread syntax to fix TypeScript icon error
              {...{ icon: customIcon } as any}
              eventHandlers={{
                click: () => onDeviceClick && onDeviceClick(device.id),
              }}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{device.name}</h3>
                  <p>Type: {device.type}</p>
                  <p>Status: {device.status}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
        
        {/* Display sensors */}
        {sensors.map((sensor) => (
          sensor.location && (
            <Marker
              key={sensor.id}
              position={[sensor.location.lat, sensor.location.lng] as [number, number]}
              // Using the same JSX spread syntax to fix TypeScript icon error
              {...{ icon: customIcon } as any}
              eventHandlers={{
                click: () => onSensorClick && onSensorClick(sensor.id),
              }}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{sensor.name}</h3>
                  <p>Type: {sensor.type}</p>
                  <p>Status: {sensor.status}</p>
                  <p>Last Reading: {sensor.lastReading?.value} {sensor.unit}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {/* Display tracking objects */}
        {objects?.map((object) => (
          <Marker
            key={object.id}
            position={[object.position.lat, object.position.lng] as [number, number]}
            // Using the same JSX spread syntax to fix TypeScript icon error
            {...{ icon: customIcon } as any}
            eventHandlers={{
              click: () => onObjectSelect && onObjectSelect(object),
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{object.name}</h3>
                <p>Speed: {object.speed} mph</p>
                <p>Battery: {object.batteryLevel}%</p>
                <p>Last Updated: {object.lastUpdated}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export type { TrackingMapProps };
export default TrackingMap;
