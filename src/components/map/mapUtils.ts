
import { Device, Sensor, TrackingObject } from "@/types/sensors";

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
