import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Product, CreateProductDto, PricingType } from '@/types/store';
import { storeService } from '@/services/store';
import { storageService } from '@/services/storage/storageService';
import { toast } from 'sonner';
import { Loader2, X, Upload, Image as ImageIcon } from 'lucide-react';

interface ProductFormProps {
  onSuccess: (product: Product) => void;
  onCancel: () => void;
  initialProduct?: Partial<Product>;
  isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  onSuccess, 
  onCancel,
  initialProduct,
  isEdit = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateProductDto>({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    price: initialProduct?.price || 0,
    pricing_type: initialProduct?.pricing_type || 'one_time',
    image_url: initialProduct?.imageUrl || ''  // Map from camelCase to snake_case
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialProduct?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 :
              name === 'pricing_type' ? (value as 'monthly' | 'one_time') :
              value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }
    
    setSelectedFile(file);
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Don't clear the image_url here - we'll only update it if the upload succeeds
    
    // Clear any errors
    if (errors.image_url) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image_url;
        return newErrors;
      });
    }
  };
  
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.pricing_type || !['monthly', 'one_time'].includes(formData.pricing_type)) {
      newErrors.pricing_type = 'Please select a pricing type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Prepare the data to submit
      let dataToSubmit = { ...formData };
      
      // If there's a selected file, try to upload it
      if (selectedFile) {
        setIsUploading(true);
        try {
          const imageUrl = await storageService.uploadProductImage(selectedFile);
          // Update the data to submit with the new image URL
          dataToSubmit = {
            ...dataToSubmit,
            image_url: imageUrl
          };
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image. Using direct URL if provided.');
          // Continue with form submission if there's a direct URL
          if (!formData.image_url) {
            toast.error('Please provide an image URL or try uploading again.');
            setIsSubmitting(false);
            setIsUploading(false);
            return;
          }
        } finally {
          setIsUploading(false);
        }
      }
      
      // If no file was selected and no URL was provided, continue without an image
      if (!selectedFile && !formData.image_url) {
        // This is fine - image is optional
      }
      
      let product: Product;
      
      if (isEdit && initialProduct?.id) {
        // Update existing product
        product = await storeService.updateProduct(initialProduct.id, dataToSubmit);
        toast.success('Product updated successfully!');
      } else {
        // Create new product
        product = await storeService.createProduct(dataToSubmit);
        toast.success('Product created successfully!');
      }
      
      // Clean up the preview URL
      if (previewUrl && previewUrl !== initialProduct?.imageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      onSuccess(product);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} product. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{isEdit ? 'Edit Product' : 'Create New Product'}</CardTitle>
            <CardDescription>
              {isEdit 
                ? 'Update the product details below' 
                : 'Fill in the details to create a new product in the store'}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="required">Product Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder=""
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="required">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder=""
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price" className="required">Price (NOK)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.price || ''}
              onChange={handleChange}
              placeholder=""
              className={errors.price ? 'border-destructive' : ''}
            />
            {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricing_type" className="required">Pricing Type</Label>
            <select
              id="pricing_type"
              name="pricing_type"
              value={formData.pricing_type}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-md border ${errors.pricing_type ? 'border-destructive' : 'border-input'} bg-background text-foreground`}
            >
              <option value="one_time">One-time Cost</option>
              <option value="monthly">Monthly Fee</option>
            </select>
            {errors.pricing_type && <p className="text-sm text-destructive">{errors.pricing_type}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Product Image (Optional)</Label>
            <div className="flex flex-col gap-4">
              <input
                type="file"
                id="image"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleClickUpload}
                className="flex items-center gap-2 w-full justify-center"
              >
                <Upload className="h-4 w-4" />
                {isEdit ? 'Change Image' : 'Upload Image'}
              </Button>
              
              {/* Fallback for direct URL input */}
              <div className="relative">
                <Label htmlFor="image_url" className="text-xs text-muted-foreground">
                  Or enter image URL directly:
                </Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
              
              {previewUrl && (
                <div className="mt-2 border rounded p-4 max-w-xs">
                  <p className="text-sm mb-2 font-medium">Image Preview:</p>
                  <div className="relative aspect-video bg-muted rounded flex items-center justify-center overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Product preview"
                      className="max-h-48 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                        toast.error('Failed to load image preview');
                      }}
                    />
                  </div>
                </div>
              )}
              
              {isUploading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading image...</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEdit ? 'Update Product' : 'Create Product'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProductForm;