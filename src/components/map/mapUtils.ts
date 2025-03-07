
import { Device, Sensor, TrackingObject } from "@/types/sensors";
import { LatLngBounds, LatLngBoundsExpression } from "leaflet";

// Find map center based on available devices, sensors, or tracking objects
export const getMapCenter = (
  focusLocation: [number, number] | undefined,
  devices: Device[],
  sensors: Sensor[],
  objects: TrackingObject[]
): [number, number] => {
  if (focusLocation) {
    return focusLocation;
  }
  if (devices.length > 0 && devices[0].location) {
    return [devices[0].location.lat, devices[0].location.lng];
  }
  if (sensors.length > 0 && sensors[0].location) {
    return [sensors[0].location.lat, sensors[0].location.lng];
  }
  if (objects.length > 0) {
    return [objects[0].position.lat, objects[0].position.lng];
  }
  // Default to Trondheim center (Torvet)
  return [63.4305, 10.3951];
};

// Calculate bounds that include all markers
export const getBoundsForAllMarkers = (
  devices: Device[],
  sensors: Sensor[],
  objects: TrackingObject[]
): LatLngBoundsExpression | null => {
  const points: [number, number][] = [];
  
  // Add device locations
  devices.forEach(device => {
    if (device.location) {
      points.push([device.location.lat, device.location.lng]);
    }
  });
  
  // Add sensor locations
  sensors.forEach(sensor => {
    if (sensor.location) {
      points.push([sensor.location.lat, sensor.location.lng]);
    }
  });
  
  // Add tracking object positions
  objects.forEach(object => {
    points.push([object.position.lat, object.position.lng]);
  });
  
  // If no points, return null
  if (points.length === 0) {
    return null;
  }
  
  // If only one point, create a small bound around it
  if (points.length === 1) {
    const [lat, lng] = points[0];
    return [
      [lat - 0.01, lng - 0.01],
      [lat + 0.01, lng + 0.01]
    ];
  }
  
  // Find min/max coordinates to create bounds
  const lats = points.map(p => p[0]);
  const lngs = points.map(p => p[1]);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  // Add a small padding (5%)
  const latPadding = (maxLat - minLat) * 0.05;
  const lngPadding = (maxLng - minLng) * 0.05;
  
  return [
    [minLat - latPadding, minLng - lngPadding],
    [maxLat + latPadding, maxLng + lngPadding]
  ];
};

// Add styles for popup interaction
export const addPopupInteractionStyles = (): HTMLStyleElement => {
  const style = document.createElement('style');
  style.innerHTML = `
    .leaflet-popup-content-wrapper { 
      pointer-events: auto !important; 
    }
    .leaflet-popup-content {
      pointer-events: auto !important;
    }
    .leaflet-popup button {
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(style);
  return style;
};
