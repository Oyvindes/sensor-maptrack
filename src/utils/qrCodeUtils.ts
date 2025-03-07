/**
 * Utility functions for QR code generation and processing
 */

/**
 * Generates a QR code data URL for the given content
 * This is a simple mock implementation that would be replaced with a real QR code generator
 * @param content The content to encode in the QR code
 * @returns A data URL representing the QR code (mock implementation)
 */
export function generateQRCode(content: string): string {
  console.log(`Generating QR code for: ${content}`);
  // In a real implementation, we would use a library like qrcode.js to generate a real QR code
  // For this mock, we're just returning a placeholder image
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
}

/**
 * Validates if a string is a valid IMEI number
 * @param imei The IMEI string to validate
 * @returns True if the IMEI is valid, false otherwise
 */
export function validateImei(imei: string): boolean {
  // Remove any non-numeric characters
  const cleanImei = imei.replace(/\D/g, '');
  
  // IMEI should be 15 digits
  if (cleanImei.length !== 15) {
    return false;
  }
  
  // Implement Luhn algorithm for IMEI validation
  // This is a simplified implementation
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let d = parseInt(cleanImei[i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(cleanImei[14]);
}

/**
 * Formats an IMEI string with proper spacing for display
 * @param imei The raw IMEI string
 * @returns Formatted IMEI string
 */
export function formatImei(imei: string): string {
  // Remove any non-numeric characters
  const cleanImei = imei.replace(/\D/g, '');
  
  // Format as XX-XXXXXX-XXXXXX-X
  if (cleanImei.length === 15) {
    return `${cleanImei.slice(0, 2)}-${cleanImei.slice(2, 8)}-${cleanImei.slice(8, 14)}-${cleanImei.slice(14)}`;
  }
  
  // If not a standard IMEI length, return as is
  return cleanImei;
}

/**
 * Extracts an IMEI from a QR code scan result
 * @param qrData The raw data from a QR code scan
 * @returns The extracted IMEI or null if not found
 */
export function extractImeiFromQrCode(qrData: string): string | null {
  // Check if the QR data directly contains an IMEI pattern
  const imeiPattern = /IMEI[:\s]?(\d{15})/i;
  const match = qrData.match(imeiPattern);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // If the QR code contains a URL with an IMEI parameter
  const urlImeiPattern = /[?&]imei=(\d{15})/i;
  const urlMatch = qrData.match(urlImeiPattern);
  
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  
  // If the QR code is just a numeric string of the right length
  if (/^\d{15}$/.test(qrData)) {
    return qrData;
  }
  
  // No valid IMEI found
  return null;
}

/**
 * Process an image to extract QR code data using jsQR library
 * @param imageData The image data as a data URL
 * @returns The extracted QR code data or null if none found
 */
export async function processQRCodeImage(imageData: string): Promise<string | null> {
  console.log("Processing QR code image...");
  
  try {
    // Import jsQR dynamically
    const jsQR = (await import('jsqr')).default;
    
    // Create a canvas to draw the image
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!context) {
      console.error("Could not get canvas context");
      return null;
    }
    
    // Create an image from the data URL
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Handle CORS issues
    img.src = imageData;
    
    // Wait for the image to load
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => {
        console.error("Image load error:", e);
        reject(new Error("Failed to load image"));
      };
      // Set a timeout in case the image never loads
      setTimeout(() => reject(new Error("Image load timeout")), 5000);
    });
    
    console.log(`Image loaded: ${img.width}x${img.height}`);
    
    // For very large images, resize to improve performance and detection
    let targetWidth = img.width;
    let targetHeight = img.height;
    const MAX_DIMENSION = 1024;
    
    if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
      if (img.width > img.height) {
        targetWidth = MAX_DIMENSION;
        targetHeight = Math.floor(img.height * (MAX_DIMENSION / img.width));
      } else {
        targetHeight = MAX_DIMENSION;
        targetWidth = Math.floor(img.width * (MAX_DIMENSION / img.height));
      }
      console.log(`Resizing image to ${targetWidth}x${targetHeight} for better QR detection`);
    }
    
    // Set canvas dimensions
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    // Draw the image on the canvas
    context.drawImage(img, 0, 0, targetWidth, targetHeight);
    
    // Try multiple processing approaches to improve QR code detection
    let code = null;
    
    // 1. Try with original image
    const imageDataObj = context.getImageData(0, 0, canvas.width, canvas.height);
    code = jsQR(imageDataObj.data, imageDataObj.width, imageDataObj.height);
    
    // 2. If not found, try with increased contrast
    if (!code) {
      console.log("Trying with increased contrast...");
      context.drawImage(img, 0, 0, targetWidth, targetHeight);
      const imageData2 = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Increase contrast
      const data = imageData2.data;
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale with increased contrast
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const newVal = avg > 127 ? 255 : 0; // Threshold to black or white
        data[i] = data[i + 1] = data[i + 2] = newVal;
      }
      
      context.putImageData(imageData2, 0, 0);
      code = jsQR(data, imageData2.width, imageData2.height);
    }
    
    // 3. If still not found, try with inverted colors
    if (!code) {
      console.log("Trying with inverted colors...");
      context.drawImage(img, 0, 0, targetWidth, targetHeight);
      const imageData3 = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Invert colors
      const data = imageData3.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];         // R
        data[i + 1] = 255 - data[i + 1]; // G
        data[i + 2] = 255 - data[i + 2]; // B
      }
      
      context.putImageData(imageData3, 0, 0);
      code = jsQR(data, imageData3.width, imageData3.height);
    }
    
    // 4. Try with different scales if still not found
    if (!code) {
      const scales = [0.8, 1.2, 0.5];
      for (const scale of scales) {
        if (code) break;
        
        console.log(`Trying with scale ${scale}...`);
        const scaledWidth = Math.floor(targetWidth * scale);
        const scaledHeight = Math.floor(targetHeight * scale);
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        
        context.drawImage(img, 0, 0, scaledWidth, scaledHeight);
        const scaledImageData = context.getImageData(0, 0, scaledWidth, scaledHeight);
        code = jsQR(scaledImageData.data, scaledWidth, scaledHeight);
      }
    }
    
    // Return the QR code data if found
    if (code) {
      console.log("QR code found:", code.data);
      return code.data;
    } else {
      console.log("No QR code found in image after multiple processing attempts");
      return null;
    }
  } catch (error) {
    console.error("Error processing QR code:", error);
    return null;
  }
}