import React, { useState } from "react";
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

export interface SensorDataType {
  id: string;
  label: string;
  color: string;
  isSelected: boolean;
}

interface PdfDataSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedDataTypes: string[]) => void;
  projectName: string;
}

const PdfDataSelectionDialog: React.FC<PdfDataSelectionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectName
}) => {
  // Define available data types with default selection
  const defaultDataTypes: SensorDataType[] = [
    { id: "temperature", label: "Temperature", color: "#ff4444", isSelected: true },
    { id: "humidity", label: "Humidity", color: "#4444ff", isSelected: true },
    { id: "battery", label: "Battery", color: "#44ff44", isSelected: true },
    { id: "signal", label: "Signal", color: "#ff44ff", isSelected: true }
  ];

  const [dataTypes, setDataTypes] = useState<SensorDataType[]>(defaultDataTypes);
  
  const handleCheckboxChange = (id: string) => {
    setDataTypes(dataTypes.map(dataType => 
      dataType.id === id ? { ...dataType, isSelected: !dataType.isSelected } : dataType
    ));
  };

  const handleSelectAll = () => {
    setDataTypes(dataTypes.map(dataType => ({ ...dataType, isSelected: true })));
  };

  const handleSelectNone = () => {
    setDataTypes(dataTypes.map(dataType => ({ ...dataType, isSelected: false })));
  };
  
  const handleConfirm = () => {
    const selectedDataTypeIds = dataTypes
      .filter(dataType => dataType.isSelected)
      .map(dataType => dataType.id);
    
    onConfirm(selectedDataTypeIds);
  };

  // Reset selections when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setDataTypes(defaultDataTypes);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Data for PDF Report</DialogTitle>
          <DialogDescription>
            Choose which sensor data to include in the PDF report for {projectName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>Select All</Button>
            <Button variant="outline" size="sm" onClick={handleSelectNone}>Select None</Button>
          </div>
          
          {dataTypes.map((dataType) => (
            <div key={dataType.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`checkbox-${dataType.id}`} 
                checked={dataType.isSelected}
                onCheckedChange={() => handleCheckboxChange(dataType.id)}
              />
              <Label 
                htmlFor={`checkbox-${dataType.id}`}
                className="flex items-center"
              >
                <span 
                  className="inline-block w-3 h-3 mr-2 rounded-full" 
                  style={{ backgroundColor: dataType.color }}
                />
                {dataType.label}
              </Label>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Generate PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PdfDataSelectionDialog;