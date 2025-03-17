import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SensorData } from '@/components/SensorCard';
import { fetchSensorByImei } from '@/services/sensor/supabaseSensorService';
import CapacitorPhotoScanner from '@/components/scanner/CapacitorPhotoScanner';
import SensorDataDisplay from '@/components/scanner/SensorDataDisplay';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { isAndroidDevice, isMobileDevice } from '@/utils/realtimeQrUtils';

// Cache for sensor data to avoid redundant API calls
interface SensorCache {
  [imei: string]: {
    data: SensorData;
    timestamp: number;
  };
}

const CACHE_DURATION = 30000; // 30 seconds

const SensorHealthCheck: React.FC = () => {
  const navigate = useNavigate();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sensorCache, setSensorCache] = useState<SensorCache>({});
  const [lastScannedImei, setLastScannedImei] = useState<string | null>(null);
  // Removed test tools
  // Only use the photo scanner that works
  const [scannerType] = useState<'photo'>('photo');

  // Function to fetch sensor data by IMEI
  const fetchSensorData = useCallback(async (imei: string) => {
    // Check if we have cached data that's still valid
    const cachedData = sensorCache[imei];
    const now = Date.now();
    
    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      console.log('Using cached sensor data for IMEI:', imei);
      setSensorData(cachedData.data);
      setIsLoading(false);
      setError(null);
      return;
    }
    
    // No valid cache, fetch from API
    setIsLoading(true);
    setError(null);
    
    try {
      const sensor = await fetchSensorByImei(imei);
      
      if (sensor) {
        // Update state and cache
        setSensorData(sensor);
        setSensorCache(prev => ({
          ...prev,
          [imei]: {
            data: sensor,
            timestamp: now
          }
        }));
      } else {
        setError(`No sensor found with IMEI: ${imei}`);
        setSensorData(null);
      }
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError('Failed to fetch sensor data. Please try again.');
      setSensorData(null);
    } finally {
      setIsLoading(false);
    }
  }, [sensorCache]);

  // Handle QR code detection
  const handleQrCodeDetected = useCallback((imei: string) => {
    if (imei !== lastScannedImei) {
      setLastScannedImei(imei);
      toast.info(`Scanning sensor: ${imei}`);
      fetchSensorData(imei);
    }
  }, [fetchSensorData, lastScannedImei]);

  // Handle scanner errors
  const handleScannerError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    toast.error(errorMessage);
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    if (lastScannedImei) {
      fetchSensorData(lastScannedImei);
      toast.info('Refreshing sensor data...');
    }
  }, [fetchSensorData, lastScannedImei]);

  // Clear cache periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSensorCache(prev => {
        const newCache = { ...prev };
        
        // Remove expired entries
        Object.keys(newCache).forEach(imei => {
          if (now - newCache[imei].timestamp > CACHE_DURATION) {
            delete newCache[imei];
          }
        });
        
        return newCache;
      });
    }, CACHE_DURATION);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto py-2 px-2 sm:py-4 sm:px-4 w-full max-w-lg">
      <div className="flex items-center justify-between mb-2 sm:mb-4 hide-on-scan">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <h1 className="text-lg sm:text-xl font-semibold">Sensor Health Check</h1>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={!lastScannedImei || isLoading}
            aria-label="Refresh data"
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {/* QR Scanner */}
        <div className="aspect-video overflow-hidden rounded-lg border border-border">
          <CapacitorPhotoScanner
            onQrCodeDetected={handleQrCodeDetected}
            onError={handleScannerError}
            className="w-full h-full"
          />
        </div>
        
        {/* Sensor Data Display */}
        <div className="hide-on-scan">
          <SensorDataDisplay
            sensor={sensorData}
            isLoading={isLoading}
            error={error}
            className="w-full"
          />
        </div>
        
        {/* Instructions */}
        <div className="text-center text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 hide-on-scan">
          <p>Point your camera at a sensor QR code to view its health data.</p>
          <p>Data will update automatically as you scan different sensors.</p>
          
          <div className="mt-2 text-xs border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50 p-2 rounded-md">
            <strong>QR Code Scanner Instructions:</strong>
            <ul className="list-disc list-inside mt-1 text-left text-[11px] sm:text-xs">
              <li>Tap "Scan QR Code" to take a picture of the sensor QR code</li>
              <li>This uses the same camera method that works in the project editor</li>
              <li>The app will stay on this page after scanning</li>
              <li>If camera access fails, check: Settings &gt; Apps &gt; Browser &gt; Permissions</li>
            </ul>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default SensorHealthCheck;