import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from '@/types/store';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CartItem {
  product: Product;
  quantity: number;
}

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping
}) => {
  const { t } = useTranslation();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Separate monthly and one-time items
  const monthlyItems = items.filter(item => item.product.pricing_type === 'monthly');
  const onetimeItems = items.filter(item => item.product.pricing_type !== 'monthly');
  
  const monthlyTotal = monthlyItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const onetimeTotal = onetimeItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (items.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('store.yourCart')}</CardTitle>
          <CardDescription>{t('store.emptyCart')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="mb-4">{t('store.noProductsInCart')}</p>
          <Button onClick={onContinueShopping}>{t('store.continueShopping')}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('store.yourCart')}</CardTitle>
        <CardDescription>{t('store.itemsInCart', { count: totalItems })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center justify-between py-2 border-b">
            <div className="flex-1">
              <h3 className="font-medium">{item.product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {item.product.price} {t('store.krEach')}
                <span className={item.product.pricing_type === 'monthly' ? 'text-blue-600 ml-2' : 'text-muted-foreground ml-2'}>
                  ({item.product.pricing_type === 'monthly' ? t('store.monthlyFee') : t('store.oneTimeCost')})
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onRemoveItem(item.product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-24 text-right">
              {(item.product.price * item.quantity).toFixed(2)} {t('store.kr')}
            </div>
          </div>
        ))}

        <div className="space-y-2 pt-4">
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
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onContinueShopping}>
          {t('store.continueShopping')}
        </Button>
        <Button onClick={onCheckout}>
          {t('store.proceedToCheckout')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShoppingCart;