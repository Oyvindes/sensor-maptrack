
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import RealtimeQrScanner from './RealtimeQrScanner';
import CapacitorQrScanner from './CapacitorQrScanner';
import CapacitorPhotoScanner from './CapacitorPhotoScanner';
import CapacitorBarcodeScanner from './CapacitorBarcodeScanner';
import FileUploadQrScanner from './FileUploadQrScanner';
import { isAndroidDevice, isMobileDevice } from '@/utils/realtimeQrUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isCapacitorAvailable } from '@/utils/capacitorCameraUtils';

interface ResponsiveQrScannerProps {
  onQrCodeDetected: (imei: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const ResponsiveQrScanner: React.FC<ResponsiveQrScannerProps> = ({
  onQrCodeDetected,
  onError,
  className
}) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>('auto');
  
  // Determine the best default scanning method based on device capabilities
  useEffect(() => {
    if (isCapacitorAvailable()) {
      if (isAndroidDevice()) {
        setActiveTab('barcode');
      } else {
        setActiveTab('capacitor');
      }
    } else if (isMobileDevice()) {
      setActiveTab('realtime');
    } else {
      setActiveTab('upload');
    }
  }, []);
  
  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="auto">Auto Detect</TabsTrigger>
          <TabsTrigger value="realtime">Camera</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="auto" className="mt-0">
          {isCapacitorAvailable() && isAndroidDevice() ? (
            <CapacitorBarcodeScanner 
              onQrCodeDetected={onQrCodeDetected} 
              onError={onError} 
            />
          ) : isCapacitorAvailable() ? (
            <CapacitorQrScanner 
              onQrCodeDetected={onQrCodeDetected} 
              onError={onError} 
            />
          ) : isMobileDevice() ? (
            <RealtimeQrScanner 
              onQrCodeDetected={onQrCodeDetected} 
              onError={onError} 
            />
          ) : (
            <FileUploadQrScanner 
              onQrCodeDetected={onQrCodeDetected} 
              onError={onError} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="realtime" className="mt-0">
          <RealtimeQrScanner 
            onQrCodeDetected={onQrCodeDetected} 
            onError={onError} 
          />
        </TabsContent>
        
        <TabsContent value="capacitor" className="mt-0">
          <CapacitorQrScanner 
            onQrCodeDetected={onQrCodeDetected} 
            onError={onError} 
          />
        </TabsContent>
        
        <TabsContent value="photo" className="mt-0">
          <CapacitorPhotoScanner 
            onQrCodeDetected={onQrCodeDetected} 
            onError={onError} 
          />
        </TabsContent>
        
        <TabsContent value="barcode" className="mt-0">
          <CapacitorBarcodeScanner 
            onQrCodeDetected={onQrCodeDetected} 
            onError={onError} 
          />
        </TabsContent>
        
        <TabsContent value="upload" className="mt-0">
          <FileUploadQrScanner 
            onQrCodeDetected={onQrCodeDetected} 
            onError={onError} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResponsiveQrScanner;
