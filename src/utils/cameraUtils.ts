import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export async function takePicture() {
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
    
    // Use Capacitor Camera plugin
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    
    // Return the image path
    return image.webPath;
  } catch (error) {
    console.error('Error taking picture:', error);
    return null;
  }
}
