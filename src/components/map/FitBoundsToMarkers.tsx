import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import { LatLngBoundsExpression } from "leaflet";

interface FitBoundsToMarkersProps {
  bounds: LatLngBoundsExpression | null;
  padding?: number[]; // Optional padding in pixels [top, right, bottom, left]
}

const FitBoundsToMarkers: React.FC<FitBoundsToMarkersProps> = ({ 
  bounds,
  padding = [50, 50, 50, 50] 
}) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, {
        padding: padding,
        animate: true,
        duration: 1
      });
    }
  }, [map, bounds, padding]);
  
  return null;
};

export default FitBoundsToMarkers;