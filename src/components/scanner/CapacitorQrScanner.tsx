import React, { useState } from 'react';
import { scanQrCodeWithCapacitor } from '@/utils/capacitorCameraUtils';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, Loader2 } from 'lucide-react';
import { isAndroidDevice, isMobileDevice } from '@/utils/realtimeQrUtils';

interface CapacitorQrScannerProps {
  onQrCodeDetected: (imei: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const CapacitorQrScanner: React.FC<CapacitorQrScannerProps> = ({
  onQrCodeDetected,
  onError,
  className
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Handle QR code scanning
  const handleScan = async () => {
    setIsScanning(true);
    setErrorMessage(null);
    
    try {
      const success = await scanQrCodeWithCapacitor(
        onQrCodeDetected,
        (error) => {
          setErrorMessage(error);
          if (onError) onError(error);
        }
      );
      
      if (!success) {
        setErrorMessage('Failed to scan QR code. Please try again.');
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
      <div className="flex flex-col items-center justify-center h-full bg-muted/20 rounded-lg p-4 text-center">
        <Camera className="h-12 w-12 text-primary/70 mb-4" />
        
        <h3 className="text-lg font-medium mb-2">Scan Sensor QR Code</h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          {isAndroidDevice() 
            ? "Use your device's camera to scan the QR code on the sensor."
            : "Tap the button below to open your camera and scan a QR code."}
        </p>
        
        {errorMessage && (
          <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-4 max-w-xs">
            {errorMessage}
          </div>
        )}
        
        <Button 
          onClick={handleScan} 
          disabled={isScanning}
          className="mb-2"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              {errorMessage ? 'Try Again' : 'Scan QR Code'}
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground mt-2">
          Make sure the QR code is well-lit and centered in the camera view.
        </p>
      </div>
    </div>
  );
};

export default CapacitorQrScanner;