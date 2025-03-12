
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Sensor } from '@/types/sensors';
import { MapIcon } from './MapIcon';
import { Battery, WifiOff, AlertCircle } from 'lucide-react';

interface SensorMarkerProps {
  sensor: Sensor;
  onClick?: (sensor: Sensor) => void;
}

const SensorMarker: React.FC<SensorMarkerProps> = ({ sensor, onClick }) => {
  if (!sensor.location) return null;

  // Create a status icon based on sensor status
  const getStatusIcon = () => {
    switch (sensor.status) {
      case 'offline':
        return <WifiOff className="h-4 w-4 text-gray-500" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Battery className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Marker
      position={[sensor.location.lat, sensor.location.lng]}
      icon={MapIcon('sensor', sensor.status)}
      eventHandlers={{
        click: () => onClick && onClick(sensor),
      }}
    >
      <Popup>
        <div className="min-w-[200px]">
          <h3 className="font-bold">{sensor.name}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            {getStatusIcon()}
            <span>Status: {sensor.status}</span>
          </div>
          {/* Only display reading if it exists */}
          {sensor.lastReading !== undefined && (
            <p className="text-sm">Last reading: {sensor.lastReading} {sensor.unit}</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default SensorMarker;
