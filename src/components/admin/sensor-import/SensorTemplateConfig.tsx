
import React, { useState } from "react";
import { SensorData, SensorValue } from "@/components/SensorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import SensorValueEditor from "@/components/sensor-editor/SensorValueEditor";
import { Plus } from "lucide-react";
import { getDefaultUnit } from "@/components/sensor-editor/utils";

interface SensorTemplateConfigProps {
  template: Omit<SensorData, "id"> & { companyId?: string };
  onTemplateChange: (template: Omit<SensorData, "id"> & { companyId?: string }) => void;
  companies: { id: string; name: string }[];
}

const SensorTemplateConfig: React.FC<SensorTemplateConfigProps> = ({
  template,
  onTemplateChange,
  companies
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTemplateChange({
      ...template,
      name: e.target.value
    });
  };

  const handleStatusChange = (value: string) => {
    onTemplateChange({
      ...template,
      status: value as "online" | "offline" | "warning"
    });
  };

  const handleCompanyChange = (value: string) => {
    onTemplateChange({
      ...template,
      companyId: value
    });
  };

  const handlePrefixToggle = (checked: boolean) => {
    setUsePrefix(checked);
  };

  const [usePrefix, setUsePrefix] = useState(true);

  const handleValueChange = (index: number, field: keyof SensorValue, value: any) => {
    const newValues = [...template.values];
    newValues[index] = {
      ...newValues[index],
      [field]: field === 'value' ? parseFloat(value) : value
    };
    
    onTemplateChange({
      ...template,
      values: newValues
    });
  };
  
  const handleTypeChange = (index: number, value: string) => {
    const newValues = [...template.values];
    newValues[index] = {
      ...newValues[index],
      type: value as any,
      unit: getDefaultUnit(value as any)
    };
    
    onTemplateChange({
      ...template,
      values: newValues
    });
  };
  
  const addSensorValue = () => {
    onTemplateChange({
      ...template,
      values: [
        ...template.values,
        {
          type: "temperature",
          value: 0,
          unit: "°C"
        }
      ]
    });
  };
  
  const removeSensorValue = (index: number) => {
    onTemplateChange({
      ...template,
      values: template.values.filter((_, i) => i !== index)
    });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h3 className="text-lg font-medium mb-2">Sensor Template Configuration</h3>
        <div className="text-sm text-muted-foreground mb-4">
          Configure the template to use when importing sensors from CSV
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Name Template</Label>
            <Input
              id="template-name"
              placeholder="Sensor {imei}"
              value={template.name}
              onChange={handleNameChange}
            />
            <p className="text-xs text-muted-foreground">
              Use {'{imei}'} as placeholder for the IMEI number
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template-company">Company</Label>
            <Select 
              value={template.companyId} 
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

        <div className="space-y-2">
          <Label htmlFor="template-status">Status</Label>
          <Select 
            value={template.status} 
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
          <Label>Sensor Values</Label>
          {template.values.map((sensorValue, index) => (
            <SensorValueEditor 
              key={index}
              sensorValue={sensorValue}
              index={index}
              onChange={handleValueChange}
              onTypeChange={handleTypeChange}
              onRemove={removeSensorValue}
              canRemove={template.values.length > 1}
            />
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
      </CardContent>
    </Card>
  );
};

export default SensorTemplateConfig;
