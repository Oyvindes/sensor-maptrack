
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileSpreadsheet, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { SensorData } from "@/components/SensorCard";

interface CsvImporterProps {
  onImport: (sensors: (SensorData & { companyId?: string; imei: string })[]) => void;
  template: Omit<SensorData, "id"> & { companyId?: string };
}

const CsvImporter: React.FC<CsvImporterProps> = ({ onImport, template }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importedImeis, setImportedImeis] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<"idle" | "ready" | "importing" | "complete">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split(/\r?\n/).filter(line => line.trim());
        
        // Check if file appears to have headers
        let imeis = lines;
        if (lines[0].toLowerCase().includes('imei') || 
            lines[0].includes(',') || 
            lines[0].includes(';')) {
          // Skip header row
          imeis = lines.slice(1);
        }
        
        // Clean up IMEIs (remove quotes, commas, etc.)
        const cleanedImeis = imeis.map(imei => {
          // If line contains commas or semicolons, assume it's a CSV row
          if (imei.includes(',') || imei.includes(';')) {
            const parts = imei.split(/[,;]/);
            return parts[0].replace(/["']/g, '').trim();
          }
          return imei.replace(/["']/g, '').trim();
        }).filter(imei => imei.length > 0);
        
        setImportedImeis(cleanedImeis);
        setImportStatus("ready");
        
        toast.success(`Found ${cleanedImeis.length} IMEIs in file`);
      } catch (error) {
        toast.error('Error processing file');
        console.error(error);
      }
    };
    
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (importedImeis.length === 0) {
      toast.error('No IMEIs found to import');
      return;
    }
    
    setImportStatus("importing");
    
    // Create sensor objects from template and IMEIs
    const newSensors = importedImeis.map((imei, index) => {
      return {
        ...template,
        id: `sensor-${imei.replace(/\D/g, '')}`,
        name: template.name.replace('{imei}', imei),
        imei: imei,
        lastUpdated: new Date().toLocaleString()
      };
    });
    
    // Simulate processing delay
    setTimeout(() => {
      onImport(newSensors);
      setImportStatus("complete");
      toast.success(`Imported ${newSensors.length} sensors successfully`);
    }, 1000);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h3 className="text-lg font-medium mb-2">Import Sensors from CSV</h3>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <UploadCloud className="h-12 w-12 text-muted-foreground/50" />
            <div className="space-y-2">
              <h4 className="text-base font-medium">Drag and drop your CSV file</h4>
              <p className="text-sm text-muted-foreground">
                or <button type="button" onClick={triggerFileInput} className="text-primary hover:underline">browse files</button>
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              CSV file should contain one IMEI number per line
            </div>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".csv,.txt" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>

        {fileName && (
          <div className="flex items-center space-x-2 text-sm bg-muted p-2 rounded">
            <FileSpreadsheet className="h-4 w-4" />
            <span>{fileName}</span>
          </div>
        )}

        {importedImeis.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Detected IMEIs</Label>
              <span className="text-sm text-muted-foreground">{importedImeis.length} records</span>
            </div>
            <div className="max-h-48 overflow-y-auto bg-muted p-2 rounded text-sm">
              {importedImeis.slice(0, 10).map((imei, index) => (
                <div key={index} className="py-1 flex items-center gap-2">
                  <span className="text-xs font-mono">{index + 1}.</span>
                  <span>{imei}</span>
                </div>
              ))}
              {importedImeis.length > 10 && (
                <div className="py-1 text-muted-foreground text-center">
                  ... and {importedImeis.length - 10} more
                </div>
              )}
            </div>

            <Button 
              onClick={handleImport} 
              className="w-full"
              disabled={importStatus === "importing" || importStatus === "complete"}
            >
              {importStatus === "idle" || importStatus === "ready" ? (
                <>Import Sensors</>
              ) : importStatus === "importing" ? (
                <>Importing...</>
              ) : (
                <><Check className="mr-2 h-4 w-4" /> Complete</>
              )}
            </Button>
          </div>
        )}

        {!fileName && importedImeis.length === 0 && (
          <div className="bg-muted/50 p-4 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">CSV Format Instructions</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Each line should contain one IMEI number</li>
                <li>Headers are optional and will be skipped</li>
                <li>If using columns, the first column will be used as IMEI</li>
                <li>Example: "IMEI123456789" or simply "123456789"</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CsvImporter;
