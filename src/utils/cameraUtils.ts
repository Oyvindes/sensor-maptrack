
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
    
    console.log('Starting camera capture with Capacitor...');
    
    // Force camera mode for Android - this is the key change
    // On Android, we need to be very explicit about camera settings
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false, // Disable editing for faster capture
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera, // Force camera source
      direction: CameraDirection.Rear, // Explicitly use rear camera
      correctOrientation: true, // Ensure proper orientation
      // These prompt labels help guide users on Android
      promptLabelHeader: 'Scan QR Code',
      promptLabelCancel: 'Cancel',
      promptLabelPhoto: 'Take Photo',
      saveToGallery: false, // Don't save to gallery for QR scans
      width: 1200, // Set reasonable dimensions
      height: 1200
    });
    
    console.log('Camera captured image successfully:', image?.webPath || 'No webPath returned');
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
