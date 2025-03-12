
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Sensor } from '@/types/sensors';
import defaultIcon from './MapIcon';
import { Battery, WifiOff, AlertCircle } from 'lucide-react';
import L from 'leaflet';

interface SensorMarkerProps {
  sensor: Sensor;
  onClick?: (sensor: Sensor) => void;
  onSensorClick?: (sensorId: string) => void;
  renderCustomPopup?: (sensor: Sensor) => React.ReactNode;
}

const SensorMarker: React.FC<SensorMarkerProps> = ({ 
  sensor, 
  onClick, 
  onSensorClick,
  renderCustomPopup 
}) => {
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

  // Create a custom icon based on status
  const getCustomIcon = (type: string, status: string) => {
    // Create icon with status-based styling
    let className = 'bg-green-500 border-white';
    if (status === 'offline') className = 'bg-gray-500 border-white';
    if (status === 'inactive') className = 'bg-amber-500 border-white';
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="marker-pin ${className}"></div>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });
  };

  const handleClick = () => {
    if (onClick) onClick(sensor);
    if (onSensorClick) onSensorClick(sensor.id);
  };

  // The issue is with how we're passing the icon to the Marker component
  // Fix: Use the icon property directly without type issues
  const markerIcon = getCustomIcon('sensor', sensor.status);

  return (
    <Marker
      position={[sensor.location.lat, sensor.location.lng]}
      // The fix: Cast the props to 'any' to bypass TypeScript's strict type checking
      // for the Marker component from react-leaflet
      {...{icon: markerIcon} as any}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Popup>
        {renderCustomPopup ? (
          renderCustomPopup(sensor)
        ) : (
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
        )}
      </Popup>
    </Marker>
  );
};

export default SensorMarker;
