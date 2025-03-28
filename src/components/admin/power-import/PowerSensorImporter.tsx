import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Company } from '@/types/users';
import { bulkImportPowerSensors } from '@/services/sensor/powerSensorService';
import { Power, Upload, X, AlertCircle, Check } from 'lucide-react';

interface PowerSensorImporterProps {
  companies: Company[];
  onSensorsImport: (result: { success: boolean; message: string; imported: number; failed: number }) => void;
  onCancel: () => void;
}

interface PowerSensorImportData {
  name: string;
  imei: string;
  companyId: string;
  folderId?: string;
}

const PowerSensorImporter: React.FC<PowerSensorImporterProps> = ({
  companies,
  onSensorsImport,
  onCancel
}) => {
  const [csvData, setCsvData] = useState<string>('');
  const [parsedData, setParsedData] = useState<PowerSensorImportData[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV data
  const parseCSV = () => {
    try {
      setErrors([]);
      const newErrors: string[] = [];
      
      // Split by lines and filter out empty lines
      const lines = csvData.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        setErrors(['No data found in the CSV content']);
        setParsedData([]);
        return;
      }
      
      // Check if first line is a header
      const firstLine = lines[0].toLowerCase();
      const hasHeader = firstLine.includes('name') && firstLine.includes('imei');
      
      // Start from index 1 if there's a header, otherwise from 0
      const startIndex = hasHeader ? 1 : 0;
      
      const parsedSensors: PowerSensorImportData[] = [];
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Split by comma or semicolon
        const parts = line.includes(',') ? line.split(',') : line.split(';');
        
        if (parts.length < 2) {
          newErrors.push(`Line ${i + 1}: Invalid format, expected at least name and IMEI`);
          continue;
        }
        
        const name = parts[0].trim();
        const imei = parts[1].trim();
        
        // Validate name
        if (!name) {
          newErrors.push(`Line ${i + 1}: Name is required`);
          continue;
        }
        
        // Validate IMEI
        if (!imei) {
          newErrors.push(`Line ${i + 1}: IMEI is required`);
          continue;
        }
        
        // Add to parsed data
        parsedSensors.push({
          name,
          imei,
          companyId: selectedCompanyId
        });
      }
      
      if (newErrors.length > 0) {
        setErrors(newErrors);
      }
      
      setParsedData(parsedSensors);
      
      if (parsedSensors.length === 0 && newErrors.length === 0) {
        setErrors(['No valid sensor data found in the CSV content']);
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setErrors(['Failed to parse CSV data']);
      setParsedData([]);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
    };
    reader.readAsText(file);
  };

  // Handle import
  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error('No valid data to import');
      return;
    }
    
    if (!selectedCompanyId) {
      toast.error('Please select a company');
      return;
    }
    
    try {
      setImporting(true);
      
      // Update company ID for all sensors
      const sensorsToImport = parsedData.map(sensor => ({
        ...sensor,
        companyId: selectedCompanyId
      }));
      
      // Import sensors
      const result = await bulkImportPowerSensors(sensorsToImport);
      
      if (result.success) {
        toast.success(result.message);
        onSensorsImport(result);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error importing sensors:', error);
      toast.error('Failed to import sensors');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Power className="h-5 w-5 text-green-500" />
            <CardTitle>Import Smart Plugs</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Company Selection */}
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
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
            <p className="text-xs text-muted-foreground">
              All imported smart plugs will be assigned to this company
            </p>
          </div>
          
          {/* CSV Input */}
          <div className="space-y-2">
            <Label>CSV Data</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Paste CSV data here (name,imei)"
                  className="h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: name,imei (one per line)
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload CSV File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".csv,.txt"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  </div>
                </div>
                
                <Button onClick={parseCSV} disabled={!csvData.trim()}>
                  Parse CSV Data
                </Button>
                
                {errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Errors</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 text-sm">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
          
          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <Label>Preview ({parsedData.length} smart plugs)</Label>
              <div className="border rounded-md overflow-auto max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>IMEI</TableHead>
                      <TableHead>Company</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((sensor, index) => (
                      <TableRow key={index}>
                        <TableCell>{sensor.name}</TableCell>
                        <TableCell>{sensor.imei}</TableCell>
                        <TableCell>
                          {companies.find(c => c.id === selectedCompanyId)?.name || 'Not selected'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={parsedData.length === 0 || !selectedCompanyId || importing}
              className="bg-green-500 hover:bg-green-600"
            >
              {importing ? (
                <>Importing...</>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Import {parsedData.length} Smart Plugs
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerSensorImporter;