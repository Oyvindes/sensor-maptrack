
import React, { useState } from "react";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SensorTemplateConfig from "./SensorTemplateConfig";
import CsvImporter from "./CsvImporter";
import { SensorData } from "@/components/SensorCard";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Company } from "@/types/users";

interface SensorImporterProps {
  companies: Company[];
  onSensorsImport: (sensors: (SensorData & { folderId?: string; companyId?: string; imei?: string })[]) => void;
  onCancel: () => void;
}

const SensorImporter: React.FC<SensorImporterProps> = ({
  companies,
  onSensorsImport,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState("template");
  
  const [template, setTemplate] = useState<Omit<SensorData, "id"> & { companyId?: string }>({
    name: "Sensor {imei}",
    status: "online",
    lastUpdated: new Date().toLocaleString(),
    values: [
      {
        type: "temperature",
        value: 0,
        unit: "°C"
      }
    ],
    companyId: companies[0]?.id
  });

  const handleImport = (sensors: (SensorData & { companyId?: string; imei: string })[]) => {
    onSensorsImport(sensors);
  };

  return (
    <SectionContainer>
      <div className="flex justify-between items-center mb-4">
        <SectionTitle>Import Sensors from CSV</SectionTitle>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 grid grid-cols-2">
          <TabsTrigger value="template">Configure Template</TabsTrigger>
          <TabsTrigger value="import">Import CSV</TabsTrigger>
        </TabsList>
        
        <TabsContent value="template">
          <SensorTemplateConfig 
            template={template}
            onTemplateChange={setTemplate}
            companies={companies}
          />
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => setActiveTab("import")}>
              Next: Import Sensors
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="import">
          <CsvImporter 
            template={template}
            onImport={handleImport}
          />
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setActiveTab("template")}>
              Back to Template
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </SectionContainer>
  );
};

export default SensorImporter;
