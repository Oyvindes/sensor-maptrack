import React, { useState, useEffect } from 'react';
import './scanner.css';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, RefreshCw, StopCircle } from 'lucide-react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { extractImeiFromQrCode } from '@/utils/qrCodeUtils';
import { isAndroidDevice } from '@/utils/realtimeQrUtils';

interface CapacitorBarcodeScannerProps {
  onQrCodeDetected: (imei: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const CapacitorBarcodeScanner: React.FC<CapacitorBarcodeScannerProps> = ({
  onQrCodeDetected,
  onError,
  className
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  // Check if the device is supported
  const isSupported = isAndroidDevice() || typeof (window as any).Capacitor !== 'undefined';
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScan();
      }
    };
  }, [isScanning]);
  
  // Function to prepare the UI for scanning
  const prepareUI = () => {
    // Add scanning class to body
    document.body.classList.add('scanning');
    
    // Make the scanner container visible and full-screen
    const scannerContainer = document.querySelector('.scanner-container');
    if (scannerContainer instanceof HTMLElement) {
      scannerContainer.classList.add('scanner-fullscreen');
    }
    
    // Hide any elements that might be in the way
    const elementsToHide = document.querySelectorAll('.hide-on-scan');
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
      }
    });
  };
  
  // Function to restore the UI after scanning
  const restoreUI = () => {
    // Remove scanning class from body
    document.body.classList.remove('scanning');
    
    // Restore the scanner container
    const scannerContainer = document.querySelector('.scanner-container');
    if (scannerContainer instanceof HTMLElement) {
      scannerContainer.classList.remove('scanner-fullscreen');
    }
    
    // Show the hidden elements
    const elementsToShow = document.querySelectorAll('.hide-on-scan');
    elementsToShow.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = '';
      }
    });
  };
  
  // Function to check camera permissions
  const checkPermissions = async (): Promise<boolean> => {
    try {
      // Check if camera permission is granted
      const status = await BarcodeScanner.checkPermission({ force: false });
      
      if (status.granted) {
        setHasPermission(true);
        return true;
      }
      
      if (status.denied || status.neverAsked) {
        // Request permission
        const requestStatus = await BarcodeScanner.checkPermission({ force: true });
        setHasPermission(requestStatus.granted);
        return requestStatus.granted;
      }
      
      setHasPermission(false);
      return false;
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      setErrorMessage('Error checking camera permissions: ' + (error instanceof Error ? error.message : String(error)));
      setHasPermission(false);
      if (onError) onError('Error checking camera permissions');
      return false;
    }
  };
  
  // Function to start scanning
  const startScan = async () => {
    setErrorMessage(null);
    
    if (!isSupported) {
      setErrorMessage('Barcode scanner is not supported on this device');
      if (onError) onError('Barcode scanner is not supported on this device');
      return;
    }
    
    try {
      // Prepare the UI for scanning
      prepareUI();
      
      // Start the scanner
      setIsScanning(true);
      
      // Try to directly start scanning without checking permissions first
      try {
        // Make the background of the entire page transparent
        document.body.style.background = 'transparent';
        
        // Start scanning
        await BarcodeScanner.hideBackground();
        
        const result = await BarcodeScanner.startScan({ targetedFormats: ['QR_CODE'] });
        
        // Restore the UI
        restoreUI();
        setIsScanning(false);
        
        if (result.hasContent) {
          const qrData = result.content;
          console.log('QR code detected:', qrData);
          
          // Extract IMEI from QR code data
          const imei = extractImeiFromQrCode(qrData);
          
          if (imei) {
            onQrCodeDetected(imei);
          } else {
            setErrorMessage('No valid IMEI found in QR code');
            if (onError) onError('No valid IMEI found in QR code');
          }
        }
      } catch (scanError) {
        // If direct scanning fails, try checking permissions
        console.warn('Direct scanning failed, checking permissions:', scanError);
        
        const hasPermission = await checkPermissions();
        
        if (!hasPermission) {
          // Restore the UI
          restoreUI();
          setIsScanning(false);
          
          setErrorMessage('Camera permission is required to scan QR codes');
          if (onError) onError('Camera permission is required to scan QR codes');
          return;
        }
        
        // Try scanning again after permission check
        try {
          // Make the background of the entire page transparent
          document.body.style.background = 'transparent';
          
          // Start scanning
          await BarcodeScanner.hideBackground();
          
          const result = await BarcodeScanner.startScan({ targetedFormats: ['QR_CODE'] });
          
          // Restore the UI
          restoreUI();
          setIsScanning(false);
          
          if (result.hasContent) {
            const qrData = result.content;
            console.log('QR code detected:', qrData);
            
            // Extract IMEI from QR code data
            const imei = extractImeiFromQrCode(qrData);
            
            if (imei) {
              onQrCodeDetected(imei);
            } else {
              setErrorMessage('No valid IMEI found in QR code');
              if (onError) onError('No valid IMEI found in QR code');
            }
          }
        } catch (retryError) {
          // Restore the UI
          restoreUI();
          setIsScanning(false);
          
          console.error('Error scanning QR code on retry:', retryError);
          setErrorMessage('Error scanning QR code: ' + (retryError instanceof Error ? retryError.message : String(retryError)));
          if (onError) onError('Error scanning QR code');
        }
      }
    } catch (error) {
      // Restore the UI
      restoreUI();
      setIsScanning(false);
      
      console.error('Error scanning QR code:', error);
      setErrorMessage('Error scanning QR code: ' + (error instanceof Error ? error.message : String(error)));
      if (onError) onError('Error scanning QR code');
    }
  };
  
  // Function to stop scanning
  const stopScan = async () => {
    try {
      // Stop the scanner
      await BarcodeScanner.stopScan();
      
      // Restore the UI
      restoreUI();
      setIsScanning(false);
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }
  };
  
  // Function to handle retry
  const handleRetry = () => {
    setErrorMessage(null);
    startScan();
  };
  
  return (
    <div className={`relative scanner-container ${className || ''}`}>
      <div className="flex flex-col items-center justify-center h-full bg-muted/20 rounded-lg p-4 text-center">
        <Camera className="h-12 w-12 text-primary/70 mb-4" />
        
        <h3 className="text-lg font-medium mb-2">Real-time QR Scanner</h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          {isSupported 
            ? "Scan QR codes in real-time using your device's camera."
            : "This scanner is only available on mobile devices."}
        </p>
        
        {errorMessage && (
          <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-4 max-w-xs">
            {errorMessage}
          </div>
        )}
        
        {isScanning ? (
          <Button 
            onClick={stopScan} 
            variant="destructive"
            className="mb-2"
          >
            <StopCircle className="h-4 w-4 mr-2" />
            Stop Scanning
          </Button>
        ) : errorMessage ? (
          <Button 
            onClick={handleRetry} 
            className="mb-2"
            disabled={!isSupported}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        ) : (
          <Button 
            onClick={startScan} 
            className="mb-2"
            disabled={!isSupported}
          >
            <Camera className="h-4 w-4 mr-2" />
            Start Scanning
          </Button>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          {isSupported 
            ? "Position the QR code within the camera view for scanning."
            : "Please use a mobile device to access this feature."}
        </p>
      </div>
    </div>
  );
};

export default CapacitorBarcodeScanner;