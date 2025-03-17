import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Product, CreatePurchaseDto } from '@/types/store';
import { storeService } from '@/services/store';
import { toast } from 'sonner';
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CheckoutFormProps {
  items: CartItem[];
  onSuccess: () => void;
  onCancel: () => void;
  onUpdateQuantity?: (productId: string, newQuantity: number) => void;
  onRemoveItem?: (productId: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  items,
  onSuccess,
  onCancel,
  onUpdateQuantity,
  onRemoveItem
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<CreatePurchaseDto, 'productId' | 'quantity' | 'items'>>({
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingCountry: '',
    contactEmail: '',
    contactPhone: '',
    orderDetails: '',
    customerReference: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // For multi-item checkout, we'll create multiple purchases with the same shipping info
      const purchasePromises = items.map(item =>
        storeService.createPurchase({
          productId: item.product.id,
          quantity: item.quantity,
          ...formData
        })
      );
      
      await Promise.all(purchasePromises);

      toast.success('Purchases completed successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating purchases:', error);
      toast.error('Failed to complete purchases. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total price of all items
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
        <CardDescription>
          Please provide your shipping and contact information to complete your purchase.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Order Summary</h3>
            {items.map(item => (
              <div key={item.product.id} className="flex items-center justify-between py-2 border-b">
                <div className="flex-1">
                  <span className="font-medium">{item.product.name}</span>
                  <div className="text-sm text-muted-foreground">${item.product.price} each</div>
                </div>
                {onUpdateQuantity && onRemoveItem ? (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1 || isSubmitting}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onRemoveItem(item.product.id)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-right">
                    <span>{item.quantity} × ${item.product.price}</span>
                  </div>
                )}
                <div className="w-24 text-right">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            <div className="flex justify-between py-2 font-bold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Shipping Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingAddress">Address</Label>
                <Input
                  id="shippingAddress"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingCity">City</Label>
                  <Input
                    id="shippingCity"
                    name="shippingCity"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingPostalCode">Postal Code</Label>
                  <Input
                    id="shippingPostalCode"
                    name="shippingPostalCode"
                    value={formData.shippingPostalCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingCountry">Country</Label>
                <Input
                  id="shippingCountry"
                  name="shippingCountry"
                  value={formData.shippingCountry}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerReference">Your Reference Number (Optional)</Label>
            <Input
              id="customerReference"
              name="customerReference"
              value={formData.customerReference || ''}
              onChange={handleChange}
              placeholder="Your purchase order or reference number for invoicing"
            />
            <p className="text-xs text-muted-foreground">
              This reference will appear on your invoice and can be used to track your order.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderDetails">Additional Order Details (Optional)</Label>
            <Textarea
              id="orderDetails"
              name="orderDetails"
              value={formData.orderDetails || ''}
              onChange={handleChange}
              placeholder="Any special instructions or requirements for your order"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Complete Purchase'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CheckoutForm;