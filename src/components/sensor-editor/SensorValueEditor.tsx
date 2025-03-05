
import React from "react";
import { SensorValueEditorProps } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

const SensorValueEditor: React.FC<SensorValueEditorProps> = ({
  sensorValue,
  index,
  onChange,
  onTypeChange,
  onRemove,
  canRemove
}) => {
  return (
    <div className="border p-4 rounded-md mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`type-${index}`}>Type</Label>
          <Select 
            value={sensorValue.type} 
            onValueChange={(value) => onTypeChange(index, value)}
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
            onChange={(e) => onChange(index, 'value', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`unit-${index}`}>Unit</Label>
          <Input
            id={`unit-${index}`}
            value={sensorValue.unit}
            onChange={(e) => onChange(index, 'unit', e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-2">
        <Button 
          type="button" 
          variant="destructive" 
          size="sm"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </Button>
      </div>
    </div>
  );
};

export default SensorValueEditor;
