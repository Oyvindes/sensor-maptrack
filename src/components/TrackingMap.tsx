
import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
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

// Google Maps container styles
const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px',
};

const TrackingMap: React.FC<TrackingMapProps> = ({
  objects = [],
  className,
  centerPosition = { lat: 40.7128, lng: -74.006 }, // New York as default
  onObjectSelect,
}) => {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  
  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: '' // You'll need to provide your Google Maps API key here
  });
  
  // Find the currently selected object
  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  // Handle object selection
  const handleObjectClick = (object: TrackingObject) => {
    setSelectedObjectId(object.id);
    if (onObjectSelect) {
      onObjectSelect(object);
    }
  };

  // Handle map loading error
  if (loadError) {
    return (
      <div className={cn("relative rounded-2xl overflow-hidden bg-secondary/30 flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <div className="text-destructive mb-2">
            <Map className="h-12 w-12 mx-auto mb-4" />
          </div>
          <p className="text-destructive font-medium">Error loading Google Maps</p>
          <p className="text-muted-foreground text-sm mt-2">Please check your API key and connection</p>
        </div>
      </div>
    );
  }
  
  // Show loading state while the API is loading
  if (!isLoaded) {
    return (
      <div className={cn("relative rounded-2xl overflow-hidden", className)}>
        <div className="map-container bg-secondary/50 flex flex-col items-center justify-center">
          <div className="animate-pulse-soft">
            <Map className="h-12 w-12 text-muted-foreground mb-4" />
          </div>
          <p className="text-muted-foreground">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-2xl overflow-hidden", className)}>
      <div className="relative h-full w-full">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={centerPosition}
          zoom={12}
          options={{
            disableDefaultUI: false,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6c7079" }]
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#e9e9e9" }]
              }
            ]
          }}
        >
          {/* Render markers for each tracking object */}
          {objects.map((object) => (
            <Marker
              key={object.id}
              position={object.position}
              onClick={() => handleObjectClick(object)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: selectedObjectId === object.id ? '#0284c7' : '#0ea5e9',
                fillOpacity: 0.9,
                strokeWeight: 2,
                strokeColor: '#f8fafc',
              }}
              animation={google.maps.Animation.DROP}
            />
          ))}
          
          {/* Show InfoWindow for selected object */}
          {selectedObject && (
            <InfoWindow
              position={selectedObject.position}
              onCloseClick={() => setSelectedObjectId(null)}
            >
              <div className="p-1">
                <h3 className="font-medium text-sm">{selectedObject.name}</h3>
                <div className="text-xs text-gray-600 mt-1">
                  {selectedObject.speed !== undefined && (
                    <div>Speed: {selectedObject.speed} mph</div>
                  )}
                  {selectedObject.batteryLevel !== undefined && (
                    <div>Battery: {selectedObject.batteryLevel}%</div>
                  )}
                  <div className="mt-1 text-gray-500">
                    Last updated: {selectedObject.lastUpdated}
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
        
        {/* Custom Controls overlay */}
        <div className="absolute bottom-4 right-4 glass-card rounded-lg p-1.5 flex flex-col gap-2 z-10">
          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-all-ease">
            <Navigation className="h-5 w-5 text-primary" />
          </button>
          <div className="border-t border-border my-0.5"></div>
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-all-ease"
            onClick={() => {
              const map = document.querySelector('div[aria-roledescription="map"]') as HTMLElement;
              if (map) {
                const event = new WheelEvent('wheel', { deltaY: -100, bubbles: true });
                map.dispatchEvent(event);
              }
            }}
          >
            <span className="text-xl font-medium">+</span>
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-all-ease"
            onClick={() => {
              const map = document.querySelector('div[aria-roledescription="map"]') as HTMLElement;
              if (map) {
                const event = new WheelEvent('wheel', { deltaY: 100, bubbles: true });
                map.dispatchEvent(event);
              }
            }}
          >
            <span className="text-xl font-medium">−</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;
