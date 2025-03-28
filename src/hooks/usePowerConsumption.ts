import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  PowerConsumptionData, 
  TimeRange, 
  DateRange 
} from '@/types/powerSensors';
import { 
  REFRESH_INTERVALS, 
  TIME_CONSTANTS 
} from '@/config/powerSensorConfig';
import { fetchPowerConsumption } from '@/services/sensor/powerSensorService';

/**
 * Custom hook for managing power consumption data
 * @param deviceId The ID of the power sensor
 * @returns Object containing power consumption data and control functions
 */
export function usePowerConsumption(deviceId: string) {
  const [consumptionData, setConsumptionData] = useState<PowerConsumptionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - TIME_CONSTANTS.ONE_DAY),
    to: new Date()
  });
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // Calculate date range based on time range
  const calculateDateRange = useCallback((range: TimeRange): { startDate: Date, endDate: Date } => {
    const endDate = new Date();
    let startDate: Date;
    
    switch (range) {
      case '1h':
        startDate = new Date(Date.now() - TIME_CONSTANTS.ONE_HOUR);
        break;
      case '24h':
        startDate = new Date(Date.now() - TIME_CONSTANTS.ONE_DAY);
        break;
      case '7d':
        startDate = new Date(Date.now() - TIME_CONSTANTS.SEVEN_DAYS);
        break;
      case '30d':
        startDate = new Date(Date.now() - TIME_CONSTANTS.THIRTY_DAYS);
        break;
      case 'custom':
        startDate = dateRange.from;
        return { startDate, endDate: dateRange.to };
      default:
        startDate = new Date(Date.now() - TIME_CONSTANTS.ONE_DAY);
    }
    
    return { startDate, endDate };
  }, [dateRange]);

  // Load consumption data
  const loadConsumptionData = useCallback(async () => {
    try {
      setLoading(true);
      
      const { startDate, endDate } = calculateDateRange(timeRange);
      const data = await fetchPowerConsumption(deviceId, startDate, endDate);
      setConsumptionData(data);
    } catch (error) {
      console.error('Error loading power consumption data:', error);
      toast.error('Failed to load power consumption data');
    } finally {
      setLoading(false);
    }
  }, [deviceId, timeRange, calculateDateRange]);

  // Handle time range change
  const handleTimeRangeChange = useCallback((newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
  }, []);

  // Handle date range change
  const handleDateRangeChange = useCallback((newDateRange: DateRange) => {
    setDateRange(newDateRange);
  }, []);

  // Calculate statistics
  const calculateStatistics = useCallback(() => {
    const totalEnergy = consumptionData.reduce((sum, item) => sum + item.energy, 0);
    const totalCost = consumptionData.reduce((sum, item) => sum + (item.cost || 0), 0);
    const avgPower = consumptionData.length > 0 ? totalEnergy / consumptionData.length : 0;
    
    return {
      totalEnergy,
      totalCost,
      avgPower,
      kwhEnergy: totalEnergy / 1000, // Convert to kWh
    };
  }, [consumptionData]);

  // Set up auto-refresh based on time range
  useEffect(() => {
    // Clear any existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    
    // Set up new interval based on time range
    let interval: number | null = null;
    
    if (timeRange === '1h') {
      interval = window.setInterval(loadConsumptionData, REFRESH_INTERVALS.POWER_CONSUMPTION_1H);
    } else if (timeRange === '24h') {
      interval = window.setInterval(loadConsumptionData, REFRESH_INTERVALS.POWER_CONSUMPTION_24H);
    }
    
    if (interval) {
      setRefreshInterval(interval);
    }
    
    // Clean up interval on unmount or when timeRange changes
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeRange, loadConsumptionData]);

  // Load data when component mounts or when deviceId, timeRange, or dateRange changes
  useEffect(() => {
    loadConsumptionData();
  }, [deviceId, timeRange, dateRange, loadConsumptionData]);

  return {
    consumptionData,
    loading,
    timeRange,
    dateRange,
    statistics: calculateStatistics(),
    setTimeRange: handleTimeRangeChange,
    setDateRange: handleDateRangeChange,
    refreshData: loadConsumptionData
  };
}