import React, { useState } from "react";
import { SensorData, SensorType, SensorValue } from "./SensorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { Company } from "@/types/users";

interface SensorEditorProps {
  sensor: SensorData & { companyId?: string };
  companies?: Company[];
  onSave: (updatedSensor: SensorData & { companyId?: string }) => void;
  onCancel: () => void;
}

const SensorEditor: React.FC<SensorEditorProps> = ({ sensor, companies = [], onSave, onCancel }) => {
  const [editedSensor, setEditedSensor] = useState<SensorData & { companyId?: string }>({ ...sensor });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedSensor(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleValueChange = (index: number, field: keyof SensorValue, value: any) => {
    setEditedSensor(prev => {
      const newValues = [...prev.values];
      newValues[index] = {
        ...newValues[index],
        [field]: field === 'value' ? parseFloat(value) : value
      };
      return {
        ...prev,
        values: newValues
      };
    });
  };
  
  const handleTypeChange = (index: number, value: string) => {
    setEditedSensor(prev => {
      const newValues = [...prev.values];
      newValues[index] = {
        ...newValues[index],
        type: value as SensorType,
        unit: getDefaultUnit(value as SensorType)
      };
      return {
        ...prev,
        values: newValues
      };
    });
  };
  
  const handleStatusChange = (value: string) => {
    setEditedSensor(prev => ({
      ...prev,
      status: value as "online" | "offline" | "warning"
    }));
  };

  const handleCompanyChange = (value: string) => {
    setEditedSensor(prev => ({
      ...prev,
      companyId: value
    }));
  };
  
  const addSensorValue = () => {
    setEditedSensor(prev => ({
      ...prev,
      values: [
        ...prev.values,
        {
          type: "temperature",
          value: 0,
          unit: "°C"
        }
      ]
    }));
  };
  
  const removeSensorValue = (index: number) => {
    setEditedSensor(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
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
        <Label>Sensor Values</Label>
        {editedSensor.values.map((sensorValue, index) => (
          <div key={index} className="border p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`type-${index}`}>Type</Label>
                <Select 
                  value={sensorValue.type} 
                  onValueChange={(value) => handleTypeChange(index, value)}
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
                <Label htmlFor={`value-${index}`}>Value</Label>
                <Input
                  id={`value-${index}`}
                  type="number"
                  value={sensorValue.value}
                  onChange={(e) => handleValueChange(index, 'value', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`unit-${index}`}>Unit</Label>
                <Input
                  id={`unit-${index}`}
                  value={sensorValue.unit}
                  onChange={(e) => handleValueChange(index, 'unit', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-2">
              <Button 
                type="button" 
                variant="destructive" 
                size="sm"
                onClick={() => removeSensorValue(index)}
                disabled={editedSensor.values.length <= 1}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ))}
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={addSensorValue}
          className="w-full mt-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Another Value
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
          <Label htmlFor="companyId">Company</Label>
          <Select 
            value={editedSensor.companyId || ""} 
            onValueChange={handleCompanyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
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
