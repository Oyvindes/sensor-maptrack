
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export async function takePicture() {
  try {
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
