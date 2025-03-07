import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';

export interface CameraScanResult {
  success: boolean;
  data?: string;
  image?: string;
  error?: string;
}

// Store the active video stream to be able to stop it later
let activeVideoStream: MediaStream | null = null;

/**
 * Stops any active camera stream
 */
export function stopCameraStream() {
  if (activeVideoStream) {
    activeVideoStream.getTracks().forEach(track => track.stop());
    activeVideoStream = null;
  }
}

/**
 * Takes a picture using the device camera or file input fallback
 * @returns Promise with the image path or null if failed
 */
export async function takePicture(): Promise<string | null> {
  try {
    console.log('Starting camera capture process...');
    
    // Try using Capacitor Camera first if available
    const hasCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor;
    
    if (hasCapacitor) {
      try {
        console.log('Capacitor detected, using native camera API');
        
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
          webUseInput: true, // Use file input on web as fallback
          width: 1024, // Optimal for QR scanning
          height: 1024
        });
        
        console.log('Camera captured QR image:', image?.webPath || 'No image captured');
        return image.webPath || null;
      } catch (capacitorError) {
        console.error('Capacitor camera error:', capacitorError);
        console.log('Falling back to file input method');
        // Fall back to file input method
      }
    }
    
    // If Capacitor failed or isn't available, try browser's getUserMedia API
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('Trying browser camera API');
        return await useBrowserCamera();
      }
    } catch (browserCameraError) {
      console.error('Browser camera error:', browserCameraError);
      console.log('Falling back to file input method');
      // Fall back to file input method
    }
    
    // Last resort: use file input method
    console.log('Using file input method as fallback');
    return await useFileInput();
  } catch (error) {
    console.error('Error in takePicture:', error);
    
    // For demo purposes, generate a mock image path
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Returning mock image path');
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    }
    
    return null;
  }
}

/**
 * Uses the browser's camera API to capture an image
 * @returns Promise with the image data URL or null if failed
 */
async function useBrowserCamera(): Promise<string | null> {
  // First, make sure any existing stream is stopped
  stopCameraStream();
  
  // Create video and canvas elements for camera capture
  const video = document.createElement('video');
  const canvas = document.createElement('canvas');
  const container = document.createElement('div');
  
  // Style the container
  Object.assign(container.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: '9999',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  });
  
  // Style the video element
  Object.assign(video.style, {
    width: '100%',
    maxWidth: '400px',
    maxHeight: '70vh',
    objectFit: 'contain',
    marginBottom: '20px'
  });
  
  // Create capture button
  const captureButton = document.createElement('button');
  captureButton.textContent = 'Capture QR Code';
  Object.assign(captureButton.style, {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '10px'
  });
  
  // Create cancel button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  Object.assign(cancelButton.style, {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer'
  });
  
  // Add elements to container
  container.appendChild(video);
  container.appendChild(captureButton);
  container.appendChild(cancelButton);
  
  // Add container to document
  document.body.appendChild(container);
  
  // Create a promise that resolves when a picture is taken or cancelled
  return new Promise<string | null>(async (resolve) => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera if available
        audio: false
      });
      
      // Store the stream to be able to stop it later
      activeVideoStream = stream;
      
      // Set up video element with the stream
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true'); // Required for iOS
      video.play();
      
      // Set up canvas with video dimensions once metadata is loaded
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      };
      
      // Handle capture button click
      captureButton.onclick = () => {
        // Draw current video frame to canvas
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to data URL
          const imageData = canvas.toDataURL('image/png');
          
          // Clean up
          stopCameraStream();
          document.body.removeChild(container);
          
          // Resolve with the image data
          resolve(imageData);
        } else {
          console.error('Could not get canvas context');
          resolve(null);
        }
      };
      
      // Handle cancel button click
      cancelButton.onclick = () => {
        // Clean up
        stopCameraStream();
        document.body.removeChild(container);
        
        // Resolve with null
        resolve(null);
      };
      
      // Set up automatic QR code detection
      const { processQRCodeImage } = await import('./qrCodeUtils');
      
      // Process frames from the video stream to detect QR codes
      const scanInterval = setInterval(async () => {
        if (!activeVideoStream) {
          clearInterval(scanInterval);
          return;
        }
        
        // Draw current video frame to canvas
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to data URL
          const imageData = canvas.toDataURL('image/png');
          
          // Process the image to extract QR code data
          const qrData = await processQRCodeImage(imageData);
          
          if (qrData) {
            console.log("QR code detected automatically:", qrData);
            
            // Clean up
            clearInterval(scanInterval);
            stopCameraStream();
            document.body.removeChild(container);
            
            // Resolve with the image data
            resolve(imageData);
          }
        }
      }, 500); // Check every 500ms
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // Show error message in container
      container.innerHTML = `
        <div style="color: white; text-align: center; padding: 20px;">
          <h3>Camera Access Error</h3>
          <p>${error instanceof Error ? error.message : 'Could not access camera'}</p>
          <button id="closeErrorBtn" style="padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;">Close</button>
        </div>
      `;
      
      // Handle close button click
      const closeBtn = container.querySelector('#closeErrorBtn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          document.body.removeChild(container);
          resolve(null);
        });
      }
    }
  });
}

/**
 * Uses a file input to select an image
 * @returns Promise with the image data URL or null if failed
 */
async function useFileInput(): Promise<string | null> {
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
    
    // Handle cancel case
    setTimeout(() => {
      if (!input.files || input.files.length === 0) {
        console.log('File selection cancelled or timed out');
        resolve(null);
      }
    }, 100000); // 100 second timeout
  });
  
  // Trigger the file input click
  input.click();
  
  // Wait for the file to be selected
  return await filePromise;
}

/**
 * Scans a QR code using the device camera
 * @returns Promise with the scan result
 */
export async function scanSensorQrCode(): Promise<CameraScanResult> {
  try {
    console.log("Starting QR code scanning process...");
    
    // Take picture in QR scan mode
    const imagePath = await takePicture();
    
    if (!imagePath) {
      console.log("No QR code image captured during scan attempt - user may have cancelled");
      return {
        success: false,
        error: "QR code scanning cancelled"
      };
    }
    
    // Log success for debugging
    console.log("QR code image captured successfully for processing:", imagePath);
    
    // Process the image to extract QR code data
    try {
      // Import the QR code processing function
      const { processQRCodeImage, extractImeiFromQrCode } = await import('./qrCodeUtils');
      
      // Process the image to extract QR code data
      const qrData = await processQRCodeImage(imagePath);
      
      if (qrData) {
        console.log("QR code data extracted:", qrData);
        
        // Try to extract an IMEI from the QR code data
        const imei = extractImeiFromQrCode(qrData);
        
        if (imei) {
          // Return the IMEI
          return {
            success: true,
            data: imei,
            image: imagePath
          };
        } else {
          // If no IMEI pattern was found, return the raw QR code data
          return {
            success: true,
            data: qrData,
            image: imagePath
          };
        }
      } else {
        // No QR code found in the image
        return {
          success: false,
          error: "No QR code found in the image. Please try again with better lighting and focus.",
          image: imagePath
        };
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process QR code",
        image: imagePath
      };
    }
  } catch (error) {
    console.error("Error scanning QR code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to scan QR code"
    };
  }
}
