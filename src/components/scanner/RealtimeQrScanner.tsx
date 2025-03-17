import React, { useEffect, useRef, useState } from 'react';
import { 
  initializeCameraStream, 
  processVideoFrame, 
  stopCameraStream, 
  extractAndValidateImei 
} from '@/utils/realtimeQrUtils';
import { Loader2, RefreshCw, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RealtimeQrScannerProps {
  onQrCodeDetected: (imei: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const RealtimeQrScanner: React.FC<RealtimeQrScannerProps> = ({
  onQrCodeDetected,
  onError,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastDetectedCode, setLastDetectedCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Function to initialize the camera
  const initCamera = async () => {
    setIsInitializing(true);
    setErrorMessage(null);
    
    if (videoRef.current) {
      try {
        const success = await initializeCameraStream(videoRef.current);
        
        if (success) {
          setHasPermission(true);
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsInitializing(false);
            setIsScanning(true);
          };
        } else {
          setHasPermission(false);
          setIsInitializing(false);
          const errorMsg = 'Camera access denied. Please check your browser settings and permissions.';
          setErrorMessage(errorMsg);
          if (onError) onError(errorMsg);
        }
      } catch (error) {
        console.error('Error initializing camera:', error);
        setHasPermission(false);
        setIsInitializing(false);
        
        // Set a more specific error message based on the error
        let errorMsg = 'Error accessing camera: ';
        
        if (error instanceof DOMException) {
          if (error.name === 'NotAllowedError') {
            errorMsg = 'Camera permission denied. Please allow camera access in your browser settings.';
          } else if (error.name === 'NotFoundError') {
            errorMsg = 'No camera found on this device.';
          } else if (error.name === 'NotReadableError') {
            errorMsg = 'Camera is already in use by another application.';
          } else if (error.name === 'OverconstrainedError') {
            errorMsg = 'Camera constraints cannot be satisfied. Try using a different browser.';
          } else if (error.name === 'SecurityError') {
            errorMsg = 'Camera access blocked due to security restrictions.';
          } else {
            errorMsg += (error instanceof Error ? error.message : String(error));
          }
        } else {
          errorMsg += (error instanceof Error ? error.message : String(error));
        }
        
        setErrorMessage(errorMsg);
        if (onError) onError(errorMsg);
      }
    }
  };
  
  // Initialize camera when component mounts
  useEffect(() => {
    initCamera();
    
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoRef.current) {
        stopCameraStream(videoRef.current);
      }
      
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onError]);
  
  // Set up scanning loop when camera is ready
  useEffect(() => {
    if (!isScanning || !hasPermission || isInitializing) {
      return;
    }
    
    let lastProcessTime = 0;
    const PROCESS_INTERVAL = 200; // Process frames every 200ms for better performance
    
    const scanQrCode = (timestamp: number) => {
      if (timestamp - lastProcessTime > PROCESS_INTERVAL) {
        lastProcessTime = timestamp;
        
        if (videoRef.current && canvasRef.current) {
          const qrData = processVideoFrame(videoRef.current, canvasRef.current);
          
          if (qrData && qrData !== lastDetectedCode) {
            // Extract IMEI from QR code data
            const imei = extractAndValidateImei(qrData);
            
            if (imei) {
              setLastDetectedCode(qrData);
              onQrCodeDetected(imei);
            }
          }
        }
      }
      
      // Continue scanning
      animationRef.current = requestAnimationFrame(scanQrCode);
    };
    
    // Start the scanning loop
    animationRef.current = requestAnimationFrame(scanQrCode);
    
    // Cleanup function
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isScanning, hasPermission, isInitializing, lastDetectedCode, onQrCodeDetected]);
  
  return (
    <div className={`relative ${className || ''}`}>
      {/* Hidden canvas for processing */}
      <canvas 
        ref={canvasRef} 
        className="hidden"
      />
      
      {/* Video element for camera feed */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
        playsInline
        autoPlay
        muted
      />
      
      {/* Scanning overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Scanning frame */}
        <div className="absolute inset-0 border-2 border-primary/50 rounded-lg" />
        
        {/* Center target */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary rounded-lg" />
        
        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
      </div>
      
      {/* Status indicators */}
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Initializing camera...</p>
          </div>
        </div>
      )}
      
      {!hasPermission && !isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="flex flex-col items-center gap-3 p-4 text-center max-w-xs">
            <Camera className="h-10 w-10 text-destructive opacity-70" />
            <p className="text-sm text-destructive font-medium">Camera access denied</p>
            <p className="text-xs text-muted-foreground">
              {errorMessage || 'Please allow camera access to scan QR codes. You may need to update your browser settings.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={initCamera}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Camera Access
            </Button>
          </div>
        </div>
      )}
      
      {/* Scanning indicator */}
      {isScanning && hasPermission && !isInitializing && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-background/80 text-foreground text-xs px-3 py-1 rounded-full">
            Point camera at sensor QR code
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeQrScanner;