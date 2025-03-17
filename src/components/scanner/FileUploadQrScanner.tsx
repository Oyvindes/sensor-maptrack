import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, RefreshCw } from 'lucide-react';
import { extractImeiFromQrCode } from '@/utils/qrCodeUtils';

interface FileUploadQrScannerProps {
  onQrCodeDetected: (imei: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const FileUploadQrScanner: React.FC<FileUploadQrScannerProps> = ({
  onQrCodeDetected,
  onError,
  className
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      // Read the file as a data URL
      const dataUrl = await readFileAsDataURL(file);
      
      // Process the image to extract QR code
      await processQRCodeImage(dataUrl);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      const errorMsg = 'Error processing QR code: ' + (error instanceof Error ? error.message : String(error));
      setErrorMessage(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const processQRCodeImage = async (imageDataUrl: string): Promise<void> => {
    try {
      // Create an image element to load the data URL
      const img = new Image();
      img.src = imageDataUrl;
      
      // Wait for the image to load
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        setTimeout(() => reject(new Error('Image load timeout')), 5000);
      });
      
      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!context) {
        throw new Error('Failed to create canvas context');
      }
      
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image on the canvas
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get the image data from the canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Import jsQR dynamically
      const jsQR = (await import('jsqr')).default;
      
      // Process the image data with jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });
      
      if (code) {
        console.log('QR code detected:', code.data);
        
        // Extract IMEI from QR code data
        const imei = extractImeiFromQrCode(code.data);
        
        if (imei) {
          onQrCodeDetected(imei);
        } else {
          throw new Error('No valid IMEI found in QR code');
        }
      } else {
        throw new Error('No QR code detected in image');
      }
    } catch (error) {
      console.error('Error processing QR code image:', error);
      throw error;
    }
  };
  
  const handleRetry = () => {
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className={`relative ${className || ''}`}>
      <div className="flex flex-col items-center justify-center h-full bg-muted/20 rounded-lg p-4 text-center">
        <Upload className="h-12 w-12 text-primary/70 mb-4" />
        
        <h3 className="text-lg font-medium mb-2">Upload QR Code Image</h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          Select an image file containing a QR code from your device.
        </p>
        
        {errorMessage && (
          <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-4 max-w-xs">
            {errorMessage}
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {isProcessing ? (
          <Button disabled className="mb-2">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </Button>
        ) : errorMessage ? (
          <Button onClick={handleRetry} className="mb-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        ) : (
          <Button onClick={() => fileInputRef.current?.click()} className="mb-2">
            <Upload className="h-4 w-4 mr-2" />
            Select Image
          </Button>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          The image should contain a clear, well-lit QR code.
        </p>
      </div>
    </div>
  );
};

export default FileUploadQrScanner;