import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, X, Power } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Company } from '@/types/users';
import { toast } from 'sonner';
import { PowerSensor } from '@/types/powerSensors';
import { savePowerSensor } from '@/services/sensor/powerSensorService';
import { powerSensorToSensorData, convertSaveResult } from '@/services/sensor/powerSensorAdapter';

interface PowerSensorEditorProps {
  sensor: PowerSensor;
  companies: Company[];
  onSave: (sensor: PowerSensor) => void;
  onCancel: () => void;
}

const PowerSensorEditor: React.FC<PowerSensorEditorProps> = ({
  sensor,
  companies = [],
  onSave,
  onCancel
}) => {
  const [editedSensor, setEditedSensor] = useState<PowerSensor>(sensor);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedSensor((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (value: string) => {
    setEditedSensor((prev) => ({
      ...prev,
      status: value as 'online' | 'offline' | 'warning'
    }));
  };

  const handleCompanyChange = (value: string) => {
    setEditedSensor((prev) => ({
      ...prev,
      companyId: value
    }));
  };

  const handleFolderChange = (value: string) => {
    setEditedSensor((prev) => ({
      ...prev,
      folderId: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update the lastUpdated timestamp when saving
    const updatedSensor = {
      ...editedSensor,
      lastUpdated: new Date().toLocaleString()
    };

    try {
      // Convert to SensorData for the service
      const sensorData = powerSensorToSensorData(updatedSensor);
      
      // Use the specialized power sensor service
      const result = await savePowerSensor(sensorData);
      
      // Convert the result back to our types
      const convertedResult = convertSaveResult(result);
      
      if (convertedResult.success) {
        toast.success(convertedResult.message);
        
        // Dispatch a custom event to notify that a sensor has been updated
        window.dispatchEvent(new Event('sensor-updated'));
        
        onSave(convertedResult.data || updatedSensor);
      } else {
        toast.error(convertedResult.message);
      }
    } catch (error) {
      console.error('Error saving power sensor:', error);
      toast.error('Failed to save power sensor');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card p-6 rounded-lg space-y-4"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Power className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-medium">
            {sensor.id.startsWith('sensor-')
              ? 'Add New Smart Plug'
              : `Edit ${sensor.name}`}
          </h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          type="button"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Smart Plug Name</Label>
        <Input
          id="name"
          name="name"
          value={editedSensor.name}
          onChange={handleChange}
          required
          placeholder="Enter a descriptive name for this smart plug"
        />
      </div>
      
      <div className="space-y-2 mt-4">
        <Label htmlFor="imei">IMEI</Label>
        <Input
          id="imei"
          name="imei"
          value={editedSensor.imei}
          onChange={handleChange}
          placeholder="Enter device IMEI"
          required
        />
        <p className="text-xs text-muted-foreground">
          The IMEI is used for device identification and authentication
        </p>
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
        <Button type="submit" variant="outline" className="gap-2">
          <Save className="h-4 w-4" />
          Save Smart Plug
        </Button>
      </div>
    </form>
  );
};

export default PowerSensorEditor;