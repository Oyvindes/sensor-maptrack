
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Sensor, Device, TrackingObject } from "@/types/sensors";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Navigation } from "lucide-react";
import { toast } from "sonner";

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

// Helper component to programmatically change map view
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

interface DirectionsDialogProps {
  location: { lat: number, lng: number };
  locationName: string;
}

const DirectionsDialog: React.FC<DirectionsDialogProps> = ({ location, locationName }) => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSendDirections = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSending(true);
    
    try {
      // Create Google Maps directions URL
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=driving`;
      
      // In a real app, this would send an API request to your backend
      // For this demo, we'll simulate the email being sent
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Directions for ${locationName} sent to ${email}`);
      setOpen(false);
      setEmail("");
    } catch (error) {
      console.error("Error sending directions:", error);
      toast.error("Failed to send directions. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex gap-2">
          <Navigation className="h-4 w-4" />
          <span>Send Directions</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Directions to {locationName}</DialogTitle>
          <DialogDescription>
            Send Google Maps directions to this location via email.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="Enter recipient email"
            />
          </div>
          <div className="col-span-full text-sm text-muted-foreground">
            <p>The email will include a link to Google Maps directions to these coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSendDirections} disabled={isSending}>
            {isSending ? "Sending..." : "Send"}
            <Mail className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface TrackingMapProps {
  devices?: Device[];
  sensors?: Sensor[];
  objects?: TrackingObject[];
  highlightId?: string;
  focusLocation?: [number, number];
  focusZoom?: number;
  onDeviceClick?: (deviceId: string) => void;
  onSensorClick?: (sensorId: string) => void;
  onObjectSelect?: (object: TrackingObject) => void;
  className?: string;
  projectName?: string;
}

const TrackingMap: React.FC<TrackingMapProps> = ({
  devices = [],
  sensors = [],
  objects = [],
  highlightId,
  focusLocation,
  focusZoom = 16,
  onDeviceClick,
  onSensorClick,
  onObjectSelect,
  className = "h-[500px] w-full rounded-md border",
  projectName = "Location",
}) => {
  // Find map center based on first device, sensor, or tracking object, or default to Norway
  const getMapCenter = () => {
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
    // Default to Norway
    return [60.472, 8.468];
  };

  const mapCenter = getMapCenter() as [number, number];
  const locationForDirections = focusLocation 
    ? { lat: focusLocation[0], lng: focusLocation[1] } 
    : { lat: mapCenter[0], lng: mapCenter[1] };

  return (
    <div className={className}>
      <div className="relative">
        <MapContainer
          center={mapCenter}
          zoom={focusLocation ? focusZoom : 6}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Add FlyToLocation component to handle dynamic location changes */}
          {focusLocation && <FlyToLocation position={focusLocation} zoom={focusZoom} />}
          
          {/* Display devices */}
          {devices.map((device) => (
            device.location && (
              <Marker
                key={device.id}
                position={[device.location.lat, device.location.lng] as [number, number]}
                eventHandlers={{
                  click: () => onDeviceClick && onDeviceClick(device.id),
                }}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{device.name}</h3>
                    <p>Type: {device.type}</p>
                    <p>Status: {device.status}</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
          
          {/* Display sensors */}
          {sensors.map((sensor) => (
            sensor.location && (
              <Marker
                key={sensor.id}
                position={[sensor.location.lat, sensor.location.lng] as [number, number]}
                eventHandlers={{
                  click: () => onSensorClick && onSensorClick(sensor.id),
                }}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{sensor.name}</h3>
                    <p>Type: {sensor.type}</p>
                    <p>Status: {sensor.status}</p>
                    <p>Last Reading: {sensor.lastReading?.value} {sensor.unit}</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Display tracking objects */}
          {objects?.map((object) => (
            <Marker
              key={object.id}
              position={[object.position.lat, object.position.lng] as [number, number]}
              eventHandlers={{
                click: () => onObjectSelect && onObjectSelect(object),
              }}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{object.name}</h3>
                  <p>Speed: {object.speed} mph</p>
                  <p>Battery: {object.batteryLevel}%</p>
                  <p>Last Updated: {object.lastUpdated}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Send directions button overlay */}
        <div className="absolute bottom-4 right-4 z-[1000]">
          <DirectionsDialog 
            location={locationForDirections} 
            locationName={projectName}
          />
        </div>
      </div>
    </div>
  );
};

export type { TrackingMapProps };
export default TrackingMap;
