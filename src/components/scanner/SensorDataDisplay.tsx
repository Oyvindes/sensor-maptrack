import React from 'react';
import { SensorData } from '@/components/SensorCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Droplets, Battery, Signal, Clock, Gauge } from 'lucide-react';

interface SensorDataDisplayProps {
  sensor: SensorData | null;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

const SensorDataDisplay: React.FC<SensorDataDisplayProps> = ({
  sensor,
  isLoading = false,
  error = null,
  className
}) => {
  // Helper function to get the most recent value
  const getLatestValue = (key: string): number | null => {
    if (!sensor?.values || sensor.values.length === 0) return null;
    
    const latestValue = sensor.values[0];
    return latestValue[key as keyof typeof latestValue] as number | null;
  };
  
  // Get the status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Format battery percentage
  const formatBattery = (value: number | null): string => {
    if (value === null) return 'N/A';
    return `${Math.round(value)}%`;
  };
  
  // Format signal strength
  const formatSignal = (value: number | null): string => {
    if (value === null) return 'N/A';
    
    // Signal is typically in dBm, convert to bars (1-5)
    // Typical values: -50 (excellent) to -120 (poor)
    if (value > -60) return '5/5';
    if (value > -70) return '4/5';
    if (value > -80) return '3/5';
    if (value > -90) return '2/5';
    return '1/5';
  };
  
  // Get the latest values
  const temperature = getLatestValue('temperature');
  const humidity = getLatestValue('humidity');
  const battery = getLatestValue('battery');
  const signal = getLatestValue('signal');
  const adc1 = getLatestValue('adc1');
  
  // Get the last seen timestamp
  const lastSeen = sensor?.values && sensor.values.length > 0
    ? new Date(sensor.values[0].time).toLocaleString()
    : sensor?.lastUpdated || 'Unknown';
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={`w-full ${className || ''}`}>
        <CardHeader className="pb-1 sm:pb-2">
          <CardTitle className="text-base sm:text-lg">Sensor Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 sm:h-32">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-3 sm:h-4 w-20 sm:w-24 bg-muted rounded mb-2"></div>
              <div className="h-6 sm:h-8 w-28 sm:w-32 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className={`w-full ${className || ''}`}>
        <CardHeader className="pb-1 sm:pb-2">
          <CardTitle className="text-base sm:text-lg">Sensor Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 sm:h-32">
            <div className="text-center">
              <p className="text-destructive font-medium text-sm sm:text-base">Error</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // No sensor data
  if (!sensor) {
    return (
      <Card className={`w-full ${className || ''}`}>
        <CardHeader className="pb-1 sm:pb-2">
          <CardTitle className="text-base sm:text-lg">Sensor Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 sm:h-32">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Scan a sensor QR code to view data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Display sensor data
  return (
    <Card className={`w-full ${className || ''}`}>
      <CardHeader className="pb-1 sm:pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base sm:text-lg">{sensor.name}</CardTitle>
          <Badge
            variant="outline"
            className={`${getStatusColor(sensor.status)} text-white text-xs sm:text-sm`}
          >
            {sensor.status}
          </Badge>
        </div>
        {sensor.projectName && (
          <p className="text-xs text-muted-foreground">
            Project: {sensor.projectName}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
          {/* Temperature */}
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full">
              <Thermometer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Temperature</p>
              <p className="text-sm sm:text-base font-medium">
                {temperature !== null ? `${temperature.toFixed(1)}°C` : 'N/A'}
              </p>
            </div>
          </div>
          
          {/* Concrete (Humidity) - Only show if sensor type is not set to wood */}
          {(!sensor.sensorType || sensor.sensorType !== 'wood') && (
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/10 p-1.5 sm:p-2 rounded-full">
                <Droplets className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Concrete</p>
                <p className="text-sm sm:text-base font-medium">
                  {humidity !== null ? `${humidity.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          )}
          
          {/* Battery */}
          <div className="flex items-center gap-2">
            <div className="bg-green-500/10 p-1.5 sm:p-2 rounded-full">
              <Battery className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Battery</p>
              <p className="text-sm sm:text-base font-medium">{formatBattery(battery)}</p>
            </div>
          </div>
          
          {/* Signal */}
          <div className="flex items-center gap-2">
            <div className="bg-purple-500/10 p-1.5 sm:p-2 rounded-full">
              <Signal className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Signal</p>
              <p className="text-sm sm:text-base font-medium">{formatSignal(signal)}</p>
            </div>
          </div>
          
          {/* Wood (ADC1) - Only show if sensor type is not set to concrete */}
          {(!sensor.sensorType || sensor.sensorType !== 'concrete') && (
            <div className="flex items-center gap-2">
              <div className="bg-amber-700/10 p-1.5 sm:p-2 rounded-full">
                <Gauge className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-700" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Wood</p>
                <p className="text-sm sm:text-base font-medium">
                  {adc1 !== null ? `${adc1.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Last Seen */}
        <div className="flex items-center gap-2 mt-3 sm:mt-4">
          <div className="bg-gray-500/10 p-1.5 sm:p-2 rounded-full">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Last Seen</p>
            <p className="text-xs sm:text-sm">{lastSeen}</p>
          </div>
        </div>
        
        {/* IMEI */}
        <div className="mt-3 sm:mt-4 pt-2 border-t border-border">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            IMEI: {sensor.imei || 'Unknown'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorDataDisplay;