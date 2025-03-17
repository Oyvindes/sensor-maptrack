import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Tag, Package, ShoppingCart as ShoppingCartIcon, CheckCircle } from 'lucide-react';
import { getCurrentUser } from '@/services/authService';
import { toast } from 'sonner';
import { storeService } from '@/services/store';
import { Product, Purchase } from '@/types/store';
import ShoppingCart from './ShoppingCart';
import CheckoutForm from './CheckoutForm';

// Define a cart item type
interface CartItem {
  product: Product;
  quantity: number;
}

// Define view states for the store
type StoreView = 'products' | 'cart' | 'checkout';

interface StoreSectionProps {
  className?: string;
}

const StoreSection: React.FC<StoreSectionProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<string>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Shopping cart and checkout state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [storeView, setStoreView] = useState<StoreView>('products');
  
  const currentUser = getCurrentUser();
  const isSiteAdmin = currentUser?.role === 'master';

  // Fetch store data
  useEffect(() => {
    const fetchStoreData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch products
        const productsData = await storeService.listProducts();
        setProducts(productsData);
        
        // Fetch purchases based on user role
        let purchasesData: Purchase[] = [];
        if (isSiteAdmin) {
          purchasesData = await storeService.listPurchases();
        } else {
          purchasesData = await storeService.listUserPurchases();
        }
        setPurchases(purchasesData);
      } catch (err) {
        console.error('Error fetching store data:', err);
        setError('Failed to load store content. Please try again later.');
        toast.error('Failed to load store content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [currentUser]);
  
  // Synchronize activeTab and storeView
  useEffect(() => {
    if (activeTab === 'products') {
      setStoreView('products');
    } else if (activeTab === 'cart') {
      setStoreView('cart');
    }
  }, [activeTab]);
  
  // Update activeTab when storeView changes
  useEffect(() => {
    if (storeView === 'products') {
      setActiveTab('products');
    } else if (storeView === 'cart' || storeView === 'checkout') {
      setActiveTab('cart');
    }
  }, [storeView]);

  // Cart management methods
  const handleAddToCart = (product: Product) => {
    // Check if the product is already in the cart
    const existingItem = cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Update quantity if already in cart
      setCartItems(cartItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new item to cart
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }
    
    toast.success(`Added ${product.name} to cart`);
    setActiveTab('cart');
  };
  
  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    setCartItems(cartItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };
  
  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.product.id !== productId));
  };
  
  // Checkout methods
  const handleProceedToCheckout = () => {
    // Go directly to checkout with all cart items
    setStoreView('checkout');
  };
  
  const handleDirectCheckout = (product: Product) => {
    // Create a single item cart and go to checkout
    setCartItems([{ product, quantity: 1 }]);
    setStoreView('checkout');
  };
  
  const handleCheckoutSuccess = async () => {
    // Clear cart and return to products view
    setCartItems([]);
    setStoreView('products');
    
    // Refresh purchases
    const purchasesData = isSiteAdmin
      ? await storeService.listPurchases()
      : await storeService.listUserPurchases();
    setPurchases(purchasesData);
    
    toast.success('Purchase completed successfully!');
  };
  
  const handleCancelCheckout = () => {
    setStoreView('cart');
  };

  const handleCreateProduct = () => {
    // In a real implementation, this would open a product creation form
    // For now, we'll just show a toast
    toast.info('Product creation form would open here');
    
    // Example of how to create a product:
    // storeService.createProduct({
    //   name: 'New Sensor',
    //   description: 'A new sensor',
    //   price: 199
    // });
  };

  const getStatusBadge = (status: Purchase['status']) => {
    const statusConfig: Record<Purchase['status'], { color: string, label: string }> = {
      pending: { color: 'bg-yellow-500', label: 'Pending' },
      in_progress: { color: 'bg-blue-500', label: 'In Progress' },
      packaging: { color: 'bg-purple-500', label: 'Packaging' },
      sent: { color: 'bg-green-500', label: 'Sent' },
      invoiced: { color: 'bg-indigo-500', label: 'Invoiced' },
      completed: { color: 'bg-green-700', label: 'Completed' }
    };
    
    const config = statusConfig[status];
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading store content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-destructive mb-2">Error</div>
        <p className="text-center">{error}</p>
        <Button 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`w-full animate-fade-up [animation-delay:300ms] ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sensor Store</h1>
        {isSiteAdmin && (
          <Button onClick={handleCreateProduct} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="products" className="gap-2">
            <Tag className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="cart" className="gap-2">
            <ShoppingCartIcon className="h-4 w-4" />
            Cart {cartItems.length > 0 && `(${cartItems.length})`}
          </TabsTrigger>
          <TabsTrigger value="purchases" className="gap-2">
            <Package className="h-4 w-4" />
            My Purchases
          </TabsTrigger>
          {isSiteAdmin && (
            <TabsTrigger value="all-purchases" className="gap-2">
              <ShoppingCartIcon className="h-4 w-4" />
              All Purchases
            </TabsTrigger>
          )}
        </TabsList>
        
        {storeView === 'products' && (
          <TabsContent value="products" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  {product.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${product.price}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className="gap-2"
                    >
                      <ShoppingCartIcon className="h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDirectCheckout(product)}
                    >
                      Buy Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {products.length === 0 && (
              <div className="text-center p-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">No products available.</p>
              </div>
            )}
          </TabsContent>
        )}
        
        {storeView === 'checkout' && cartItems.length > 0 && (
          <TabsContent value="cart" className="space-y-4">
            <CheckoutForm
              items={cartItems}
              onSuccess={handleCheckoutSuccess}
              onCancel={handleCancelCheckout}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
            />
          </TabsContent>
        )}
        
        {storeView === 'cart' && (
          <TabsContent value="cart" className="space-y-4">
            <ShoppingCart
              items={cartItems}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onCheckout={handleProceedToCheckout}
              onContinueShopping={() => setActiveTab('products')}
            />
          </TabsContent>
        )}
        
        <TabsContent value="purchases">
          <div className="space-y-4">
            {purchases.filter(p => p.purchasedBy === currentUser?.name).map(purchase => (
              <Card key={purchase.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{purchase.productName}</CardTitle>
                      <CardDescription>
                        Purchased on {new Date(purchase.purchasedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(purchase.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div>
                      <p>Quantity: {purchase.quantity}</p>
                      <p>Total: ${purchase.totalPrice}</p>
                      
                      {(purchase.shippingAddress || purchase.shippingCity || purchase.shippingPostalCode || purchase.shippingCountry) && (
                        <div className="mt-2">
                          <p className="font-medium">Shipping Address:</p>
                          <p className="text-sm">{purchase.shippingAddress}</p>
                          <p className="text-sm">{purchase.shippingCity} {purchase.shippingPostalCode}</p>
                          <p className="text-sm">{purchase.shippingCountry}</p>
                        </div>
                      )}
                      
                      {(purchase.contactEmail || purchase.contactPhone) && (
                        <div className="mt-2">
                          <p className="font-medium">Contact:</p>
                          {purchase.contactEmail && <p className="text-sm">Email: {purchase.contactEmail}</p>}
                          {purchase.contactPhone && <p className="text-sm">Phone: {purchase.contactPhone}</p>}
                        </div>
                      )}
                      
                      {purchase.orderDetails && (
                        <div className="mt-2">
                          <p className="font-medium">Order Details:</p>
                          <p className="text-sm">{purchase.orderDetails}</p>
                        </div>
                      )}
                      
                      {purchase.notes && <p className="text-sm text-muted-foreground mt-2">Notes: {purchase.notes}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {purchases.filter(p => p.purchasedBy === currentUser?.name).length === 0 && (
              <div className="text-center p-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">You haven't made any purchases yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {isSiteAdmin && (
          <TabsContent value="all-purchases">
            <div className="space-y-4">
              {purchases.map(purchase => (
                <Card key={purchase.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{purchase.productName}</CardTitle>
                        <CardDescription>
                          Purchased by {purchase.purchasedBy} ({purchase.companyName})
                          <br />
                          on {new Date(purchase.purchasedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(purchase.status)}
                        <div className="flex gap-2">
                          <select
                            className="text-xs border rounded p-1"
                            value={purchase.status}
                            onChange={async (e) => {
                              try {
                                await storeService.updatePurchaseStatus(purchase.id, {
                                  status: e.target.value as Purchase['status']
                                });
                                
                                // Refresh purchases
                                const updatedPurchases = await storeService.listPurchases();
                                setPurchases(updatedPurchases);
                                
                                toast.success('Purchase status updated');
                              } catch (error) {
                                console.error('Error updating purchase status:', error);
                                toast.error('Failed to update purchase status');
                              }
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="packaging">Packaging</option>
                            <option value="sent">Sent</option>
                            <option value="invoiced">Invoiced</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <div>
                        <p>Quantity: {purchase.quantity}</p>
                        <p>Total: ${purchase.totalPrice}</p>
                        
                        {(purchase.shippingAddress || purchase.shippingCity || purchase.shippingPostalCode || purchase.shippingCountry) && (
                          <div className="mt-2">
                            <p className="font-medium">Shipping Address:</p>
                            <p className="text-sm">{purchase.shippingAddress}</p>
                            <p className="text-sm">{purchase.shippingCity} {purchase.shippingPostalCode}</p>
                            <p className="text-sm">{purchase.shippingCountry}</p>
                          </div>
                        )}
                        
                        {(purchase.contactEmail || purchase.contactPhone) && (
                          <div className="mt-2">
                            <p className="font-medium">Contact:</p>
                            {purchase.contactEmail && <p className="text-sm">Email: {purchase.contactEmail}</p>}
                            {purchase.contactPhone && <p className="text-sm">Phone: {purchase.contactPhone}</p>}
                          </div>
                        )}
                        
                        {purchase.orderDetails && (
                          <div className="mt-2">
                            <p className="font-medium">Order Details:</p>
                            <p className="text-sm">{purchase.orderDetails}</p>
                          </div>
                        )}
                        
                        {purchase.notes && <p className="text-sm text-muted-foreground mt-2">Notes: {purchase.notes}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {purchases.length === 0 && (
                <div className="text-center p-8 bg-muted rounded-lg">
                  <p className="text-muted-foreground">No purchases have been made yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default StoreSection;