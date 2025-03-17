import jsQR from 'jsqr';
import { extractImeiFromQrCode } from './qrCodeUtils';

// Cache to store recently detected QR codes to prevent flickering and redundant processing
interface QrCodeCache {
  code: string;
  timestamp: number;
}

let lastDetectedQrCode: QrCodeCache | null = null;
const QR_CODE_CACHE_DURATION = 2000; // 2 seconds

/**
 * Process a video frame to detect QR codes
 * @param videoElement The video element to capture frames from
 * @param canvasElement The canvas element to use for processing
 * @returns The detected QR code data or null if none found
 */
export const processVideoFrame = (
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement
): string | null => {
  if (!videoElement || !canvasElement || videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
    return null;
  }

  const context = canvasElement.getContext('2d', { willReadFrequently: true });
  if (!context) {
    console.error('Could not get canvas context');
    return null;
  }

  // Set canvas dimensions to match video
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  // Draw the current video frame to the canvas
  context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  // Get the image data from the canvas
  const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);

  // Process the image data with jsQR
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert', // For better performance, don't try inverted images
  });

  // If a QR code is found, return its data
  if (code) {
    // Check if this is the same code we recently detected
    const now = Date.now();
    if (lastDetectedQrCode && lastDetectedQrCode.code === code.data && 
        now - lastDetectedQrCode.timestamp < QR_CODE_CACHE_DURATION) {
      // Return null to avoid redundant processing
      return null;
    }

    // Update the cache
    lastDetectedQrCode = {
      code: code.data,
      timestamp: now
    };

    return code.data;
  }

  return null;
};

/**
 * Extract IMEI from QR code data and validate it
 * @param qrData The raw QR code data
 * @returns The extracted and validated IMEI or null if invalid
 */
export const extractAndValidateImei = (qrData: string): string | null => {
  const imei = extractImeiFromQrCode(qrData);
  if (!imei) {
    return null;
  }

  // Additional validation could be added here if needed
  return imei;
};

/**
 * Check if the device is running Android
 * @returns boolean indicating if the device is Android
 */
export const isAndroidDevice = (): boolean => {
  return /android/i.test(navigator.userAgent);
};

/**
 * Check if the device is running iOS
 * @returns boolean indicating if the device is iOS
 */
export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

/**
 * Check if the device is a mobile device
 * @returns boolean indicating if the device is mobile
 */
export const isMobileDevice = (): boolean => {
  return isAndroidDevice() || isIOSDevice() || /Mobi|Android/i.test(navigator.userAgent);
};

/**
 * Initialize the camera stream for QR code scanning
 * @param videoElement The video element to attach the stream to
 * @returns Promise that resolves when the camera is initialized
 */
export const initializeCameraStream = async (
  videoElement: HTMLVideoElement
): Promise<boolean> => {
  try {
    // Check if we have Capacitor available (for mobile apps)
    const hasCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor;
    const isAndroid = isAndroidDevice();
    const isMobile = isMobileDevice();
    
    console.log('Device info:', {
      isAndroid,
      isMobile,
      hasCapacitor,
      userAgent: navigator.userAgent
    });
    
    // Try to use the Web API first
    try {
      // Different constraints for mobile vs desktop
      const constraints = {
        video: isMobile ? {
          facingMode: { exact: 'environment' }, // Force back camera on mobile
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
        } : {
          facingMode: 'environment', // Prefer back camera but don't force it
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      
      console.log('Requesting camera with constraints:', constraints);
      
      // Request camera access with preferred settings for QR code scanning
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Attach the stream to the video element
      videoElement.srcObject = stream;
      
      console.log('Camera stream initialized successfully');
      return true;
    } catch (webApiError) {
      console.warn('Web API camera access failed:', webApiError);
      
      // If we're on Android and have Capacitor, we could try to use that instead
      // This would require additional implementation with the Capacitor Camera API
      // and is beyond the scope of this current implementation
      
      // Re-throw the error to be caught by the outer try/catch
      throw webApiError;
    }
  } catch (error) {
    console.error('Error initializing camera stream:', error);
    
    // Provide more specific error messages based on the error
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        console.error('Camera permission denied by user or system');
      } else if (error.name === 'NotFoundError') {
        console.error('No camera found on this device');
      } else if (error.name === 'NotReadableError') {
        console.error('Camera is already in use by another application');
      } else if (error.name === 'OverconstrainedError') {
        console.error('Camera constraints cannot be satisfied');
      } else if (error.name === 'SecurityError') {
        console.error('Camera access blocked due to security restrictions');
      } else if (error.name === 'AbortError') {
        console.error('Camera access aborted');
      }
    }
    
    return false;
  }
};

/**
 * Stop the camera stream
 * @param videoElement The video element with the stream to stop
 */
export const stopCameraStream = (videoElement: HTMLVideoElement): void => {
  if (videoElement && videoElement.srcObject) {
    const stream = videoElement.srcObject as MediaStream;
    const tracks = stream.getTracks();
    
    tracks.forEach((track) => {
      track.stop();
    });
    
    videoElement.srcObject = null;
  }
};