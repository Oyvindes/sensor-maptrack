import React, { useState, useEffect } from 'react';
import { SensorFolder } from '@/types/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
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
import ProjectReportHistory from './ProjectReportHistory';
import ReportDataSelectionDialog, { ReportFormat } from './ReportDataSelectionDialog';
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
    adc1: SensorValueDisplay;
  };
}

interface SensorDataPoint {
  time: string;
  temperature: number;
  humidity: number;
  battery: number;
  signal: number;
  adc1: number;
}

interface SensorInfo {
  imei: string;
  name: string;
  values: SensorDataPoint[] | string[]; // Can be either parsed objects or raw strings
}

// Value type configurations
const valueConfigs = {
  humidity: { color: '#4444ff', label: 'Concrete' },
  adc1: { color: '#8B4513', label: 'Wood' },
  temperature: { color: '#ff4444', label: 'Temperature' },
  battery: { color: '#44ff44', label: 'Battery' },
  signal: { color: '#ff44ff', label: 'Signal' }
};

const generateData = (
  allValues: Record<string, SensorInfo>,
  imei: string,
  project: SensorFolder
): SensorReading[] => {
  const data: SensorReading[] = [];

  if (
    !allValues[imei] ||
    !Array.isArray(allValues[imei].values) ||
    allValues[imei].values.length === 0
  ) {
    return data;
  }

  // Get project start date if available
  const projectStartDate = project.projectStartDate
    ? new Date(project.projectStartDate)
    : null;
  
  // Get project end date if available
  const projectEndDate = project.projectEndDate
    ? new Date(project.projectEndDate)
    : null;

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
      const dataPointDate = new Date(dataPoint.time);
      
      // Skip data points before project start date
      if (projectStartDate && dataPointDate < projectStartDate) {
        return;
      }
      
      // Skip data points after project end date (if specified)
      if (projectEndDate && dataPointDate > projectEndDate) {
        return;
      }

      data.push({
        timestamp: dataPointDate.toISOString(),
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
          },
          adc1: {
            value: dataPoint.adc1 || 0,
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
  const { t } = useTranslation();
  const [project, setProject] = useState<SensorFolder>(initialProject);
  const { setProjects } = useProjectData();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [sensorInfoMap, setSensorInfoMap] = useState<Record<string, SensorInfo>>({});
  const [isDataSelectionOpen, setIsDataSelectionOpen] = useState(false);
  
  // Define valueConfigs inside the component to use translations
  const valueConfigs = {
    humidity: { color: '#4444ff', label: t('sensorData.concrete') },
    adc1: { color: '#8B4513', label: 'Wood' },
    temperature: { color: '#ff4444', label: t('sensorData.temperature') },
    battery: { color: '#44ff44', label: t('tracking.battery') },
    signal: { color: '#ff44ff', label: 'Signal' }
  };

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

  const handleDataSelectionConfirm = async (selectedDataTypes: string[], format: ReportFormat) => {
    try {
      setIsGeneratingReport(true);
      setIsDataSelectionOpen(false);

      let updatedProject;
      
      if (format === 'pdf') {
        // Generate PDF report
        const { downloadProjectReport } = await import('@/services/pdfService');
        updatedProject = await downloadProjectReport(project, selectedDataTypes);
        toast.success('PDF report generated successfully');
      } else {
        // Generate HTML report
        const { generateHtmlReport } = await import('@/services/htmlReportService');
        updatedProject = await generateHtmlReport(project, selectedDataTypes, true);
        toast.success('HTML report opened in new tab');
      }
      
      // Update the project state with the new report
      if (updatedProject) {
        setProject(updatedProject);
        setProjects((prevProjects) =>
          prevProjects.map((p) =>
            p.id === updatedProject.id ? updatedProject : p
          )
        );
      }
    } catch (error) {
      console.error(`Error generating ${format} report:`, error);
      toast.error(`Failed to generate ${format} report`);
    } finally {
      setIsGeneratingReport(false);
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
          {project.name} - {t('sensorData.liveSensorData')}
        </h2>
        <div className="flex gap-4">
          <button
            onClick={handleOpenDataSelection}
            disabled={isGeneratingReport}
            className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm
                      hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex flex-col items-center gap-1">
              <span className="text-[10px]">{isGeneratingReport ? t('sensorData.generating') : t('sensorData.report')}</span>
            </span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm
                      hover:bg-secondary/90 transition-colors"
          >
            <span className="flex flex-col items-center gap-1">
              <span className="text-[10px]">{t('sensorData.close')}</span>
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {project.assignedSensorImeis.map((sensorImei) => {
          const data = generateData(sensorInfoMap, sensorImei, project).reverse();
          const latestData = data.length > 0 ? data[data.length - 1] : null;
          const sensorName = sensorInfoMap[sensorImei]?.name || `Sensor ${sensorImei}`;

          if (!latestData) {
            return (
              <div key={sensorImei} className="space-y-4">
                <h3 className="text-xl font-semibold">{sensorName}</h3>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('sensorData.noData')}</CardTitle>
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

          // Get sensor location, zone, and type if available
          const sensorLocation = project.sensorLocations?.[sensorImei] || '';
          const sensorZone = project.sensorZones?.[sensorImei] || '';
          const sensorType = project.sensorTypes?.[sensorImei] || '';
          
          // Create a display name that includes location, zone, and type if available
          let displayName = sensorName;
          if (sensorLocation) {
            displayName += ` (${sensorLocation}`;
            if (sensorZone) {
              displayName += `, ${sensorZone} zone`;
            }
            if (sensorType) {
              displayName += `, ${sensorType}`;
            }
            displayName += ')';
          } else if (sensorZone) {
            displayName += ` (${sensorZone} zone`;
            if (sensorType) {
              displayName += `, ${sensorType}`;
            }
            displayName += ')';
          } else if (sensorType) {
            displayName += ` (${sensorType})`;
          }
          
          return (
            <div key={sensorImei} className="space-y-4">
              <h3 className="text-xl font-semibold">{displayName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {Object.entries(valueConfigs).map(([key, config]) => {
                  const currentValue = latestData.values[key as keyof typeof latestData.values];
                  
                  // Skip humidity or adc1 based on sensor type setting
                  const sensorType = project.sensorTypes?.[sensorImei];
                  if ((key === 'humidity' && sensorType === 'wood') ||
                      (key === 'adc1' && sensorType === 'concrete')) {
                    return null;
                  }

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
        <ProjectReportHistory
          project={project}
          className="animate-fade-up [animation-delay:300ms]"
        />
      </div>

      <ReportDataSelectionDialog
        isOpen={isDataSelectionOpen}
        onClose={handleDataSelectionClose}
        onConfirm={handleDataSelectionConfirm}
        projectName={project.name}
      />
    </div>
  );
};

export default SensorDataGraphs;
