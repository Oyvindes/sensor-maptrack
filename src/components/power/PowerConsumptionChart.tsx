import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { usePowerConsumption } from '@/hooks/usePowerConsumption';
import { TimeRange, DateRange } from '@/types/powerSensors';

interface PowerConsumptionChartProps {
  deviceId: string;
  deviceName: string;
}

const PowerConsumptionChart: React.FC<PowerConsumptionChartProps> = ({
  deviceId,
  deviceName
}) => {
  const {
    consumptionData,
    loading,
    timeRange,
    dateRange,
    statistics,
    setTimeRange,
    setDateRange,
    refreshData
  } = usePowerConsumption(deviceId);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-lg font-medium">{deviceName} Power Consumption</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select 
              value={timeRange} 
              onValueChange={(value) => setTimeRange(value as TimeRange)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            
            {timeRange === 'custom' && (
              <DateRangePicker
                value={dateRange}
                onChange={(value) => setDateRange(value as DateRange)}
              />
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : consumptionData.length === 0 ? (
          <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
            No power consumption data available for the selected time range
          </div>
        ) : (
          <>
            <div className="w-full h-[300px] mb-4 flex items-center justify-center">
              <p className="text-muted-foreground">
                Power consumption chart visualization would appear here
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{statistics.avgPower.toFixed(1)} W</div>
                    <div className="text-sm text-muted-foreground">Average Power</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{statistics.kwhEnergy.toFixed(2)} kWh</div>
                    <div className="text-sm text-muted-foreground">Total Energy</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">${statistics.totalCost.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Estimated Cost</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PowerConsumptionChart;