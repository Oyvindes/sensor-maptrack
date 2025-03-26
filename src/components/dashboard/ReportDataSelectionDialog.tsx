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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Printer } from "lucide-react";

export interface SensorDataType {
  id: string;
  label: string;
  color: string;
  isSelected: boolean;
}

export type ReportFormat = 'pdf' | 'html';

interface ReportDataSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedDataTypes: string[], format: ReportFormat) => void;
  projectName: string;
}

const ReportDataSelectionDialog: React.FC<ReportDataSelectionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectName
}) => {
  // Define available data types with default selection
  const defaultDataTypes: SensorDataType[] = [
    { id: "humidity", label: "Concrete", color: "#4444ff", isSelected: true },
    { id: "adc1", label: "Wood", color: "#8B4513", isSelected: true },
    { id: "temperature", label: "Temperature", color: "#ff4444", isSelected: true },
    { id: "battery", label: "Battery", color: "#44ff44", isSelected: true },
    { id: "signal", label: "Signal", color: "#ff44ff", isSelected: true }
  ];

  const [dataTypes, setDataTypes] = useState<SensorDataType[]>(defaultDataTypes);
  const [reportFormat, setReportFormat] = useState<ReportFormat>('html');
  
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
    
    onConfirm(selectedDataTypeIds, reportFormat);
  };

  // Reset selections when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setDataTypes(defaultDataTypes);
      setReportFormat('html'); // Default to HTML format
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sm:max-w-md z-[9999] bg-background text-foreground border-border">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Choose which sensor data to include in the report for {projectName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Tabs defaultValue="html" onValueChange={(value) => setReportFormat(value as ReportFormat)}>
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger
                value="html"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold"
              >
                <Printer className="h-4 w-4" />
                <span>HTML (Print)</span>
              </TabsTrigger>
              <TabsTrigger
                value="pdf"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold"
              >
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="html" className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                HTML report will open in a new tab and automatically trigger the print dialog.
                This provides better graph quality and layout.
              </p>
            </TabsContent>
            <TabsContent value="pdf" className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                PDF report will be generated and saved to the project history.
              </p>
            </TabsContent>
          </Tabs>

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
                className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor={`checkbox-${dataType.id}`}
                className="flex items-center text-foreground"
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
          <Button variant="default" onClick={handleConfirm}>
            Generate {reportFormat === 'html' ? 'HTML' : 'PDF'} Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDataSelectionDialog;