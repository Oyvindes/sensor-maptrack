import { supabase } from '@/integrations/supabase/client';
import { Product, Purchase, CreateProductDto, UpdateProductDto, CreatePurchaseDto, UpdatePurchaseStatusDto } from '@/types/store';
import { getCurrentUser } from '@/services/authService';

// Interface for the store service
export interface StoreServiceInterface {
  // Product methods
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(data: CreateProductDto): Promise<Product>;
  updateProduct(id: string, data: UpdateProductDto): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Purchase methods
  listPurchases(): Promise<Purchase[]>;
  listUserPurchases(): Promise<Purchase[]>;
  getPurchase(id: string): Promise<Purchase | null>;
  createPurchase(data: CreatePurchaseDto): Promise<Purchase>;
  updatePurchaseStatus(id: string, data: UpdatePurchaseStatusDto): Promise<Purchase | null>;
}

// Implementation of the store service using Supabase
class StoreService implements StoreServiceInterface {
  // Product methods
  async listProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
    
    // Map the data to ensure both image_url and imageUrl are set
    return data.map(product => ({
      ...product,
      imageUrl: product.image_url // Ensure imageUrl is set from image_url
    })) as Product[];
  }
  
  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
    
    // Ensure both image_url and imageUrl are set
    return {
      ...data,
      imageUrl: data.image_url
    } as Product;
  }
  
  async createProduct(data: CreateProductDto): Promise<Product> {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'master') {
      throw new Error('Only site-wide admins can create products');
    }
    
    const newProduct = {
      ...data,
      created_at: new Date().toISOString(),
      created_by: currentUser.name
    };
    
    const { data: createdProduct, error } = await supabase
      .from('products')
      .insert(newProduct)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
    
    // Ensure both image_url and imageUrl are set
    return {
      ...createdProduct,
      imageUrl: createdProduct.image_url
    } as Product;
  }
  
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product | null> {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'master') {
      throw new Error('Only site-wide admins can update products');
    }
    
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
    
    // Ensure both image_url and imageUrl are set
    return {
      ...updatedProduct,
      imageUrl: updatedProduct.image_url
    } as Product;
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'master') {
      throw new Error('Only site-wide admins can delete products');
    }
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
    
    return true;
  }
  
  // Purchase methods
  async listPurchases(): Promise<Purchase[]> {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'master') {
      throw new Error('Only site-wide admins can list all purchases');
    }
    
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        items:purchase_items(
          *,
          product:products(name, pricing_type)
        )
      `)
      .order('purchased_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching purchases:', error);
      throw new Error('Failed to fetch purchases');
    }
    
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
        createdAt: item.created_at,
        pricing_type: item.product?.pricing_type || 'one_time'
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
    })) as Purchase[];
  }
  
  async listUserPurchases(): Promise<Purchase[]> {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    console.log('Current user in listUserPurchases:', currentUser);
    
    // Get all purchases without filtering by purchased_by
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        items:purchase_items(
          *,
          product:products(name, pricing_type)
        )
      `)
      .order('purchased_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user purchases:', error);
      throw new Error('Failed to fetch user purchases');
    }
    
    console.log('All purchases from database:', data);
    
    // Filter purchases client-side to allow for more flexible name matching
    const userPurchases = data.filter(purchase => {
      if (!purchase.purchased_by) {
        console.log('Skipping purchase with no purchased_by:', purchase);
        return false;
      }
      
      // For debugging, show all purchases
      console.log('Purchase:', purchase);
      
      // If the user is a site admin, include all purchases
      if (currentUser.role === 'master') {
        return true;
      }
      
      // For regular admins, try multiple matching strategies
      const purchasedBy = purchase.purchased_by.toLowerCase();
      const userName = currentUser.name.toLowerCase();
      
      console.log(`Comparing: "${purchasedBy}" with "${userName}"`);
      
      // Strategy 1: Exact match
      if (purchasedBy === userName) {
        console.log('Exact match');
        return true;
      }
      
      // Strategy 2: Either contains the other
      if (purchasedBy.includes(userName) || userName.includes(purchasedBy)) {
        console.log('Partial match');
        return true;
      }
      
      // Strategy 3: Match by company ID
      if (purchase.company_id === currentUser.companyId) {
        console.log('Company match');
        return true;
      }
      
      // No match
      return false;
    });
    
    console.log('Filtered user purchases:', userPurchases);
    
    return userPurchases.map(purchase => ({
      id: purchase.id,
      items: purchase.items.map((item: any) => ({
        id: item.id,
        purchaseId: item.purchase_id,
        productId: item.product_id,
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        pricePerUnit: item.price_per_unit,
        totalPrice: item.total_price,
        createdAt: item.created_at,
        pricing_type: item.product?.pricing_type || 'one_time'
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
    })) as Purchase[];
  }
  
  async getPurchase(id: string): Promise<Purchase | null> {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        items:purchase_items(
          *,
          product:products(name)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching purchase:', error);
      throw new Error('Failed to fetch purchase');
    }
    
    // Check if the user is authorized to view this purchase
    if (currentUser.role !== 'master' && data.purchased_by !== currentUser.name) {
      throw new Error('Unauthorized to view this purchase');
    }
    
    return {
      id: data.id,
      items: data.items.map((item: any) => ({
        id: item.id,
        purchaseId: item.purchase_id,
        productId: item.product_id,
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        pricePerUnit: item.price_per_unit,
        totalPrice: item.total_price,
        createdAt: item.created_at
      })),
      itemsTotalPrice: data.items_total_price || 0,
      status: data.status || 'pending',
      purchasedAt: data.purchased_at,
      purchasedBy: data.purchased_by || 'Unknown User',
      companyId: data.company_id,
      companyName: data.company_name || 'Unknown Company',
      shippingAddress: data.shipping_address || '',
      shippingCity: data.shipping_city || '',
      shippingPostalCode: data.shipping_postal_code || '',
      shippingCountry: data.shipping_country || '',
      contactEmail: data.contact_email || '',
      contactPhone: data.contact_phone || '',
      orderDetails: data.order_details || '',
      trackingNumber: data.tracking_number || '',
      carrier: data.carrier || '',
      shippedDate: data.shipping_date,
      notes: data.notes || '',
      customerReference: data.customer_reference || '',
      orderReference: data.order_reference || '',
      // Backward compatibility
      productId: data.items[0]?.product_id,
      productName: data.items[0]?.product?.name,
      quantity: data.items[0]?.quantity,
      totalPrice: data.items_total_price
    } as Purchase;
  }
  
  async createPurchase(data: CreatePurchaseDto): Promise<Purchase> {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Get all products to calculate total prices
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*, pricing_type')
      .in('id', data.items.map(item => item.productId));
    
    if (productsError || !products) {
      console.error('Error fetching products for purchase:', productsError);
      throw new Error('Failed to fetch products for purchase');
    }
    
    // Create a map of product prices
    const productPrices = new Map(products.map(p => [p.id, p.price]));
    
    // Calculate items and total price
    const purchaseItems = data.items.map(item => ({
      product_id: item.productId,
      quantity: item.quantity,
      price_per_unit: productPrices.get(item.productId) || 0,
      total_price: (productPrices.get(item.productId) || 0) * item.quantity
    }));
    
    const totalPrice = purchaseItems.reduce((sum, item) => sum + item.total_price, 0);
    
    // Use the company name provided by the user, or a default if not provided
    const realCompanyName = data.companyName || 'Unknown Company';
    
    // Find a valid company ID
    const { data: anyCompany } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
      .single();
    
    if (!anyCompany) {
      throw new Error('Failed to create purchase: No valid company ID available');
    }
    
    // Create the purchase
    const newPurchase = {
      items_total_price: totalPrice,
      status: 'pending',
      purchased_at: new Date().toISOString(),
      purchased_by: currentUser.name,
      company_id: anyCompany.id,
      company_name: realCompanyName,
      shipping_address: data.shippingAddress,
      shipping_city: data.shippingCity,
      shipping_postal_code: data.shippingPostalCode,
      shipping_country: data.shippingCountry,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      order_details: data.orderDetails,
      customer_reference: data.customerReference
    };
    
    // Start a transaction
    const { data: createdPurchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert(newPurchase)
      .select()
      .single();
    
    if (purchaseError || !createdPurchase) {
      console.error('Error creating purchase:', purchaseError);
      throw new Error('Failed to create purchase');
    }
    
    // Create purchase items
    const purchaseItemsWithId = purchaseItems.map(item => ({
      ...item,
      purchase_id: createdPurchase.id
    }));
    
    const { error: itemsError } = await supabase
      .from('purchase_items')
      .insert(purchaseItemsWithId);
    
    if (itemsError) {
      console.error('Error creating purchase items:', itemsError);
      throw new Error('Failed to create purchase items');
    }
    
    // Fetch the complete purchase with items
    const { data: purchase, error: fetchError } = await supabase
      .from('purchases')
      .select(`
        *,
        items:purchase_items(
          *,
          product:products(name)
        )
      `)
      .eq('id', createdPurchase.id)
      .single();
    
    if (fetchError || !purchase) {
      console.error('Error fetching created purchase:', fetchError);
      throw new Error('Failed to fetch created purchase');
    }
    
    // Map the response to our Purchase type
    return {
      id: purchase.id,
      items: purchase.items.map(item => ({
        id: item.id,
        purchaseId: item.purchase_id,
        productId: item.product_id,
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        pricePerUnit: item.price_per_unit,
        totalPrice: item.total_price,
        createdAt: item.created_at,
        pricing_type: item.product?.pricing_type || 'one_time'
      })),
      itemsTotalPrice: purchase.items_total_price,
      status: purchase.status,
      purchasedAt: purchase.purchased_at,
      purchasedBy: purchase.purchased_by,
      companyId: purchase.company_id,
      companyName: purchase.company_name,
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
    };
  }
  
  async updatePurchaseStatus(id: string, data: UpdatePurchaseStatusDto): Promise<Purchase | null> {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'master') {
      throw new Error('Only site-wide admins can update purchase status');
    }
    
    // Prepare update data
    const updateData: any = { status: data.status };
    
    // Add tracking information if provided
    if (data.trackingNumber) updateData.tracking_number = data.trackingNumber;
    if (data.carrier) updateData.carrier = data.carrier;
    if (data.shippedDate) updateData.shipped_date = data.shippedDate;
    
    // Add customer reference and notes if provided
    if (data.customerReference) updateData.customer_reference = data.customerReference;
    if (data.notes) updateData.notes = data.notes;
    
    // If status is 'sent' and no shipped_date is provided, set it to now
    if (data.status === 'sent' && !data.shippedDate) {
      updateData.shipped_date = new Date().toISOString();
    }
    
    const { data: updatedPurchase, error } = await supabase
      .from('purchases')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        items:purchase_items(
          *,
          product:products(name, pricing_type)
        )
      `)
      .single();
    
    if (error) {
      console.error('Error updating purchase status:', error);
      throw new Error('Failed to update purchase status');
    }
    
   return {
     id: updatedPurchase.id,
     items: updatedPurchase.items.map((item: any) => ({
       id: item.id,
       purchaseId: item.purchase_id,
       productId: item.product_id,
       productName: item.product?.name || 'Unknown Product',
       quantity: item.quantity,
       pricePerUnit: item.price_per_unit,
       totalPrice: item.total_price,
       createdAt: item.created_at
     })),
     itemsTotalPrice: updatedPurchase.items_total_price || 0,
     status: updatedPurchase.status || 'pending',
     purchasedAt: updatedPurchase.purchased_at,
     purchasedBy: updatedPurchase.purchased_by || 'Unknown User',
     companyId: updatedPurchase.company_id,
     companyName: updatedPurchase.company_name || 'Unknown Company',
     shippingAddress: updatedPurchase.shipping_address || '',
     shippingCity: updatedPurchase.shipping_city || '',
     shippingPostalCode: updatedPurchase.shipping_postal_code || '',
     shippingCountry: updatedPurchase.shipping_country || '',
     contactEmail: updatedPurchase.contact_email || '',
     contactPhone: updatedPurchase.contact_phone || '',
     orderDetails: updatedPurchase.order_details || '',
     trackingNumber: updatedPurchase.tracking_number || '',
     carrier: updatedPurchase.carrier || '',
     shippedDate: updatedPurchase.shipped_date,
     notes: updatedPurchase.notes || '',
     customerReference: updatedPurchase.customer_reference || '',
     orderReference: updatedPurchase.order_reference || '',
     // Backward compatibility
     productId: updatedPurchase.items[0]?.product_id,
     productName: updatedPurchase.items[0]?.product?.name,
     quantity: updatedPurchase.items[0]?.quantity,
     totalPrice: updatedPurchase.items_total_price
   };
  }
}

export const storeService: StoreServiceInterface = new StoreService();