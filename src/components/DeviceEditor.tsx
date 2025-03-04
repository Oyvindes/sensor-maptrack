
import React, { useState } from "react";
import { TrackingObject } from "./TrackingMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, X } from "lucide-react";

interface DeviceEditorProps {
  device: TrackingObject;
  onSave: (updatedDevice: TrackingObject) => void;
  onCancel: () => void;
}

const DeviceEditor: React.FC<DeviceEditorProps> = ({ device, onSave, onCancel }) => {
  const [editedDevice, setEditedDevice] = useState<TrackingObject>({ ...device });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedDevice(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedDevice(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedDevice(prev => ({
      ...prev,
      position: {
        ...prev.position,
        [name]: parseFloat(value)
      }
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedDevice);
  };
  
  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 rounded-lg space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {device.id.startsWith("device-") ? "Add New Device" : `Edit ${device.name}`}
        </h3>
        <Button size="sm" variant="ghost" onClick={onCancel} type="button">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Device Name</Label>
          <Input
            id="name"
            name="name"
            value={editedDevice.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            name="lat"
            type="number"
            step="0.0001"
            value={editedDevice.position.lat}
            onChange={handlePositionChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            name="lng"
            type="number"
            step="0.0001"
            value={editedDevice.position.lng}
            onChange={handlePositionChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="speed">Speed (mph)</Label>
          <Input
            id="speed"
            name="speed"
            type="number"
            min="0"
            value={editedDevice.speed}
            onChange={handleNumberChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="direction">Direction (degrees)</Label>
          <Input
            id="direction"
            name="direction"
            type="number"
            min="0"
            max="359"
            value={editedDevice.direction}
            onChange={handleNumberChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="batteryLevel">Battery Level (%)</Label>
          <Input
            id="batteryLevel"
            name="batteryLevel"
            type="number"
            min="0"
            max="100"
            value={editedDevice.batteryLevel}
            onChange={handleNumberChange}
            required
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default DeviceEditor;
