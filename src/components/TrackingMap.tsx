
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { Map, Navigation } from 'lucide-react';

export type TrackingObject = {
  id: string;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  lastUpdated: string;
  speed?: number;
  direction?: number;
  batteryLevel?: number;
};

type TrackingMapProps = {
  objects?: TrackingObject[];
  className?: string;
  centerPosition?: { lat: number; lng: number };
  onObjectSelect?: (object: TrackingObject) => void;
};

// Fix for Leaflet icons
// This addresses an issue with Leaflet marker icons in bundled environments
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const TrackingMap: React.FC<TrackingMapProps> = ({
  objects = [],
  className,
  centerPosition = { lat: 40.7128, lng: -74.006 }, // New York as default
  onObjectSelect,
}) => {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Handle object selection
  const handleObjectClick = (object: TrackingObject) => {
    setSelectedObjectId(object.id);
    if (onObjectSelect) {
      onObjectSelect(object);
    }
  };

  return (
    <div className={cn("relative rounded-2xl overflow-hidden h-[600px]", className)}>
      <MapContainer 
        center={[centerPosition.lat, centerPosition.lng]} 
        zoom={13} 
        className="h-full w-full rounded-xl z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        
        {objects.map((object) => (
          <Marker 
            key={object.id}
            position={[object.position.lat, object.position.lng]}
            icon={customIcon}
            eventHandlers={{
              click: () => handleObjectClick(object),
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-medium text-sm">{object.name}</h3>
                <div className="text-xs text-gray-600 mt-1">
                  {object.speed !== undefined && (
                    <div>Speed: {object.speed} mph</div>
                  )}
                  {object.batteryLevel !== undefined && (
                    <div>Battery: {object.batteryLevel}%</div>
                  )}
                  <div className="mt-1 text-gray-500">
                    Last updated: {object.lastUpdated}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Custom overlay for mobile and info */}
      <div className="absolute bottom-4 right-4 glass-card rounded-lg p-1.5 flex flex-col gap-2 z-[1000]">
        <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-all-ease">
          <Navigation className="h-5 w-5 text-primary" />
        </button>
      </div>
    </div>
  );
};

export default TrackingMap;
