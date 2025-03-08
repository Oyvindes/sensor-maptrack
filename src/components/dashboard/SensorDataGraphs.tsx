import React, { useState, useEffect } from "react";
import { SensorFolder } from "@/types/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ProjectPdfHistory from "./ProjectPdfHistory";
import PdfDataSelectionDialog from "./PdfDataSelectionDialog";
import { toast } from "sonner";
import { useProjectData } from "@/hooks/useProjectData";

interface SensorDataGraphsProps {
  project: SensorFolder;
  onClose: () => void;
}

interface SensorValue {
  value: number;
  unit: string;
}

interface SensorReading {
  timestamp: string;
  values: {
    temperature: SensorValue;
    humidity: SensorValue;
    battery: SensorValue;
    signal: SensorValue;
  };
}

// Value type configurations
const valueConfigs = {
  temperature: { color: "#ff4444", label: "Temperature" },
  humidity: { color: "#4444ff", label: "Humidity" },
  battery: { color: "#44ff44", label: "Battery" },
  signal: { color: "#ff44ff", label: "Signal" }
};

// Mock data generator for demonstration
const generateMockData = (sensorId: string): SensorReading[] => {
  const data: SensorReading[] = [];
  const now = new Date();
  
  for (let i = 10; i >= 0; i--) {
    data.push({
      timestamp: new Date(now.getTime() - i * 5000).toISOString(),
      values: {
        temperature: { value: 20 + Math.random() * 10, unit: '°C' },
        humidity: { value: 40 + Math.random() * 30, unit: '%' },
        battery: { value: 80 + Math.random() * 20, unit: '%' },
        signal: { value: 60 + Math.random() * 40, unit: '%' }
      }
    });
  }
  
  return data;
};

const SensorDataGraphs: React.FC<SensorDataGraphsProps> = ({ project: initialProject, onClose }) => {
  // Use local state to manage the project with updated PDF history
  const [project, setProject] = useState<SensorFolder>(initialProject);
  const { setProjects } = useProjectData();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Data selection dialog state
  const [isDataSelectionOpen, setIsDataSelectionOpen] = useState(false);

  // Update local project state if parent project changes
  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);

  const handleOpenDataSelection = () => {
    setIsDataSelectionOpen(true);
  };

  const handleDataSelectionClose = () => {
    setIsDataSelectionOpen(false);
  };

  const handleDataSelectionConfirm = async (selectedDataTypes: string[]) => {
    try {
      setIsGeneratingPdf(true);
      setIsDataSelectionOpen(false);
      
      const { downloadProjectReport } = await import('@/services/pdfService');
      
      // Generate PDF with selected data types and get updated project with history
      const updatedProject = await downloadProjectReport(project, selectedDataTypes);
      
      // Update local state
      setProject(updatedProject);
      
      // Update projects list in parent component
      setProjects(prevProjects =>
        prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p)
      );
      
      toast.success('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!project.assignedSensorIds?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No sensors assigned to this project</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{project.name} - Live Sensor Data</h2>
        <div className="flex gap-4">
          <button
            onClick={handleOpenDataSelection}
            disabled={isGeneratingPdf}
            className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm
              hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPdf ? 'Generating...' : 'Generate PDF Report'}
          </button>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {project.assignedSensorIds.map((sensorId) => {
          const data = generateMockData(sensorId);
          const latestData = data[data.length - 1];
          
          return (
            <div key={sensorId} className="space-y-4">
              <h3 className="text-xl font-semibold">Sensor {sensorId}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(valueConfigs).map(([key, config]) => {
                  const currentValue = latestData.values[key as keyof typeof latestData.values];
                  
                  return (
                    <Card key={key}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm">{config.label}</CardTitle>
                          <span className="text-lg font-bold" style={{ color: config.color }}>
                            {currentValue.value.toFixed(1)}{currentValue.unit}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="timestamp"
                                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                              />
                              <YAxis />
                              <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleString()}
                                formatter={(value: any) => [
                                  `${Number(value).toFixed(1)}${currentValue.unit}`,
                                  config.label
                                ]}
                              />
                              <Line
                                type="monotone"
                                dataKey={`values.${key}.value`}
                                stroke={config.color}
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Project PDF Report History */}
      <div className="mt-8">
        <ProjectPdfHistory project={project} className="animate-fade-up [animation-delay:300ms]" />
      </div>
      
      {/* PDF Data Selection Dialog */}
      <PdfDataSelectionDialog
        isOpen={isDataSelectionOpen}
        onClose={handleDataSelectionClose}
        onConfirm={handleDataSelectionConfirm}
        projectName={project.name}
      />
    </div>
  );
};

export default SensorDataGraphs;