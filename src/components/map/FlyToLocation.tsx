
import React, { useEffect } from "react";
import { useMap } from "react-leaflet";

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

export default FlyToLocation;
