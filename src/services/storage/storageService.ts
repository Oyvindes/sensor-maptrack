import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Define the bucket name for product images
const PRODUCT_IMAGES_BUCKET = 'product-images';

// Interface for the storage service
export interface StorageServiceInterface {
  uploadProductImage(file: File): Promise<string>;
  deleteProductImage(path: string): Promise<boolean>;
}

// Implementation of the storage service using Supabase
class StorageService implements StorageServiceInterface {
  /**
   * Uploads a product image to Supabase storage
   * @param file The file to upload
   * @returns The public URL of the uploaded file
   */
  async uploadProductImage(file: File): Promise<string> {
    try {
      // Generate a unique file name to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Try to upload the file (assuming bucket exists)
      const { data, error } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        // If the bucket doesn't exist or there's a permission issue
        if (error.message.includes('bucket') || error.message.includes('security policy')) {
          console.error('Storage bucket error:', error);
          throw new Error(`Storage bucket not accessible: ${error.message}`);
        }
        
        console.error('Error uploading file:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .getPublicUrl(data.path);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadProductImage:', error);
      throw new Error('Failed to upload product image');
    }
  }
  
  /**
   * Deletes a product image from Supabase storage
   * @param path The path of the file to delete
   * @returns True if the file was deleted successfully
   */
  async deleteProductImage(path: string): Promise<boolean> {
    try {
      // Extract the file name from the URL
      const url = new URL(path);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // Delete the file
      const { error } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .remove([fileName]);
      
      if (error) {
        console.error('Error deleting file:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteProductImage:', error);
      throw new Error('Failed to delete product image');
    }
  }
  
  // Note: We're no longer trying to create the bucket automatically
  // The bucket should be created using the SQL script in supabase/scripts/setup_storage_bucket.sql
}

// Create and export the storage service
export const storageService: StorageServiceInterface = new StorageService();