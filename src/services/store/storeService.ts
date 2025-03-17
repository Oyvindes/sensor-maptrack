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
    
    return data as Product[];
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
    
    return data as Product;
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
    
    return createdProduct as Product;
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
    
    return updatedProduct as Product;
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
      .select('*, products(name)')
      .order('purchased_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching purchases:', error);
      throw new Error('Failed to fetch purchases');
    }
    
    return data.map(purchase => ({
      id: purchase.id,
      productId: purchase.product_id,
      productName: purchase.products?.name || 'Unknown Product',
      quantity: purchase.quantity || 0,
      totalPrice: purchase.total_price || 0,
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
      orderReference: purchase.order_reference || ''
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
      .select('*, products(name)')
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
      productId: purchase.product_id,
      productName: purchase.products?.name || 'Unknown Product',
      quantity: purchase.quantity || 0,
      totalPrice: purchase.total_price || 0,
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
      orderReference: purchase.order_reference || ''
    })) as Purchase[];
  }
  
  async getPurchase(id: string): Promise<Purchase | null> {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('purchases')
      .select('*, products(name)')
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
      productId: data.product_id,
      productName: data.products?.name || 'Unknown Product',
      quantity: data.quantity || 0,
      totalPrice: data.total_price || 0,
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
      shippedDate: data.shipped_date,
      notes: data.notes || '',
      customerReference: data.customer_reference || '',
      orderReference: data.order_reference || ''
    } as Purchase;
  }
  
  async createPurchase(data: CreatePurchaseDto): Promise<Purchase> {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Get the product to calculate the total price
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', data.productId)
      .single();
    
    if (productError) {
      console.error('Error fetching product for purchase:', productError);
      throw new Error('Failed to fetch product for purchase');
    }
    
    // Get the company name
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', currentUser.companyId)
      .single();
    
    if (companyError) {
      console.error('Error fetching company for purchase:', companyError);
      throw new Error('Failed to fetch company for purchase');
    }
    
    const totalPrice = product.price * data.quantity;
    
    const newPurchase = {
      product_id: data.productId,
      quantity: data.quantity,
      total_price: totalPrice,
      status: 'pending',
      purchased_at: new Date().toISOString(),
      purchased_by: currentUser.name,
      company_id: currentUser.companyId,
      company_name: company.name,
      shipping_address: data.shippingAddress,
      shipping_city: data.shippingCity,
      shipping_postal_code: data.shippingPostalCode,
      shipping_country: data.shippingCountry,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      order_details: data.orderDetails,
      customer_reference: data.customerReference
      // Note: order_reference will be auto-generated by the database trigger
    };
    
    const { data: createdPurchase, error } = await supabase
      .from('purchases')
      .insert(newPurchase)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating purchase:', error);
      throw new Error('Failed to create purchase');
    }
    
    return {
      id: createdPurchase.id,
      productId: createdPurchase.product_id,
      productName: product.name || 'Unknown Product',
      quantity: createdPurchase.quantity || 0,
      totalPrice: createdPurchase.total_price || 0,
      status: createdPurchase.status || 'pending',
      purchasedAt: createdPurchase.purchased_at,
      purchasedBy: createdPurchase.purchased_by || 'Unknown User',
      companyId: createdPurchase.company_id,
      companyName: createdPurchase.company_name || 'Unknown Company',
      shippingAddress: createdPurchase.shipping_address || '',
      shippingCity: createdPurchase.shipping_city || '',
      shippingPostalCode: createdPurchase.shipping_postal_code || '',
      shippingCountry: createdPurchase.shipping_country || '',
      contactEmail: createdPurchase.contact_email || '',
      contactPhone: createdPurchase.contact_phone || '',
      orderDetails: createdPurchase.order_details || '',
      trackingNumber: createdPurchase.tracking_number || '',
      carrier: createdPurchase.carrier || '',
      shippedDate: createdPurchase.shipped_date,
      notes: createdPurchase.notes || '',
      customerReference: createdPurchase.customer_reference || '',
      orderReference: createdPurchase.order_reference || ''
    } as Purchase;
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
      .select('*, products(name)')
      .single();
    
    if (error) {
      console.error('Error updating purchase status:', error);
      throw new Error('Failed to update purchase status');
    }
    
    return {
      id: updatedPurchase.id,
      productId: updatedPurchase.product_id,
      productName: updatedPurchase.products?.name || 'Unknown Product',
      quantity: updatedPurchase.quantity || 0,
      totalPrice: updatedPurchase.total_price || 0,
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
      orderReference: updatedPurchase.order_reference || ''
    } as Purchase;
  }
}

export const storeService: StoreServiceInterface = new StoreService();