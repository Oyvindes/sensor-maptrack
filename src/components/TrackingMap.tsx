
import React, { useEffect, useRef, useState } from 'react';
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

const TrackingMap: React.FC<TrackingMapProps> = ({
  objects = [],
  className,
  centerPosition = { lat: 40.7128, lng: -74.006 }, // New York as default
  onObjectSelect,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // In a real implementation, this would initialize a map library like Mapbox, Google Maps, etc.
  // For now we'll create a styled placeholder
  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle object selection
  const handleObjectClick = (object: TrackingObject) => {
    setSelectedObjectId(object.id);
    if (onObjectSelect) {
      onObjectSelect(object);
    }
  };

  return (
    <div className={cn("relative rounded-2xl overflow-hidden", className)}>
      {isLoading ? (
        <div className="map-container bg-secondary/50 flex flex-col items-center justify-center">
          <div className="animate-pulse-soft">
            <Map className="h-12 w-12 text-muted-foreground mb-4" />
          </div>
          <p className="text-muted-foreground">Loading map data...</p>
        </div>
      ) : (
        <div className="relative">
          <div className="map-container bg-secondary/30 backdrop-blur-xs">
            {/* This would be replaced by an actual map library */}
            <div className="h-full w-full relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-70"></div>
              
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIwMjAyMCIgb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
              
              {/* Map objects visualization */}
              <div className="absolute inset-0 p-4">
                {objects.map((object) => (
                  <div 
                    key={object.id}
                    className={cn(
                      "absolute p-1.5 rounded-full transition-all-ease",
                      selectedObjectId === object.id 
                        ? "bg-primary/20 shadow-lg scale-125" 
                        : "bg-primary/10 hover:bg-primary/15 hover:scale-110",
                      "cursor-pointer"
                    )}
                    style={{
                      left: `${((object.position.lng + 180) / 360) * 100}%`,
                      top: `${((90 - object.position.lat) / 180) * 100}%`,
                      transform: selectedObjectId === object.id 
                        ? 'translate(-50%, -50%) scale(1.25)' 
                        : 'translate(-50%, -50%)',
                    }}
                    onClick={() => handleObjectClick(object)}
                  >
                    <div className={cn(
                      "w-3 h-3 rounded-full bg-primary",
                      selectedObjectId === object.id && "sensor-pulse"
                    )}></div>
                    
                    <div className={cn(
                      "absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 transition-all-ease",
                      (selectedObjectId === object.id || true) && "opacity-100"
                    )}>
                      {object.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Controls overlay */}
          <div className="absolute bottom-4 right-4 glass-card rounded-lg p-1.5 flex flex-col gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-all-ease">
              <Navigation className="h-5 w-5 text-primary" />
            </button>
            <div className="border-t border-border my-0.5"></div>
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-all-ease">
              <span className="text-xl font-medium">+</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-all-ease">
              <span className="text-xl font-medium">−</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingMap;
