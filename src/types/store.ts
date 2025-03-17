// Types for the store functionality

// Interface for the products table
// Database columns: id, name, description, price, image_url, created_at, created_by, updated_at
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;  // maps to image_url in DB
  createdAt: string;  // maps to created_at in DB
  createdBy: string;  // maps to created_by in DB
  updatedAt?: string; // maps to updated_at in DB
}

// Interface for the purchases table
// Database columns: id, product_id, quantity, total_price, status, purchased_at, purchased_by, company_id, company_name,
// shipping_address, shipping_city, shipping_postal_code, shipping_country, contact_email, contact_phone, order_details, updated_at, notes
export interface Purchase {
  id: string;
  productId: string;          // maps to product_id in DB
  productName: string;        // joined from products table
  quantity: number;
  totalPrice: number;         // maps to total_price in DB
  status: PurchaseStatus;
  purchasedAt: string;        // maps to purchased_at in DB
  purchasedBy: string;        // maps to purchased_by in DB
  companyId: string;          // maps to company_id in DB
  companyName: string;        // maps to company_name in DB
  shippingAddress?: string;   // maps to shipping_address in DB
  shippingCity?: string;      // maps to shipping_city in DB
  shippingPostalCode?: string; // maps to shipping_postal_code in DB
  shippingCountry?: string;   // maps to shipping_country in DB
  contactEmail?: string;      // maps to contact_email in DB
  contactPhone?: string;      // maps to contact_phone in DB
  orderDetails?: string;      // maps to order_details in DB
  updatedAt?: string;         // maps to updated_at in DB
  notes?: string;
}

export type PurchaseStatus = 'pending' | 'in_progress' | 'packaging' | 'sent' | 'invoiced' | 'completed';

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

export interface CreatePurchaseDto {
  productId: string;
  quantity: number;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  contactEmail?: string;
  contactPhone?: string;
  orderDetails?: string;
}

export interface UpdatePurchaseStatusDto {
  status: PurchaseStatus;
}