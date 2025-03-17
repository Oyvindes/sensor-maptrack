import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, RefreshCw } from 'lucide-react';
import { scanSensorQrCode, CameraScanResult } from '@/utils/cameraUtils';
import { isAndroidDevice } from '@/utils/realtimeQrUtils';

interface CapacitorPhotoScannerProps {
  onQrCodeDetected: (imei: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const CapacitorPhotoScanner: React.FC<CapacitorPhotoScannerProps> = ({
  onQrCodeDetected,
  onError,
  className
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastScannedImage, setLastScannedImage] = useState<string | null>(null);
  const [originalPath, setOriginalPath] = useState<string>(window.location.pathname + window.location.search);
  
  // Handle navigation events
  useEffect(() => {
    // Save the original path when component mounts
    setOriginalPath(window.location.pathname + window.location.search);
    
    // Handle popstate events (back/forward navigation)
    const handlePopState = (event: PopStateEvent) => {
      // If we've navigated away from our page, try to get back
      if (window.location.pathname !== originalPath.split('?')[0]) {
        console.log('Navigation detected in popstate, returning to sensor health check page');
        window.history.pushState({}, '', originalPath);
      }
    };
    
    // Add event listener
    window.addEventListener('popstate', handlePopState);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [originalPath]);
  
  // Handle QR code scanning
  const handleScan = async () => {
    setIsScanning(true);
    setErrorMessage(null);
    
    try {
      // Create a custom wrapper around scanSensorQrCode to prevent navigation
      const scanWithoutNavigation = async (): Promise<CameraScanResult> => {
        // Use the existing scanSensorQrCode function that works in edit project mode
        const result = await scanSensorQrCode();
        
        // Check if we've been navigated away
        if (window.location.pathname !== originalPath.split('?')[0]) {
          console.log('Navigation detected, returning to sensor health check page');
          
          // Use history API to go back to our page without reloading
          window.history.pushState({}, '', originalPath);
        }
        
        return result;
      };
      
      // Call our wrapped function
      const result = await scanWithoutNavigation();
      
      if (result.success && result.data) {
        // If scanning was successful and we have data
        if (result.image) {
          setLastScannedImage(result.image);
        }
        
        // Add a small delay to ensure the UI updates before any potential navigation
        setTimeout(() => {
          // Pass the IMEI to the parent component
          onQrCodeDetected(result.data);
        }, 500);
      } else {
        // If scanning failed or no data was found
        setErrorMessage(result.error || 'Failed to scan QR code');
        if (onError) onError(result.error || 'Failed to scan QR code');
        
        // Still show the image if we have one
        if (result.image) {
          setLastScannedImage(result.image);
        }
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      const errorMsg = 'Error scanning QR code: ' + (error instanceof Error ? error.message : String(error));
      setErrorMessage(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsScanning(false);
    }
  };
  
  return (
    <div className={`relative ${className || ''}`}>
      <div className="flex flex-col items-center justify-center h-full bg-muted/20 rounded-lg p-2 sm:p-4 text-center">
        {lastScannedImage ? (
          <div className="mb-2 sm:mb-4 relative">
            <img
              src={lastScannedImage}
              alt="Scanned QR Code"
              className="max-h-24 sm:max-h-32 rounded-md border border-border"
            />
          </div>
        ) : (
          <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-primary/70 mb-2 sm:mb-4" />
        )}
        
        <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">QR Code Scanner</h3>
        
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
          {isAndroidDevice()
            ? "Tap the button below to take a picture of the QR code."
            : "Tap the button below to select a QR code image."}
        </p>
        
        {errorMessage && (
          <div className="bg-destructive/10 text-destructive text-xs sm:text-sm p-1.5 sm:p-2 rounded-md mb-2 sm:mb-4 max-w-xs">
            {errorMessage}
          </div>
        )}
        
        <Button
          onClick={handleScan}
          disabled={isScanning}
          className="mb-1 sm:mb-2 h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {errorMessage ? 'Try Again' : 'Scan QR Code'}
            </>
          )}
        </Button>
        
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
          This uses the same camera method that works in the project editor.
        </p>
      </div>
    </div>
  );
};

export default CapacitorPhotoScanner;