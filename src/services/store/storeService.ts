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
      ...purchase,
      productName: purchase.products.name
    })) as Purchase[];
  }
  
  async listUserPurchases(): Promise<Purchase[]> {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('purchases')
      .select('*, products(name)')
      .eq('purchased_by', currentUser.name)
      .order('purchased_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user purchases:', error);
      throw new Error('Failed to fetch user purchases');
    }
    
    return data.map(purchase => ({
      ...purchase,
      productName: purchase.products.name
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
      ...data,
      productName: data.products.name
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
      order_details: data.orderDetails
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
      ...createdPurchase,
      productName: product.name
    } as Purchase;
  }
  
  async updatePurchaseStatus(id: string, data: UpdatePurchaseStatusDto): Promise<Purchase | null> {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'master') {
      throw new Error('Only site-wide admins can update purchase status');
    }
    
    const { data: updatedPurchase, error } = await supabase
      .from('purchases')
      .update({ status: data.status })
      .eq('id', id)
      .select('*, products(name)')
      .single();
    
    if (error) {
      console.error('Error updating purchase status:', error);
      throw new Error('Failed to update purchase status');
    }
    
    return {
      ...updatedPurchase,
      productName: updatedPurchase.products.name
    } as Purchase;
  }
}

export const storeService: StoreServiceInterface = new StoreService();