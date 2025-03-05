
import L from "leaflet";

// Fix Leaflet icon issue by providing absolute URL paths to the icon assets
// This is a common issue with Leaflet in React applications
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Set the default icon for all markers
L.Marker.prototype.options.icon = defaultIcon;

export default defaultIcon;
