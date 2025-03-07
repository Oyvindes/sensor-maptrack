
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
    
    console.log('Starting camera in QR SCAN MODE...');
    
    // Force QR/Barcode scan mode for Android
    // We're being very explicit about the configuration to force scan mode
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false, // Must be false for scan mode
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera, // Force camera source not PHOTOS
      direction: CameraDirection.Rear, // Must use rear camera for scanning
      correctOrientation: true,
      // Guide the user with clear instructions
      promptLabelHeader: 'Scan QR Code',
      promptLabelCancel: 'Cancel',
      promptLabelPhoto: 'Capture QR Code', // Make it clear we're scanning, not taking photos
      saveToGallery: false, // Don't clutter gallery with QR images
      webUseInput: false, // Avoid using the file input on web
      width: 1024, // Set optimal dimensions for QR scanning
      height: 1024
    });
    
    console.log('Camera captured image for QR processing:', image?.webPath || 'No image captured');
    return image.webPath || null;
  } catch (error) {
    console.error('Error taking picture:', error);
    return null;
  }
}

export async function scanSensorQrCode(): Promise<CameraScanResult> {
  try {
    console.log("Starting QR code scanning process...");
    
    // First take a picture
    const imagePath = await takePicture();
    
    if (!imagePath) {
      console.error("No image captured during QR scan attempt");
      return { 
        success: false, 
        error: "No image captured" 
      };
    }
    
    // Log success for debugging
    console.log("Image captured successfully for QR scanning:", imagePath);
    
    // Simulate QR code processing - in a real app, we would process the image
    // to extract QR/barcode data
    console.log("Simulating QR code processing from image:", imagePath);
    
    // Generate a random mock IMEI
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
      error: error instanceof Error ? error.message : "Error scanning QR code"
    };
  }
}
