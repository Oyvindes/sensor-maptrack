
import React from "react";
import { Marker, Popup } from "react-leaflet";
import { Sensor } from "@/types/sensors";

interface SensorMarkerProps {
  sensor: Sensor;
  onSensorClick?: (sensorId: string) => void;
  renderCustomPopup?: (sensor: Sensor) => React.ReactNode;
}

const SensorMarker: React.FC<SensorMarkerProps> = ({ 
  sensor, 
  onSensorClick, 
  renderCustomPopup 
}) => {
  if (!sensor.location) return null;
  
  return (
    <Marker
      key={sensor.id}
      position={[sensor.location.lat, sensor.location.lng] as [number, number]}
      eventHandlers={{
        click: () => onSensorClick && onSensorClick(sensor.id),
      }}
    >
      <Popup>
        {renderCustomPopup ? renderCustomPopup(sensor) : (
          <div>
            <h3 className="font-bold">{sensor.name}</h3>
            <p>Type: {sensor.type}</p>
            <p>Status: {sensor.status}</p>
            <p>Last Reading: {sensor.lastReading?.value} {sensor.unit}</p>
          </div>
        )}
      </Popup>
    </Marker>
  );
};

export default SensorMarker;
