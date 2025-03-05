
import React, { useState } from "react";
import { SensorData, SensorType } from "./SensorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { SensorFolder } from "@/types/users";

interface SensorEditorProps {
  sensor: SensorData & { folderId?: string };
  folders?: SensorFolder[];
  onSave: (updatedSensor: SensorData & { folderId?: string }) => void;
  onCancel: () => void;
}

const SensorEditor: React.FC<SensorEditorProps> = ({ sensor, folders = [], onSave, onCancel }) => {
  const [editedSensor, setEditedSensor] = useState<SensorData & { folderId?: string }>({ ...sensor });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedSensor(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedSensor(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  const handleTypeChange = (value: string) => {
    setEditedSensor(prev => ({
      ...prev,
      type: value as SensorType,
      unit: getDefaultUnit(value as SensorType)
    }));
  };
  
  const handleStatusChange = (value: string) => {
    setEditedSensor(prev => ({
      ...prev,
      status: value as "online" | "offline" | "warning"
    }));
  };

  const handleFolderChange = (value: string) => {
    setEditedSensor(prev => ({
      ...prev,
      folderId: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedSensor);
  };
  
  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 rounded-lg space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {sensor.id.startsWith("sensor-") ? "Add New Sensor" : `Edit ${sensor.name}`}
        </h3>
        <Button size="sm" variant="ghost" onClick={onCancel} type="button">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Sensor Name</Label>
          <Input
            id="name"
            name="name"
            value={editedSensor.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Sensor Type</Label>
          <Select 
            value={editedSensor.type} 
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="humidity">Humidity</SelectItem>
              <SelectItem value="battery">Battery</SelectItem>
              <SelectItem value="proximity">Proximity</SelectItem>
              <SelectItem value="signal">Signal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="value">Current Value</Label>
          <Input
            id="value"
            name="value"
            type="number"
            value={editedSensor.value}
            onChange={handleNumberChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            name="unit"
            value={editedSensor.unit}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={editedSensor.status} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="folderId">Folder</Label>
          <Select 
            value={editedSensor.folderId || ""} 
            onValueChange={handleFolderChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {folders.map(folder => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

// Helper function to get default unit based on sensor type
function getDefaultUnit(type: SensorType): string {
  switch (type) {
    case "temperature":
      return "°C";
    case "humidity":
      return "%";
    case "battery":
      return "%";
    case "proximity":
      return "cm";
    case "signal":
      return "dBm";
    default:
      return "";
  }
}

export default SensorEditor;
