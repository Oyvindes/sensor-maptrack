
import React from "react";
import { Marker, Popup } from "react-leaflet";
import { Device } from "@/types/sensors";

interface DeviceMarkerProps {
  device: Device;
  onDeviceClick?: (deviceId: string) => void;
  renderCustomPopup?: (device: Device) => React.ReactNode;
}

const DeviceMarker: React.FC<DeviceMarkerProps> = ({ 
  device, 
  onDeviceClick, 
  renderCustomPopup 
}) => {
  if (!device.location) return null;
  
  return (
    <Marker
      key={device.id}
      position={[device.location.lat, device.location.lng] as [number, number]}
      eventHandlers={{
        mouseover: (e) => {
          e.target.openPopup();
        },
        mouseout: (e) => {
          e.target.closePopup();
        },
        click: (e) => {
          if (!(e.originalEvent.target as Element).closest?.('.leaflet-popup-content-wrapper')) {
            onDeviceClick && onDeviceClick(device.id);
          }
        },
      }}
    >
      <Popup>
        {renderCustomPopup ? renderCustomPopup(device) : (
          <div>
            <h3 className="font-bold">{device.name}</h3>
            <p>Type: {device.type}</p>
            <p>Status: {device.status}</p>
            {device.imei && <p>IMEI: {device.imei}</p>}
            {device.lastUpdated && <p>Last update: {device.lastUpdated}</p>}
          </div>
        )}
      </Popup>
    </Marker>
  );
};

export default DeviceMarker;
