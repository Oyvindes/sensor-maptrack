import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Tag, Package, ShoppingCart as ShoppingCartIcon, CheckCircle, Pencil, FileText, Trash2 } from 'lucide-react';
import { getCurrentUser } from '@/services/authService';
import { toast } from 'sonner';
import { storeService } from '@/services/store';
import { pdfService } from '@/services/pdfService';
import { Product, Purchase } from '@/types/store';
import ShoppingCart from './ShoppingCart';
import CheckoutForm from './CheckoutForm';
import ProductForm from './ProductForm';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<string>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Shopping cart and checkout state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [storeView, setStoreView] = useState<StoreView>('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
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
          // For regular admins, fetch all purchases and filter client-side
          // This is a workaround for the issue where purchases don't show up
          purchasesData = await supabase
            .from('purchases')
            .select(`
              *,
              items:purchase_items(
                *,
                product:products(name)
              )
            `)
            .order('purchased_at', { ascending: false })
            .then(({ data, error }) => {
              if (error) {
                console.error('Error fetching all purchases:', error);
                return [];
              }
              
              // Map the data to match the Purchase type with items
              return data.map(purchase => ({
                id: purchase.id,
                items: purchase.items.map((item: any) => ({
                  id: item.id,
                  purchaseId: item.purchase_id,
                  productId: item.product_id,
                  productName: item.product?.name || 'Unknown Product',
                  quantity: item.quantity,
                  pricePerUnit: item.price_per_unit,
                  totalPrice: item.total_price,
                  createdAt: item.created_at
                })),
                itemsTotalPrice: purchase.items_total_price || 0,
                status: purchase.status || 'pending',
                purchasedAt: purchase.purchased_at,
                purchasedBy: purchase.purchased_by || 'Unknown User',
                companyId: purchase.company_id,
                companyName: purchase.company_name || 'Unknown Company',
                shippingAddress: purchase.shipping_address || '',
                shippingCity: purchase.shipping_city || '',
                shippingPostalCode: purchase.shipping_postal_code || '',
                shippingCountry: purchase.shipping_country || '',
                contactEmail: purchase.contact_email || '',
                contactPhone: purchase.contact_phone || '',
                orderDetails: purchase.order_details || '',
                trackingNumber: purchase.tracking_number || '',
                carrier: purchase.carrier || '',
                shippedDate: purchase.shipped_date,
                notes: purchase.notes || '',
                customerReference: purchase.customer_reference || '',
                orderReference: purchase.order_reference || '',
                // Backward compatibility
                productId: purchase.items[0]?.product_id,
                productName: purchase.items[0]?.product?.name,
                quantity: purchase.items[0]?.quantity,
                totalPrice: purchase.items_total_price
              }));
            });
          
        }
        setPurchases(purchasesData);
      } catch (err) {
        console.error('Error fetching store data:', err);
        setError('Failed to load store content. Please try again later.');
        toast.error(t('store.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [currentUser]);
  
  // Synchronize activeTab and storeView
  useEffect(() => {
    // Prevent users from accessing cart
    if (currentUser?.role === 'user' && activeTab === 'cart') {
      toast.error("Only administrators can access the shopping cart");
      setActiveTab('products');
      return;
    }
    
    if (activeTab === 'products') {
      setStoreView('products');
    } else if (activeTab === 'cart') {
      setStoreView('cart');
    }
  }, [activeTab, currentUser?.role]);
  
  // Update activeTab when storeView changes
  useEffect(() => {
    // Prevent users from accessing checkout
    if (currentUser?.role === 'user' && (storeView === 'cart' || storeView === 'checkout')) {
      toast.error("Only administrators can access the shopping cart");
      setStoreView('products');
      return;
    }
    
    if (storeView === 'products') {
      setActiveTab('products');
    } else if (storeView === 'cart' || storeView === 'checkout') {
      setActiveTab('cart');
    }
  }, [storeView, currentUser?.role]);

  // Cart management methods
  const handleAddToCart = (product: Product) => {
    // Check if the user has permission to add items to cart (admin or master only)
    if (currentUser?.role === 'user') {
      toast.error("Only administrators can add items to the shopping cart");
      return;
    }
    
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

  // Handle modal open/close effects
  useEffect(() => {
    if (showProductForm) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll when modal is closed
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showProductForm]);

  const handleCreateProduct = () => {
    setProductToEdit(null);
    setShowProductForm(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setShowProductForm(true);
  };
  
  const handleProductFormSuccess = async (product: Product) => {
    setShowProductForm(false);
    
    // Refresh products
    const productsData = await storeService.listProducts();
    setProducts(productsData);
    
    toast.success(`Product ${productToEdit ? 'updated' : 'created'} successfully!`);
  };
  
  const handleProductFormCancel = () => {
    setShowProductForm(false);
  };
  
  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await storeService.deleteProduct(product.id);
        
        // Refresh products
        const productsData = await storeService.listProducts();
        setProducts(productsData);
        
        toast.success(`Product deleted successfully!`);
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };
  
  const handleGenerateProformaInvoice = async (purchase: Purchase) => {
    try {
      // Generate the PDF without showing a loading indicator
      const pdfBlob = await pdfService.generateProformaInvoice(purchase);
      
      // Create a URL for the blob
      const url = URL.createObjectURL(pdfBlob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `proforma-invoice-${purchase.orderReference || purchase.id.substring(0, 8)}.pdf`;
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
      
      // Show success toast
      toast.success('Proforma invoice generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Show error toast
      toast.error('Failed to generate proforma invoice');
    }
  };

  const getStatusBadge = (status: Purchase['status']) => {
    const statusConfig: Record<Purchase['status'], { color: string, translationKey: string }> = {
      pending: { color: 'bg-yellow-500', translationKey: 'store.orderStatus.pending' },
      in_progress: { color: 'bg-blue-500', translationKey: 'store.orderStatus.inProgress' },
      packaging: { color: 'bg-purple-500', translationKey: 'store.orderStatus.packaging' },
      sent: { color: 'bg-green-500', translationKey: 'store.orderStatus.sent' },
      invoiced: { color: 'bg-indigo-500', translationKey: 'store.orderStatus.invoiced' },
      completed: { color: 'bg-green-700', translationKey: 'store.orderStatus.completed' }
    };
    
    const config = statusConfig[status];
    
    return (
      <Badge className={`${config.color} text-white`}>
        {t(config.translationKey)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{t('store.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-destructive mb-2">{t('store.error')}</div>
        <p className="text-center">{error}</p>
        <Button
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          {t('buttons.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className={`w-full animate-fade-up [animation-delay:300ms] ${className}`}>
      <h1 className="text-2xl font-bold mb-2">{t('store.title')}</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="products" className="flex flex-col">
            <Tag className="h-4 w-4" />
            <span className="text-[10px] mt-1">{t('store.products')}</span>
          </TabsTrigger>
          {currentUser?.role !== 'user' && (
            <TabsTrigger value="cart" className="flex flex-col">
              <ShoppingCartIcon className="h-4 w-4" />
              <span className="text-[10px] mt-1">{t('store.cart')} {cartItems.length > 0 && `(${cartItems.length})`}</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="purchases" className="flex flex-col">
            <Package className="h-4 w-4" />
            <span className="text-[10px] mt-1">{t('store.purchases')}</span>
          </TabsTrigger>
          {isSiteAdmin && (
            <TabsTrigger value="all-purchases" className="flex flex-col">
              <ShoppingCartIcon className="h-4 w-4" />
              <span className="text-[10px] mt-1">{t('store.all')}</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        {storeView === 'products' && (
          <TabsContent value="products" className="space-y-4">
            {isSiteAdmin && (
              <div className="flex justify-start mb-6">
                <Button onClick={handleCreateProduct} className="h-12 px-4">
                  <span className="flex flex-col items-center gap-1">
                    <Plus className="h-4 w-4" />
                    <span className="text-[10px]">{t('buttons.new')}</span>
                  </span>
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  {product.imageUrl && (
                    <div className="relative aspect-square w-full overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain bg-muted p-2"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-1">
                      <p className="text-2xl font-bold">{product.price} kr</p>
                      <p className="text-sm text-muted-foreground">
                        {product.pricing_type === 'monthly' ? 'Monthly Fee' : 'One-time Cost'}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {currentUser?.role !== 'user' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="gap-2"
                      >
                        <ShoppingCartIcon className="h-4 w-4" />
                        {t('store.addToCart')}
                      </Button>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">
                        {t('store.contactAdmin')}
                      </div>
                    )}
                    {isSiteAdmin && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          {t('buttons.edit')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('buttons.delete')}
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {products.length === 0 && (
              <div className="text-center p-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">{t('store.noProducts')}</p>
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
            {purchases.filter(p => {
              if (!currentUser?.name) {
                return false;
              }
              
              if (!p.purchasedBy) {
                return false;
              }
              
              // For regular admins, try multiple matching strategies
              const purchasedBy = p.purchasedBy.toLowerCase();
              const userName = currentUser.name.toLowerCase();
              
              // Strategy 1: Exact match
              if (purchasedBy === userName) {
                return true;
              }
              
              // Strategy 2: Either contains the other
              if (purchasedBy.includes(userName) || userName.includes(purchasedBy)) {
                return true;
              }
              
              // Strategy 3: Match by company ID
              if (p.companyId === currentUser.companyId) {
                return true;
              }
              
              // No match
              return false;
            }).map(purchase => (
              <Card key={purchase.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Purchase #{purchase.orderReference || purchase.id.substring(0, 8)}</CardTitle>
                      <CardDescription>
                        Purchased on {new Date(purchase.purchasedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(purchase.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div className="w-full">
                      <div className="space-y-2">
                        <h3 className="font-medium">Order Items:</h3>
                        {purchase.items.map((item) => (
                          <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                            <div>
                              <p className="font-medium">
                                {item.productName}
                                <span className={item.pricing_type === 'monthly' ? 'text-blue-600 ml-2' : 'text-muted-foreground ml-2'}>
                                  ({item.pricing_type === 'monthly' ? '📅 Monthly' : '💰 One-time'})
                                </span>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} × {item.pricePerUnit} kr{item.pricing_type === 'monthly' ? '/month' : ''}
                              </p>
                            </div>
                            <p>{item.totalPrice} kr</p>
                          </div>
                        ))}
                        {/* Calculate and show separate totals */}
                        {(() => {
                          const monthlyItems = purchase.items.filter(item => item.pricing_type === 'monthly');
                          const onetimeItems = purchase.items.filter(item => item.pricing_type !== 'monthly');
                          
                          const monthlyTotal = monthlyItems.reduce((sum, item) => sum + item.totalPrice, 0);
                          const onetimeTotal = onetimeItems.reduce((sum, item) => sum + item.totalPrice, 0);
                          
                          return (
                            <div className="space-y-2 pt-2">
                              {onetimeTotal > 0 && (
                                <div className="flex justify-between">
                                  <span>One-time Costs</span>
                                  <span>{onetimeTotal.toFixed(2)} kr</span>
                                </div>
                              )}
                              {monthlyTotal > 0 && (
                                <div className="flex justify-between text-blue-600">
                                  <span>Monthly Fees</span>
                                  <span>{monthlyTotal.toFixed(2)} kr/month</span>
                                </div>
                              )}
                              {onetimeTotal > 0 && (
                                <div className="flex justify-between font-bold pt-2 border-t">
                                  <span>Total (One-time)</span>
                                  <span>{onetimeTotal.toFixed(2)} kr</span>
                                </div>
                              )}
                              {monthlyTotal > 0 && (
                                <div className="text-sm text-muted-foreground pt-2">
                                  * Monthly fees will be billed separately
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      
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
                      
                      {/* Tracking Information */}
                      {(purchase.trackingNumber || purchase.carrier || purchase.shippedDate) && (
                        <div className="mt-2">
                          <p className="font-medium">Tracking Information:</p>
                          {purchase.trackingNumber && (
                            <p className="text-sm">
                              Tracking Number: <a
                                href={`https://www.google.com/search?q=${purchase.carrier}+${purchase.trackingNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {purchase.trackingNumber}
                              </a>
                            </p>
                          )}
                          {purchase.carrier && <p className="text-sm">Carrier: {purchase.carrier}</p>}
                          {purchase.shippedDate && (
                            <p className="text-sm">
                              Shipped on: {new Date(purchase.shippedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Order References */}
                      <div className="mt-2">
                        <p className="font-medium">Order References:</p>
                        {purchase.orderReference && (
                          <p className="text-sm">
                            Order #: <span className="font-mono">{purchase.orderReference}</span>
                          </p>
                        )}
                        {purchase.customerReference && (
                          <p className="text-sm">
                            Your Reference: <span className="font-mono">{purchase.customerReference}</span>
                          </p>
                        )}
                      </div>
                      
                      {purchase.notes && <p className="text-sm text-muted-foreground mt-2">Notes: {purchase.notes}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {purchases.filter(p => {
              if (!currentUser?.name) return false;
              if (!p.purchasedBy) return false;
              
              const purchasedBy = p.purchasedBy.toLowerCase();
              const userName = currentUser.name.toLowerCase();
              
              if (purchasedBy === userName) return true;
              if (purchasedBy.includes(userName) || userName.includes(purchasedBy)) return true;
              if (p.companyId === currentUser.companyId) return true;
              
              return false;
            }).length === 0 && (
              <div className="text-center p-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">{t('store.noPurchases')}</p>
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
                        <CardTitle>Order #{purchase.orderReference || purchase.id.substring(0, 8)}</CardTitle>
                        <CardDescription>
                          Purchased by {purchase.purchasedBy || 'Unknown User'} ({purchase.companyName || 'Unknown Company'})
                          <br />
                          on {purchase.purchasedAt ? new Date(purchase.purchasedAt).toLocaleDateString() : 'Unknown Date'}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(purchase.status)}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => handleGenerateProformaInvoice(purchase)}
                            title="Generate Proforma Invoice"
                          >
                            <FileText className="h-4 w-4" />
                            {t('store.invoice')}
                          </Button>
                          <select
                            className="text-xs border rounded p-1.5 bg-background text-foreground min-w-[120px] dark:border-gray-700"
                            value={purchase.status}
                            onChange={async (e) => {
                              try {
                                try {
                                  await storeService.updatePurchaseStatus(purchase.id, {
                                    status: e.target.value as Purchase['status'],
                                    // Only include tracking info if it exists
                                    ...(purchase.trackingNumber ? { trackingNumber: purchase.trackingNumber } : {}),
                                    ...(purchase.carrier ? { carrier: purchase.carrier } : {})
                                  });
                                  
                                  // Refresh purchases
                                  const updatedPurchases = await storeService.listPurchases();
                                  setPurchases(updatedPurchases);
                                  
                                  toast.success('Purchase status updated');
                                } catch (error: any) {
                                  // Check if the error is related to missing columns
                                  if (error.message?.includes('carrier') || error.message?.includes('Could not find')) {
                                    // Try again with just the status
                                    await storeService.updatePurchaseStatus(purchase.id, {
                                      status: e.target.value as Purchase['status']
                                    });
                                    
                                    // Refresh purchases
                                    const updatedPurchases = await storeService.listPurchases();
                                    setPurchases(updatedPurchases);
                                    
                                    toast.success('Purchase status updated (tracking info not saved - migration required)');
                                  } else {
                                    throw error; // Re-throw if it's a different error
                                  }
                                }
                              } catch (error) {
                                console.error('Error updating purchase status:', error);
                                toast.error('Failed to update purchase status');
                              }
                            }}
                          >
                            <option value="pending">{t('store.orderStatus.pending')}</option>
                            <option value="in_progress">{t('store.orderStatus.inProgress')}</option>
                            <option value="packaging">{t('store.orderStatus.packaging')}</option>
                            <option value="sent">{t('store.orderStatus.sent')}</option>
                            <option value="invoiced">{t('store.orderStatus.invoiced')}</option>
                            <option value="completed">{t('store.orderStatus.completed')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <div className="w-full">
                        <div className="space-y-2">
                          <h3 className="font-medium">Order Items:</h3>
                          {purchase.items.map((item) => (
                            <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                              <div>
                                <p className="font-medium">
                                  {item.productName}
                                  <span className={item.pricing_type === 'monthly' ? 'text-blue-600 ml-2' : 'text-muted-foreground ml-2'}>
                                    ({item.pricing_type === 'monthly' ? '📅 Monthly' : '💰 One-time'})
                                  </span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} × {item.pricePerUnit} kr{item.pricing_type === 'monthly' ? '/month' : ''}
                                </p>
                              </div>
                              <p>{item.totalPrice} kr</p>
                            </div>
                          ))}
                          {/* Calculate and show separate totals */}
                          {(() => {
                            const monthlyItems = purchase.items.filter(item => item.pricing_type === 'monthly');
                            const onetimeItems = purchase.items.filter(item => item.pricing_type !== 'monthly');
                            
                            const monthlyTotal = monthlyItems.reduce((sum, item) => sum + item.totalPrice, 0);
                            const onetimeTotal = onetimeItems.reduce((sum, item) => sum + item.totalPrice, 0);
                            
                            return (
                              <div className="space-y-2 pt-2">
                                {onetimeTotal > 0 && (
                                  <div className="flex justify-between">
                                    <span>One-time Costs</span>
                                    <span>{onetimeTotal.toFixed(2)} kr</span>
                                  </div>
                                )}
                                {monthlyTotal > 0 && (
                                  <div className="flex justify-between text-blue-600">
                                    <span>Monthly Fees</span>
                                    <span>{monthlyTotal.toFixed(2)} kr/month</span>
                                  </div>
                                )}
                                {onetimeTotal > 0 && (
                                  <div className="flex justify-between font-bold pt-2 border-t">
                                    <span>Total (One-time)</span>
                                    <span>{onetimeTotal.toFixed(2)} kr</span>
                                  </div>
                                )}
                                {monthlyTotal > 0 && (
                                  <div className="text-sm text-muted-foreground pt-2">
                                    * Monthly fees will be billed separately
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        
                        {/* Always show shipping address section for site-wide admins */}
                        <div className="mt-2">
                          <p className="font-medium">Shipping Address:</p>
                          {purchase.shippingAddress ? (
                            <>
                              <p className="text-sm">{purchase.shippingAddress}</p>
                              <p className="text-sm">{purchase.shippingCity || ''} {purchase.shippingPostalCode || ''}</p>
                              <p className="text-sm">{purchase.shippingCountry || ''}</p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">No shipping address provided</p>
                          )}
                        </div>
                        
                        {/* Always show contact information section for site-wide admins */}
                        <div className="mt-2">
                          <p className="font-medium">Contact:</p>
                          {purchase.contactEmail || purchase.contactPhone ? (
                            <>
                              {purchase.contactEmail && <p className="text-sm">Email: {purchase.contactEmail}</p>}
                              {purchase.contactPhone && <p className="text-sm">Phone: {purchase.contactPhone}</p>}
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">No contact information provided</p>
                          )}
                        </div>
                        
                        {/* Always show order details section for site-wide admins */}
                        <div className="mt-2">
                          <p className="font-medium">Order Details:</p>
                          {purchase.orderDetails ? (
                            <p className="text-sm">{purchase.orderDetails}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">No additional order details provided</p>
                          )}
                        </div>
                        
                        {/* Tracking Information */}
                        {/* Order References */}
                        <div className="mt-4 border-t pt-4">
                          <p className="font-medium">Order References:</p>
                          
                          <p className="text-sm">
                            Order #: <span className="font-mono">{purchase.orderReference || 'Not yet assigned'}</span>
                          </p>
                          
                          <div className="mt-2">
                            <label className="text-xs text-muted-foreground">Customer Reference</label>
                            <input
                              type="text"
                              className="w-full text-xs border rounded p-1.5 bg-background text-foreground dark:border-gray-700"
                              placeholder="Enter customer reference"
                              defaultValue={purchase.customerReference || ''}
                              id={`customer-reference-${purchase.id}`}
                            />
                            <div className="mt-2">
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={async () => {
                                  try {
                                    const customerReferenceInput = document.getElementById(`customer-reference-${purchase.id}`) as HTMLInputElement;
                                    const customerReference = customerReferenceInput?.value || '';
                                    
                                    await storeService.updatePurchaseStatus(purchase.id, {
                                      status: purchase.status,
                                      customerReference
                                    });
                                    
                                    // Refresh purchases
                                    const updatedPurchases = await storeService.listPurchases();
                                    setPurchases(updatedPurchases);
                                    
                                    toast.success('Customer reference updated');
                                  } catch (error) {
                                    console.error('Error updating customer reference:', error);
                                    toast.error('Failed to update customer reference');
                                  }
                                }}
                              >
                                {t('store.updateReference')}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Tracking Information */}
                        <div className="mt-4 border-t pt-4">
                          <p className="font-medium">Tracking Information:</p>
                          
                          <div className="mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-muted-foreground">Tracking Number</label>
                                <input
                                  type="text"
                                  className="w-full text-xs border rounded p-1.5 bg-background text-foreground dark:border-gray-700"
                                  placeholder="Enter tracking number"
                                  defaultValue={purchase.trackingNumber || ''}
                                  id={`tracking-number-${purchase.id}`}
                                />
                              </div>
                              
                              <div>
                                <label className="text-xs text-muted-foreground">Carrier</label>
                                <select
                                  className="w-full text-xs border rounded p-1.5 bg-background text-foreground dark:border-gray-700"
                                  defaultValue={purchase.carrier || ''}
                                  id={`carrier-${purchase.id}`}
                                >
                                  <option value="">Select carrier</option>
                                  <option value="DHL">DHL</option>
                                  <option value="FedEx">FedEx</option>
                                  <option value="UPS">UPS</option>
                                  <option value="USPS">USPS</option>
                                  <option value="PostNord">PostNord</option>
                                  <option value="Bring">Bring</option>
                                </select>
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={async () => {
                                  try {
                                    const trackingNumberInput = document.getElementById(`tracking-number-${purchase.id}`) as HTMLInputElement;
                                    const carrierSelect = document.getElementById(`carrier-${purchase.id}`) as HTMLSelectElement;
                                    
                                    const trackingNumber = trackingNumberInput?.value || '';
                                    const carrier = carrierSelect?.value || '';
                                    
                                    // Check if the database migration has been applied
                                    try {
                                      await storeService.updatePurchaseStatus(purchase.id, {
                                        status: purchase.status,
                                        trackingNumber,
                                        carrier
                                      });
                                      
                                      // Refresh purchases
                                      const updatedPurchases = await storeService.listPurchases();
                                      setPurchases(updatedPurchases);
                                      
                                      toast.success('Tracking information updated');
                                    } catch (error: any) {
                                      // Check if the error is related to missing columns
                                      if (error.message?.includes('carrier') || error.message?.includes('Could not find')) {
                                        toast.error('Database migration required. Please run the tracking columns migration first.');
                                        console.error('Database migration required:', error);
                                      } else {
                                        console.error('Error updating tracking information:', error);
                                        toast.error('Failed to update tracking information');
                                      }
                                    }
                                  } catch (error) {
                                    console.error('Error updating tracking information:', error);
                                    toast.error('Failed to update tracking information');
                                  }
                                }}
                              >
                                {t('store.updateTracking')}
                              </Button>
                            </div>
                          </div>
                          
                          {purchase.trackingNumber && (
                            <p className="text-sm mt-2">
                              <a
                                href={`https://www.google.com/search?q=${purchase.carrier}+${purchase.trackingNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {t('store.trackPackage')}
                              </a>
                            </p>
                          )}
                          
                          {purchase.shippedDate && (
                            <p className="text-sm mt-1">
                              Shipped on: {new Date(purchase.shippedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        
                        {purchase.notes && <p className="text-sm text-muted-foreground mt-2">Notes: {purchase.notes}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {purchases.length === 0 && (
                <div className="text-center p-8 bg-muted rounded-lg">
                  <p className="text-muted-foreground">{t('store.noPurchasesAll')}</p>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
      
      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] overflow-hidden">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <ProductForm
              onSuccess={handleProductFormSuccess}
              onCancel={handleProductFormCancel}
              initialProduct={productToEdit || undefined}
              isEdit={!!productToEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSection;