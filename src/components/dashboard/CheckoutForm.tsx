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
import ShippingAddressSearch from './ShippingAddressSearch';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreatePurchaseDto>({
    items: [], // Will be set during submission
    companyName: '',
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingCountry: '',
    contactEmail: '',
    contactPhone: '',
    orderDetails: '',
    customerReference: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, value?: string) => {
    // Handle both event objects and direct field/value pairs
    if (typeof e === 'string' && value !== undefined) {
      // Direct field/value pair from ShippingAddressSearch
      setFormData(prev => ({
        ...prev,
        [e]: value
      }));
    } else if (typeof e === 'object') {
      // Regular input event
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert cart items to purchase items format
      const purchaseItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      // Create a single purchase with all items
      await storeService.createPurchase({
        ...formData,
        items: purchaseItems
      });

      toast.success(t('store.purchaseCompleted'));
      onSuccess();
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast.error(t('store.purchaseError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate separate totals for monthly and one-time items
  const monthlyItems = items.filter(item => item.product.pricing_type === 'monthly');
  const onetimeItems = items.filter(item => item.product.pricing_type !== 'monthly');
  
  const monthlyTotal = monthlyItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const onetimeTotal = onetimeItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('store.completeYourPurchase')}</CardTitle>
        <CardDescription>
          {t('store.provideShippingInfo')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t('store.orderSummary')}</h3>
            {items.map(item => (
              <div key={item.product.id} className="flex items-center justify-between py-2 border-b">
                <div className="flex-1">
                  <span className="font-medium">{item.product.name}</span>
                  <div className="text-sm text-muted-foreground">
                    {item.product.price} {t('store.krEach')}
                    <span className={item.product.pricing_type === 'monthly' ? 'text-blue-600 ml-2' : 'text-muted-foreground ml-2'}>
                      ({item.product.pricing_type === 'monthly' ? t('store.monthlyFee') : t('store.oneTimeCost')})
                    </span>
                  </div>
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
                    <span>{item.quantity} × {item.product.price} {t('store.kr')}</span>
                  </div>
                )}
                <div className="w-24 text-right">
                  {(item.product.price * item.quantity).toFixed(2)} {t('store.kr')}
                </div>
              </div>
            ))}
            <div className="space-y-2 py-2">
              {onetimeTotal > 0 && (
                <div className="flex justify-between">
                  <span>{t('store.oneTimeCosts')}</span>
                  <span>{onetimeTotal.toFixed(2)} {t('store.kr')}</span>
                </div>
              )}
              {monthlyTotal > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>{t('store.monthlyFees')}</span>
                  <span>{monthlyTotal.toFixed(2)} {t('store.krPerMonth')}</span>
                </div>
              )}
              {/* Only show total if there are one-time costs */}
              {onetimeTotal > 0 && (
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>{t('store.totalOneTime')}</span>
                  <span>{onetimeTotal.toFixed(2)} {t('store.kr')}</span>
                </div>
              )}
              {/* Add note about monthly fees if present */}
              {monthlyTotal > 0 && (
                <div className="text-sm text-muted-foreground pt-2">
                  {t('store.monthlyFeesBilledSeparately')}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('store.shippingInformation')}</h3>
            
            {/* Company Name Field */}
            <div className="space-y-2">
              <Label htmlFor="companyName">{t('store.companyName')}</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder={t('store.enterCompanyName')}
                required
              />
            </div>
            
            {/* Address Search Component */}
            <ShippingAddressSearch
              shippingAddress={formData.shippingAddress}
              shippingCity={formData.shippingCity}
              shippingPostalCode={formData.shippingPostalCode}
              shippingCountry={formData.shippingCountry}
              onChange={handleChange}
            />
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingAddress">{t('store.address')}</Label>
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
                  <Label htmlFor="shippingCity">{t('store.city')}</Label>
                  <Input
                    id="shippingCity"
                    name="shippingCity"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingPostalCode">{t('store.postalCode')}</Label>
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
                <Label htmlFor="shippingCountry">{t('store.country')}</Label>
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
            <h3 className="text-lg font-medium">{t('store.contactInformation')}</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">{t('store.contactEmail')}</Label>
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
                <Label htmlFor="contactPhone">{t('store.contactPhone')}</Label>
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
            <Label htmlFor="customerReference">{t('store.yourReferenceNumber')}</Label>
            <Input
              id="customerReference"
              name="customerReference"
              value={formData.customerReference || ''}
              onChange={handleChange}
              placeholder={t('store.referenceNumberPlaceholder')}
            />
            <p className="text-xs text-muted-foreground">
              {t('store.referenceNumberHelp')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderDetails">{t('store.additionalOrderDetails')}</Label>
            <Textarea
              id="orderDetails"
              name="orderDetails"
              value={formData.orderDetails || ''}
              onChange={handleChange}
              placeholder={t('store.orderDetailsPlaceholder')}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t('buttons.cancel')}
          </Button>
          <Button type="submit" variant="outline" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('store.processing')}
              </>
            ) : (
              t('store.completePurchase')
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CheckoutForm;