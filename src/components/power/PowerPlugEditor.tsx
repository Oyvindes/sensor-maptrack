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
import { useTranslation } from 'react-i18next';

interface PowerPlugEditorProps {
  sensor: PowerSensor;
  companies: Company[];
  onSave: (sensor: PowerSensor) => void;
  onCancel: () => void;
}

const PowerPlugEditor: React.FC<PowerPlugEditorProps> = ({
  sensor,
  companies = [],
  onSave,
  onCancel
}) => {
  const { t } = useTranslation();
  const [editedSensor, setEditedSensor] = useState<PowerSensor>(sensor);
  const [isScanning, setIsScanning] = useState<boolean>(false);

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

  const handleScanQRCode = () => {
    setIsScanning(true);
    // This would be replaced with actual QR code scanning functionality
    // For now, we'll just simulate it with a timeout
    setTimeout(() => {
      const mockImei = `POWER${Math.floor(Math.random() * 1000000000)}`;
      setEditedSensor(prev => ({
        ...prev,
        imei: mockImei
      }));
      setIsScanning(false);
      toast.success("QR code scanned successfully");
    }, 1500);
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
      console.error('Error saving power plug:', error);
      toast.error('Failed to save power plug');
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
              ? t('powerPlugs.add')
              : `${t('powerPlugs.edit')} ${sensor.name}`}
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
        <Label htmlFor="name">{t('powerPlugs.name')}</Label>
        <Input
          id="name"
          name="name"
          value={editedSensor.name}
          onChange={handleChange}
          required
          placeholder={t('powerPlugs.namePlaceholder')}
        />
      </div>
      
      <div className="space-y-2 mt-4">
        <Label htmlFor="imei">IMEI</Label>
        <div className="flex gap-2">
          <Input
            id="imei"
            name="imei"
            value={editedSensor.imei}
            onChange={handleChange}
            placeholder="Enter device IMEI"
            required
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleScanQRCode}
            disabled={isScanning}
          >
            {isScanning ? t('powerPlugs.scanning') : t('powerPlugs.scanQR')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('powerPlugs.imeiDescription')}
        </p>
      </div>
      
      <div className="space-y-2 mt-4">
        <Label htmlFor="location">{t('sensorAssignment.location')}</Label>
        <Input
          id="location"
          name="location"
          placeholder={t('sensorAssignment.locationPlaceholder')}
          onChange={(e) => {
            // This would be handled differently in a real implementation
            // For now, we're just updating a non-existent field
            console.log("Location updated:", e.target.value);
          }}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="space-y-2">
          <Label htmlFor="status">{t('common.status')}</Label>
          <Select 
            value={editedSensor.status} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('common.selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">{t('common.online')}</SelectItem>
              <SelectItem value="offline">{t('common.offline')}</SelectItem>
              <SelectItem value="warning">{t('common.warning')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyId">{t('common.company')}</Label>
          <Select 
            value={editedSensor.companyId || ""} 
            onValueChange={handleCompanyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('common.selectCompany')} />
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
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="outline" className="gap-2">
          <Save className="h-4 w-4" />
          {t('powerPlugs.add')}
        </Button>
      </div>
    </form>
  );
};

export default PowerPlugEditor;