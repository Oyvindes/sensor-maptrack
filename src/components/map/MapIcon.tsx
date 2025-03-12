
import L from "leaflet";

// Use local marker icon images to prevent Vite URL normalization issues
// These files are stored in the public directory
const defaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Set the default icon for all markers
L.Marker.prototype.options.icon = defaultIcon;

// Function to create a custom icon based on type and status
export const createMapIcon = (type: string, status: string) => {
  // Create different icons based on type and status
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

export default defaultIcon;
