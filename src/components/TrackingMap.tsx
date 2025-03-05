
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Sensor, Device } from "@/types/sensors";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "/marker-shadow.png",
  shadowSize: [41, 41],
});

interface TrackingMapProps {
  devices?: Device[];
  sensors?: Sensor[];
  highlightId?: string;
  onDeviceClick?: (deviceId: string) => void;
  onSensorClick?: (sensorId: string) => void;
  className?: string;
}

const TrackingMap: React.FC<TrackingMapProps> = ({
  devices = [],
  sensors = [],
  highlightId,
  onDeviceClick,
  onSensorClick,
  className = "h-[500px] w-full rounded-md border",
}) => {
  // Find map center based on first device or sensor, or default to Norway
  const getMapCenter = () => {
    if (devices.length > 0 && devices[0].location) {
      return [devices[0].location.lat, devices[0].location.lng];
    }
    if (sensors.length > 0 && sensors[0].location) {
      return [sensors[0].location.lat, sensors[0].location.lng];
    }
    // Default to Norway
    return [60.472, 8.468];
  };

  return (
    <MapContainer
      center={getMapCenter() as [number, number]}
      zoom={6}
      className={className}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Display devices */}
      {devices.map((device) => (
        device.location && (
          <Marker
            key={device.id}
            position={[device.location.lat, device.location.lng] as [number, number]}
            icon={customIcon}
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
            icon={customIcon}
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
    </MapContainer>
  );
};

export default TrackingMap;
