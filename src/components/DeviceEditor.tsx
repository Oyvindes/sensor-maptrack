
import React, { useState } from "react";
import { Device, TrackingObject } from "@/types/sensors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { Company } from "@/types/users";

interface DeviceEditorProps {
  device: Device;
  companies?: Company[];
  onSave: (updatedDevice: Device) => void;
  onCancel: () => void;
}

const DeviceEditor: React.FC<DeviceEditorProps> = ({ device, companies = [], onSave, onCancel }) => {
  const [editedDevice, setEditedDevice] = useState<Device>({ ...device });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedDevice(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedDevice(prev => ({
      ...prev,
      location: {
        ...prev.location || { lat: 0, lng: 0 },
        [name]: parseFloat(value)
      }
    }));
  };

  const handleCompanyChange = (value: string) => {
    setEditedDevice(prev => ({
      ...prev,
      companyId: value
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
          <Label htmlFor="type">Device Type</Label>
          <Input
            id="type"
            name="type"
            value={editedDevice.type}
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
            value={editedDevice.location?.lat || 0}
            onChange={handleLocationChange}
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
            value={editedDevice.location?.lng || 0}
            onChange={handleLocationChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Input
            id="status"
            name="status"
            value={editedDevice.status}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyId">Company</Label>
          <Select 
            value={editedDevice.companyId} 
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

export default DeviceEditor;
