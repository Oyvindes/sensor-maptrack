// Types for the store functionality

// Interface for the products table
// Database columns: id, name, description, price, image_url, created_at, created_by, updated_at
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;  // Using snake_case to match DB column
  imageUrl?: string;   // Keeping for backward compatibility
  createdAt: string;   // maps to created_at in DB
  createdBy: string;   // maps to created_by in DB
  updatedAt?: string;  // maps to updated_at in DB
}

// Interface for the purchases table
// Database columns: id, product_id, quantity, total_price, status, purchased_at, purchased_by, company_id, company_name,
// shipping_address, shipping_city, shipping_postal_code, shipping_country, contact_email, contact_phone, order_details,
// tracking_number, carrier, shipped_date, updated_at, notes, customer_reference, order_reference
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
  trackingNumber?: string;    // maps to tracking_number in DB
  carrier?: string;           // maps to carrier in DB
  shippedDate?: string;       // maps to shipped_date in DB
  updatedAt?: string;         // maps to updated_at in DB
  notes?: string;
  customerReference?: string; // maps to customer_reference in DB
  orderReference?: string;    // maps to order_reference in DB
}

export type PurchaseStatus = 'pending' | 'in_progress' | 'packaging' | 'sent' | 'invoiced' | 'completed';

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  image_url?: string;  // Using snake_case to match DB column
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;  // Using snake_case to match DB column
}

export interface CreatePurchaseDto {
  productId: string;
  quantity: number;
  companyName?: string;     // Added company name field
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  contactEmail?: string;
  contactPhone?: string;
  orderDetails?: string;
  customerReference?: string; // Customer-provided reference for invoicing
}

export interface UpdatePurchaseStatusDto {
  status: PurchaseStatus;
  trackingNumber?: string;
  carrier?: string;
  shippedDate?: string;
  customerReference?: string;
  notes?: string;
}