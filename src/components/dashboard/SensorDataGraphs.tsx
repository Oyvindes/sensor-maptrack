import React, { useState, useEffect } from 'react';
import { SensorFolder } from '@/types/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts';
import ProjectPdfHistory from './ProjectPdfHistory';
import PdfDataSelectionDialog from './PdfDataSelectionDialog';
import { toast } from 'sonner';
import { useProjectData } from '@/hooks/useProjectData';
import { fetchSensors } from '@/services/sensor/supabaseSensorService';

interface SensorDataGraphsProps {
  project: SensorFolder;
  onClose: () => void;
}

interface SensorValueDisplay {
  value: number;
  unit: string;
}

interface SensorReading {
  timestamp: string;
  values: {
    temperature: SensorValueDisplay;
    humidity: SensorValueDisplay;
    battery: SensorValueDisplay;
    signal: SensorValueDisplay;
  };
}

interface SensorDataPoint {
  time: string;
  temperature: number;
  humidity: number;
  battery: number;
  signal: number;
}

interface SensorInfo {
  imei: string;
  name: string;
  values: SensorDataPoint[] | string[]; // Can be either parsed objects or raw strings
}

// Value type configurations
const valueConfigs = {
  temperature: { color: '#ff4444', label: 'Temperature' },
  humidity: { color: '#4444ff', label: 'Humidity' },
  battery: { color: '#44ff44', label: 'Battery' },
  signal: { color: '#ff44ff', label: 'Signal' }
};

const generateData = (
  allValues: Record<string, SensorInfo>,
  imei: string
): SensorReading[] => {
  const data: SensorReading[] = [];

  if (
    !allValues[imei] ||
    !Array.isArray(allValues[imei].values) ||
    allValues[imei].values.length === 0
  ) {
    return data;
  }

  allValues[imei].values.forEach((v) => {
    let dataPoint: SensorDataPoint;

    if (typeof v === 'string') {
      try {
        dataPoint = JSON.parse(v) as SensorDataPoint;
      } catch (e) {
        console.error(`Failed to parse sensor data: ${v}`, e);
        return;
      }
    } else {
      dataPoint = v as SensorDataPoint;
    }

    if (dataPoint && dataPoint.time) {
      data.push({
        timestamp: new Date(dataPoint.time).toISOString(),
        values: {
          temperature: {
            value: dataPoint.temperature || 0,
            unit: '°C'
          },
          humidity: {
            value: dataPoint.humidity || 0,
            unit: '%'
          },
          battery: {
            value: ((dataPoint.battery - 2.5) / 1.1) * 100 || 0,
            unit: '%'
          },
          signal: {
            value: dataPoint.signal * 3.33 || 0,
            unit: '%'
          }
        }
      });
    }
  });

  return data;
};

const SensorDataGraphs: React.FC<SensorDataGraphsProps> = ({
  project: initialProject,
  onClose
}) => {
  const [project, setProject] = useState<SensorFolder>(initialProject);
  const { setProjects } = useProjectData();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [sensorInfoMap, setSensorInfoMap] = useState<Record<string, SensorInfo>>({});
  const [isDataSelectionOpen, setIsDataSelectionOpen] = useState(false);

  useEffect(() => {
    const fetchSensorInfo = async () => {
      try {
        const allSensors = await fetchSensors();
        const sensorMap: Record<string, SensorInfo> = {};

        allSensors.forEach((sensor) => {
          sensorMap[sensor.imei] = {
            imei: sensor.imei,
            name: sensor.name,
            values: sensor.values
          };
        });

        setSensorInfoMap(sensorMap);
      } catch (error) {
        console.error('Error fetching sensor info:', error);
      }
    };

    fetchSensorInfo();
  }, []);

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
      const updatedProject = await downloadProjectReport(project, selectedDataTypes);

      setProject(updatedProject);
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        )
      );

      toast.success('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!project.assignedSensorImeis?.length) {
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
        <h2 className="text-2xl font-bold">
          {project.name} - Live Sensor Data
        </h2>
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
        {project.assignedSensorImeis.map((sensorImei) => {
          const data = generateData(sensorInfoMap, sensorImei).reverse();
          const latestData = data.length > 0 ? data[data.length - 1] : null;
          const sensorName = sensorInfoMap[sensorImei]?.name || `Sensor ${sensorImei}`;

          if (!latestData) {
            return (
              <div key={sensorImei} className="space-y-4">
                <h3 className="text-xl font-semibold">{sensorName}</h3>
                <Card>
                  <CardHeader>
                    <CardTitle>No data available</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      This sensor has no data points yet or is still loading.
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          }

          return (
            <div key={sensorImei} className="space-y-4">
              <h3 className="text-xl font-semibold">{sensorName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {Object.entries(valueConfigs).map(([key, config]) => {
                  const currentValue = latestData.values[key as keyof typeof latestData.values];

                  return (
                    <Card key={key}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm">{config.label}</CardTitle>
                          <span className="text-lg font-bold" style={{ color: config.color }}>
                            {currentValue.value.toFixed(1)}
                            {currentValue.unit}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              {data.map((entry, index) => {
                                const date = new Date(entry.timestamp);
                                const prevDate = index > 0 ? new Date(data[index - 1].timestamp) : null;
                                
                                if (prevDate && date.getDate() !== prevDate.getDate()) {
                                  const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'numeric' });
                                  return (
                                    <ReferenceLine
                                      key={entry.timestamp}
                                      x={entry.timestamp}
                                      stroke="#ff0000"
                                      label={{
                                        value: dateStr,
                                        position: 'insideTopLeft',
                                        fill: '#ffffff',
                                        fontSize: 13,
                                        dy: 20
                                      }}
                                    />
                                  );
                                }
                                return null;
                              })}
                              <XAxis
                                dataKey="timestamp"
                                height={30}
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                }}
                                interval="preserveStartEnd"
                                minTickGap={60}
                                padding={{ left: 20, right: 20 }}
                                fontSize={12}
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

      <div className="mt-8">
        <ProjectPdfHistory
          project={project}
          className="animate-fade-up [animation-delay:300ms]"
        />
      </div>

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
