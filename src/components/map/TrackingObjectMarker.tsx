
import React from "react";
import { Marker, Popup } from "react-leaflet";
import { TrackingObject } from "@/types/sensors";

interface TrackingObjectMarkerProps {
  object: TrackingObject;
  onObjectSelect?: (object: TrackingObject) => void;
  renderCustomPopup?: (object: TrackingObject) => React.ReactNode;
}

const TrackingObjectMarker: React.FC<TrackingObjectMarkerProps> = ({ 
  object, 
  onObjectSelect, 
  renderCustomPopup 
}) => {
  return (
    <Marker
      key={object.id}
      position={[object.position.lat, object.position.lng] as [number, number]}
      eventHandlers={{
        click: () => onObjectSelect && onObjectSelect(object),
      }}
    >
      <Popup>
        {renderCustomPopup ? renderCustomPopup(object) : (
          <div>
            <h3 className="font-bold">{object.name}</h3>
            <p>Speed: {object.speed} mph</p>
            <p>Battery: {object.batteryLevel}%</p>
            <p>Last Updated: {object.lastUpdated}</p>
          </div>
        )}
      </Popup>
    </Marker>
  );
};

export default TrackingObjectMarker;
