import React, { useState, useEffect } from 'react';
import { SensorFolder } from '@/types/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { woodSensorToPercentage } from '@/utils/sensorUtils';

// Declare the custom property on the Window interface
declare global {
  interface Window {
    __REPORT_DETAILED_SELECTIONS__?: any;
  }
}
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
import { fetchPowerSensors } from '@/services/sensor/powerSensorService';
import { usePowerConsumption } from '@/hooks/usePowerConsumption';
import { usePowerSensor } from '@/hooks/usePowerSensor';
import { Power } from 'lucide-react';

interface SensorDataGraphsProps {
  project: SensorFolder;
  onClose: () => void;
}

interface SensorValueDisplay {
  value: number;
  unit: string;
  rawValue?: number; // Add optional rawValue property to store original sensor reading
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
            unit: '%',
            rawValue: dataPoint.adc1 || 0 // Store the raw value for conversion
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
  const [powerSensorMap, setPowerSensorMap] = useState<Record<string, any>>({});
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
        // Fetch regular sensors
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
        
        // Fetch power sensors
        const allPowerSensors = await fetchPowerSensors();
        const powerMap: Record<string, any> = {};
        
        allPowerSensors.forEach((sensor) => {
          powerMap[sensor.imei] = {
            id: sensor.id,
            imei: sensor.imei,
            name: sensor.name,
            status: sensor.status,
            isPowerSensor: true
          };
        });
        
        setPowerSensorMap(powerMap);
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
      
      // Get detailed selections from sessionStorage
      const selectionsJson = sessionStorage.getItem('reportDetailedSelections');
      const selections = selectionsJson ? JSON.parse(selectionsJson) : null;
      
      if (!selections) {
        toast.error('Error: Selection data not found');
        setIsGeneratingReport(false);
        return;
      }
      
      // Create a custom project object with only the selected sensors and their data
      const customProject = { ...project };
      
      // Create a modified HTML report generator that embeds selection information
      const customReportGenerator = async () => {
        // Import the original HTML report generator
        const { generateHtmlReport } = await import('@/services/htmlReportService');
        
        // Create a custom version that embeds selection data in the HTML
        const originalWindowOpen = window.open;
        
        // Override window.open to inject our selection data
        window.open = function(...args) {
          const newWindow = originalWindowOpen.apply(this, args);
          
          if (newWindow) {
            // Add a script to the new window that defines the selections
            const selectionScript = `
              window.REPORT_SELECTIONS = ${JSON.stringify(selections)};
              console.log("Selection data loaded:", window.REPORT_SELECTIONS);
            `;
            
            // Inject the script directly into the document write stream
            const originalWrite = newWindow.document.write;
            newWindow.document.write = function(html) {
              // Insert our script right after the opening <head> tag
              const modifiedHtml = html.replace('<head>', '<head><script>' + selectionScript + '</script>');
              return originalWrite.call(this, modifiedHtml);
            };
          }
          
          return newWindow;
        };
        
        try {
          // Extract selected value types from selections
          const selectedValueTypes: Record<string, string[]> = {};
          
          // For each selected sensor, add only the selected value types
          if (selections.sensorValueSelections) {
            Object.entries(selections.sensorValueSelections).forEach(([sensorImei, valueIds]) => {
              if (selections.selectedSensorImeis.includes(sensorImei)) {
                selectedValueTypes[sensorImei] = valueIds as string[];
              }
            });
          }
          
          // Call the original generator with our custom project and selected value types
          return await generateHtmlReport(customProject, selectedDataTypes, true, selectedValueTypes);
        } finally {
          // Restore the original window.open
          window.open = originalWindowOpen;
        }
      };
      
      // Generate the report using our custom generator
      updatedProject = await customReportGenerator();
      toast.success('HTML report opened in new tab');
      sessionStorage.removeItem('reportDetailedSelections');
      
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
      console.error('Error generating HTML report:', error);
      toast.error('Failed to generate HTML report');
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
          // Check if this is a power sensor
          const isPowerSensor = powerSensorMap[sensorImei] !== undefined;
          
          if (isPowerSensor) {
            // Render power sensor with consumption data and toggle button
            const powerSensor = powerSensorMap[sensorImei];
            return (
              <PowerSensorDisplay
                key={sensorImei}
                sensorImei={sensorImei}
                sensorName={powerSensor.name}
                sensorId={powerSensor.id}
                location={project.sensorLocations?.[sensorImei] || ''}
              />
            );
          }
          
          // Regular sensor handling
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
                            {key === 'adc1'
                              ? woodSensorToPercentage(currentValue.rawValue)
                              : `${currentValue.value.toFixed(1)}${currentValue.unit}`}
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
                                formatter={(value: any, name) => {
                                  // Check if this is the adc1 (wood) data
                                  if (name === 'values.adc1.value') {
                                    // Use our conversion function for wood sensor values
                                    return [woodSensorToPercentage(value), config.label];
                                  }
                                  // For other sensor types, use the original formatting
                                  return [`${Number(value).toFixed(1)}${currentValue.unit}`, config.label];
                                }}
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
        project={project}
      />
    </div>
  );
};

// Power Sensor Display Component
interface PowerSensorDisplayProps {
  sensorImei: string;
  sensorName: string;
  sensorId: string;
  location: string;
}

const PowerSensorDisplay: React.FC<PowerSensorDisplayProps> = ({
  sensorImei,
  sensorName,
  sensorId,
  location
}) => {
  const { t } = useTranslation();
  const { consumptionData, statistics, timeRange, setTimeRange } = usePowerConsumption(sensorId);
  const { deviceStatus, togglePower, toggling } = usePowerSensor(sensorId, sensorName);
  
  // Format the display name with location if available
  const displayName = location ? `${sensorName} (${location})` : sensorName;
  
  // Format consumption data for the chart
  const chartData = consumptionData.map(item => ({
    time: new Date(item.timestamp).toISOString(),
    energy: item.energy,
    cost: item.cost || 0
  }));
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Power className="h-5 w-5 text-green-500" />
          {displayName}
        </h3>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs ${deviceStatus?.power_state ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {deviceStatus?.power_state ? t('common.on') : t('common.off')}
          </div>
          <button
            onClick={() => togglePower()}
            disabled={toggling}
            className={`px-3 py-1 rounded-md text-sm text-white ${deviceStatus?.power_state ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} ${toggling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {toggling ? t('common.toggling') : deviceStatus?.power_state ? t('common.turnOff') : t('common.turnOn')}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">{t('powerPlugs.energy')}</CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeRange('24h')}
                  className={`px-2 py-1 text-xs rounded ${timeRange === '24h' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  24h
                </button>
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-2 py-1 text-xs rounded ${timeRange === '7d' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  7d
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="time"
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
                        `${Number(value).toFixed(1)} Wh`,
                        t('powerPlugs.energy')
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="#4444ff"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">{t('powerPlugs.noConsumptionData')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('powerPlugs.statistics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="text-xs text-muted-foreground">{t('powerPlugs.totalEnergy')}</div>
                  <div className="text-lg font-semibold">{statistics.kwhEnergy.toFixed(2)} kWh</div>
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="text-xs text-muted-foreground">{t('powerPlugs.totalCost')}</div>
                  <div className="text-lg font-semibold">${statistics.totalCost.toFixed(2)}</div>
                </div>
              </div>
              <div className="bg-muted/30 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">{t('powerPlugs.lastToggled')}</div>
                <div className="text-sm">
                  {deviceStatus?.last_toggled_at
                    ? new Date(deviceStatus.last_toggled_at).toLocaleString()
                    : t('common.never')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SensorDataGraphs;
