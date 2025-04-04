import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Printer } from "lucide-react";
import { toast } from "sonner";

export interface SensorValue {
  id: string;
  label: string;
  isSelected: boolean;
}

export interface SensorInfo {
  id: string;
  imei: string;
  name: string;
  type: string;
  typeLabel: string;
  color: string;
  location?: string;
  zone?: string;
  isSelected: boolean;
  isExpanded: boolean;
  values: SensorValue[];
}

export type ReportFormat = 'html';

interface ReportDataSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedDataTypes: string[], format: ReportFormat) => void;
  projectName: string;
  project?: {
    assignedSensorImeis?: string[];
    sensorLocations?: Record<string, string>;
    sensorZones?: Record<string, string>;
    sensorTypes?: Record<string, string>;
  };
}

const ReportDataSelectionDialog: React.FC<ReportDataSelectionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  project
}) => {
  // Define value configurations for each sensor type
  const valueConfigs: Record<string, SensorValue[]> = {
    humidity: [
      { id: "humidity_value", label: "Humidity (%)", isSelected: true },
      { id: "humidity_min", label: "Min Value", isSelected: false },
      { id: "humidity_max", label: "Max Value", isSelected: false }
    ],
    adc1: [
      { id: "adc1_value", label: "Moisture (%)", isSelected: true },
      { id: "adc1_min", label: "Min Value", isSelected: false },
      { id: "adc1_max", label: "Max Value", isSelected: false }
    ],
    temperature: [
      { id: "temperature_value", label: "Temperature (°C)", isSelected: true },
      { id: "temperature_min", label: "Min Value", isSelected: false },
      { id: "temperature_max", label: "Max Value", isSelected: false }
    ],
    battery: [
      { id: "battery_value", label: "Battery Level (%)", isSelected: true },
      { id: "battery_voltage", label: "Voltage", isSelected: false }
    ],
    signal: [
      { id: "signal_strength", label: "Signal Strength", isSelected: true },
      { id: "signal_quality", label: "Signal Quality", isSelected: false }
    ],
    power: [
      { id: "power_state", label: "Power State", isSelected: true },
      { id: "power_consumption", label: "Power Consumption", isSelected: true }
    ]
  };
  
  // Type to color and label mapping
  const typeConfig: Record<string, {color: string, label: string}> = {
    humidity: { color: "#4444ff", label: "Concrete" },
    adc1: { color: "#8B4513", label: "Wood" },
    temperature: { color: "#ff4444", label: "Temperature" },
    battery: { color: "#44ff44", label: "Battery" },
    signal: { color: "#ff44ff", label: "Signal" },
    power: { color: "#00cc00", label: "Power" }
  };

  const [sensors, setSensors] = useState<SensorInfo[]>([]);
  const [reportFormat] = useState<ReportFormat>('html');
  
  // Initialize sensors from the project
  useEffect(() => {
    if (!project || !project.assignedSensorImeis || project.assignedSensorImeis.length === 0) {
      setSensors([]);
      return;
    }
    
    const sensorsList: SensorInfo[] = [];
    
    // Add sensors to the list
    project.assignedSensorImeis.forEach(imei => {
      // Get sensor location, zone, and type if available
      const location = project.sensorLocations?.[imei] || '';
      const zone = project.sensorZones?.[imei] || '';
      const type = project.sensorTypes?.[imei] || '';
      
      // Create a display name that includes location and zone
      let displayName = location || `Sensor ${imei}`;
      if (zone) {
        displayName += ` (${zone} zone)`;
      }
      
      // Determine sensor type
      let sensorType = "humidity"; // Default to concrete/humidity
      if (type === "wood") {
        sensorType = "adc1";
      } else if (type === "power") {
        sensorType = "power";
      }
      
      // Get the appropriate values for this sensor type
      const sensorValues = [...(valueConfigs[sensorType] || [])];
      
      sensorsList.push({
        id: imei,
        imei: imei,
        name: displayName,
        type: sensorType,
        typeLabel: typeConfig[sensorType]?.label || "Unknown",
        color: typeConfig[sensorType]?.color || "#999999",
        location: location,
        zone: zone,
        isSelected: true,
        isExpanded: false,
        values: sensorValues
      });
    });
    
    // Sort sensors by type and name
    sensorsList.sort((a, b) => {
      if (a.typeLabel !== b.typeLabel) {
        return a.typeLabel.localeCompare(b.typeLabel);
      }
      return a.name.localeCompare(b.name);
    });
    
    setSensors(sensorsList);
  }, [project]);
  
  const handleSensorCheckboxChange = (sensorId: string) => {
    setSensors(sensors.map(sensor => {
      if (sensor.id === sensorId) {
        // Toggle the sensor selection
        const newIsSelected = !sensor.isSelected;
        return {
          ...sensor,
          isSelected: newIsSelected,
          // If deselecting the sensor, also deselect all its values
          values: newIsSelected
            ? sensor.values
            : sensor.values.map(v => ({ ...v, isSelected: false }))
        };
      }
      return sensor;
    }));
  };

  const handleValueCheckboxChange = (sensorId: string, valueId: string) => {
    setSensors(sensors.map(sensor => {
      if (sensor.id === sensorId) {
        return {
          ...sensor,
          // If any value is selected, the sensor should be selected too
          isSelected: true,
          values: sensor.values.map(value =>
            value.id === valueId ? { ...value, isSelected: !value.isSelected } : value
          )
        };
      }
      return sensor;
    }));
  };
  
  const toggleSensorExpand = (sensorId: string) => {
    setSensors(sensors.map(sensor => 
      sensor.id === sensorId 
        ? { ...sensor, isExpanded: !sensor.isExpanded }
        : sensor
    ));
  };

  const handleSelectAll = () => {
    setSensors(sensors.map(sensor => ({
      ...sensor,
      isSelected: true,
      values: sensor.values.map(v => ({ ...v, isSelected: true }))
    })));
  };

  const handleSelectNone = () => {
    setSensors(sensors.map(sensor => ({
      ...sensor,
      isSelected: false,
      values: sensor.values.map(v => ({ ...v, isSelected: false }))
    })));
  };
  
  const handleConfirm = () => {
    // Create a detailed selection object that includes both sensor and value selections
    
    // First, collect only the selected sensors
    const selectedSensors = sensors.filter(sensor => sensor.isSelected);
    
    // If no sensors are selected, don't generate a report
    if (selectedSensors.length === 0) {
      toast.error("Please select at least one sensor to include in the report");
      return;
    }
    
    // Create a detailed selection object
    const detailedSelections = {
      // List of selected sensor IMEIs
      selectedSensorImeis: selectedSensors.map(s => s.imei),
      
      // Map of sensor IMEIs to their selected values
      sensorValueSelections: {} as Record<string, string[]>
    };
    
    // Standard data types to pass to the report generator
    const standardDataTypes = ['humidity', 'adc1', 'temperature', 'battery', 'signal'];
    
    // For each selected sensor, record which values are selected
    selectedSensors.forEach(sensor => {
      // Get selected values for this sensor
      const selectedValueIds = sensor.values
        .filter(v => v.isSelected)
        .map(v => v.id);
      
      // Store in the detailed selections
      detailedSelections.sensorValueSelections[sensor.imei] = selectedValueIds;
    });
    
    // Store the detailed selections in sessionStorage
    sessionStorage.setItem('reportDetailedSelections', JSON.stringify(detailedSelections));
    
    // Pass the standard data types to the report generator
    // The actual filtering will happen in the SensorDataGraphs component
    onConfirm(standardDataTypes, reportFormat);
  };

  // Group sensors by type for display
  const sensorsByType: Record<string, SensorInfo[]> = {};
  sensors.forEach(sensor => {
    if (!sensorsByType[sensor.typeLabel]) {
      sensorsByType[sensor.typeLabel] = [];
    }
    sensorsByType[sensor.typeLabel].push(sensor);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sm:max-w-md z-[9999] bg-background text-foreground border-border max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Choose which sensor data to include in the report for {projectName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 overflow-y-auto pr-2 max-h-[60vh]">
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
            <Printer className="h-4 w-4" />
            <div>
              <h4 className="font-medium">HTML Report</h4>
              <p className="text-sm text-muted-foreground">
                HTML report will open in a new tab and automatically trigger the print dialog.
                This provides better graph quality and layout.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>Select All</Button>
            <Button variant="outline" size="sm" onClick={handleSelectNone}>Select None</Button>
          </div>
          
          {/* List sensors grouped by type */}
          {Object.entries(sensorsByType).map(([typeLabel, typeSensors]) => (
            <div key={typeLabel} className="space-y-2 border border-border rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: typeSensors[0]?.color || "#999999" }}
                  />
                  <span className="text-foreground font-medium">{typeLabel} ({typeSensors.length})</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {typeSensors.map((sensor) => (
                  <div key={sensor.id} className="border border-border/50 rounded-md overflow-hidden">
                    <div 
                      className="flex items-center p-2 hover:bg-muted/30 cursor-pointer"
                      onClick={() => toggleSensorExpand(sensor.id)}
                    >
                      <Checkbox
                        id={`sensor-${sensor.id}`}
                        checked={sensor.isSelected}
                        onCheckedChange={() => {
                          handleSensorCheckboxChange(sensor.id);
                        }}
                        className="mr-2 border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`sensor-${sensor.id}`}
                          className="font-medium cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {sensor.name}
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          IMEI: {sensor.imei}
                        </div>
                      </div>
                      <div className={`transform transition-transform ${sensor.isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </div>
                    </div>
                    
                    {sensor.isExpanded && (
                      <div className="p-2 pl-8 border-t border-border/50 bg-muted/10 space-y-2">
                        <div className="text-xs text-muted-foreground mb-1">Select values to include:</div>
                        {sensor.values.map((value) => (
                          <div key={value.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`value-${sensor.id}-${value.id}`}
                              checked={value.isSelected}
                              onCheckedChange={() => handleValueCheckboxChange(sensor.id, value.id)}
                              className="h-3.5 w-3.5 border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label
                              htmlFor={`value-${sensor.id}-${value.id}`}
                              className="text-sm"
                            >
                              {value.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter className="mt-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="default" onClick={handleConfirm}>
            Generate HTML Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDataSelectionDialog;