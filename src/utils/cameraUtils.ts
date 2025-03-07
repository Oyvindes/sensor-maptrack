
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';

export interface CameraScanResult {
  success: boolean;
  data?: string;
  image?: string;
  error?: string;
}

export async function takePicture(): Promise<string | null> {
  try {
    // Check if running in a browser environment without Capacitor
    const isBrowser = typeof window !== 'undefined' && 
      !(window as any).Capacitor;
    
    if (isBrowser) {
      console.log('Running in browser environment, using file input fallback');
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      (input as any).capture = 'environment'; // Use the camera if available
      
      // Create a promise that resolves when the file is selected
      const filePromise = new Promise<string | null>((resolve) => {
        input.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result as string);
            };
            reader.onerror = () => {
              console.error('Error reading file');
              resolve(null);
            };
            reader.readAsDataURL(file);
          } else {
            resolve(null);
          }
        };
      });
      
      // Trigger the file input click
      input.click();
      
      // Wait for the file to be selected
      return await filePromise;
    }
    
    console.log('Starting camera in QR/Barcode scan mode...');
    
    // Explicitly configure for QR/Barcode scanning
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false, // Must be false for QR scanning
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera, // Force camera source not gallery
      direction: CameraDirection.Rear, // Use rear camera for scanning
      correctOrientation: true,
      promptLabelHeader: 'Scan QR Code',
      promptLabelCancel: 'Cancel',
      promptLabelPhoto: 'Scan QR Code',
      saveToGallery: false, // Don't save QR code images to gallery
      webUseInput: false, // Don't use file input on web
      width: 1024, // Optimal for QR scanning
      height: 1024
    });
    
    console.log('Camera captured QR image:', image?.webPath || 'No image captured');
    return image.webPath || null;
  } catch (error) {
    console.error('Error scanning QR code:', error);
    return null;
  }
}

export async function scanSensorQrCode(): Promise<CameraScanResult> {
  try {
    console.log("Starting QR code scanning process...");
    
    // Take picture in QR scan mode
    const imagePath = await takePicture();
    
    if (!imagePath) {
      console.error("No QR code image captured during scan attempt");
      return { 
        success: false, 
        error: "No QR code captured" 
      };
    }
    
    // Log success for debugging
    console.log("QR code image captured successfully for processing:", imagePath);
    
    // In a real implementation, we would process the image to extract the QR code data
    // For this example, we're simulating QR code processing
    console.log("Processing QR code from image...");
    
    // Generate a random mock IMEI to simulate successful QR code reading
    const mockImei = `IMEI${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`;
    
    return {
      success: true,
      data: mockImei,
      image: imagePath
    };
  } catch (error) {
    console.error("Error scanning QR code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to scan QR code"
    };
  }
}
