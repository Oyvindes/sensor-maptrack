import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isMobileDevice, isAndroidDevice } from './realtimeQrUtils';
import { extractImeiFromQrCode } from './qrCodeUtils';

/**
 * Check if Capacitor is available in the current environment
 */
export const isCapacitorAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).Capacitor;
};

/**
 * Take a picture using Capacitor's Camera API
 * @returns Promise with the image data URL or null if failed
 */
export const takePictureWithCapacitor = async (): Promise<string | null> => {
  try {
    // Check if we're on a mobile device and Capacitor is available
    if (!isMobileDevice() || !isCapacitorAvailable()) {
      console.log('Capacitor not available or not on mobile device');
      return null;
    }

    console.log('Taking picture with Capacitor Camera API');
    
    // Use Capacitor's Camera API to take a picture
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      promptLabelHeader: 'Scan QR Code',
      promptLabelCancel: 'Cancel',
      width: 1024,
      height: 1024,
      saveToGallery: false,
    });

    console.log('Picture taken with Capacitor:', image);
    
    return image.dataUrl || null;
  } catch (error) {
    console.error('Error taking picture with Capacitor:', error);
    return null;
  }
};

/**
 * Scan a QR code using Capacitor's Camera API
 * @param onQrCodeDetected Callback function to handle detected QR code
 * @returns Promise with success status
 */
export const scanQrCodeWithCapacitor = async (
  onQrCodeDetected: (imei: string) => void,
  onError?: (error: string) => void
): Promise<boolean> => {
  try {
    // Take a picture using Capacitor
    const imageDataUrl = await takePictureWithCapacitor();
    
    if (!imageDataUrl) {
      if (onError) onError('Failed to take picture with camera');
      return false;
    }
    
    // Process the image to extract QR code
    // We'll need to load the image and use jsQR to detect the QR code
    const img = new Image();
    img.src = imageDataUrl;
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      setTimeout(() => reject(new Error('Image load timeout')), 5000);
    });
    
    // Create a canvas to draw the image
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!context) {
      if (onError) onError('Failed to create canvas context');
      return false;
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
        return true;
      } else {
        if (onError) onError('No valid IMEI found in QR code');
        return false;
      }
    } else {
      if (onError) onError('No QR code detected in image');
      return false;
    }
  } catch (error) {
    console.error('Error scanning QR code with Capacitor:', error);
    if (onError) onError('Error scanning QR code: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
};