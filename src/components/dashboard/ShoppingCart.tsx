import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from '@/types/store';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

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
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (items.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
          <CardDescription>Your shopping cart is empty</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="mb-4">You haven't added any products to your cart yet.</p>
          <Button onClick={onContinueShopping}>Continue Shopping</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Cart</CardTitle>
        <CardDescription>{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center justify-between py-2 border-b">
            <div className="flex-1">
              <h3 className="font-medium">{item.product.name}</h3>
              <p className="text-sm text-muted-foreground">${item.product.price} each</p>
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
              ${(item.product.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-4 font-bold">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onContinueShopping}>
          Continue Shopping
        </Button>
        <Button onClick={onCheckout}>
          Proceed to Checkout
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShoppingCart;