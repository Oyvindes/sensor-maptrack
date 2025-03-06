
import { useState } from "react";
import { toast } from "sonner";

export interface DirectionsEmailData {
  address: string | undefined;
  location: string | { lat: number; lng: number } | undefined;
}

export const useDirectionsEmail = ({ address, location }: DirectionsEmailData) => {
  const getGoogleMapsUrl = () => {
    let googleMapsUrl = "";
    
    if (location) {
      try {
        let locationData: {lat: number, lng: number};
        if (typeof location === 'string') {
          locationData = JSON.parse(location);
        } else {
          locationData = location as {lat: number, lng: number};
        }
        
        if (locationData.lat && locationData.lng) {
          googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${locationData.lat},${locationData.lng}`;
          return googleMapsUrl;
        }
      } catch (e) {
        console.error("Error parsing location data:", e);
      }
    }
    
    if (address) {
      googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }
    
    return googleMapsUrl;
  };
  
  const openDirectionsInNewTab = () => {
    const url = getGoogleMapsUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success("Directions opened in new tab");
    } else {
      toast.error("Could not generate directions URL");
    }
  };

  return {
    openDirectionsInNewTab
  };
};
