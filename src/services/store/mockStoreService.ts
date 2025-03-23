import { Product, Purchase, CreateProductDto, UpdateProductDto, CreatePurchaseDto, UpdatePurchaseStatusDto } from '@/types/store';
import { StoreServiceInterface } from './storeService';
import { getCurrentUser } from '@/services/authService';
import { isValidUUID } from '@/utils/uuidUtils';
import { companyService } from '@/services/company';

// Generate a simple UUID for mock data
const generateMockUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Mock data for development
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Temperature Sensor',
    description: 'High precision temperature sensor with WiFi connectivity',
    price: 299,
    imageUrl: '/placeholder.svg',
    createdAt: new Date().toISOString(),
    createdBy: 'Admin User',
    updatedAt: null
  },
  {
    id: '2',
    name: 'Concrete Sensor',
    description: 'Accurate concrete humidity sensor with long battery life',
    price: 349,
    imageUrl: '/placeholder.svg',
    createdAt: new Date().toISOString(),
    createdBy: 'Admin User',
    updatedAt: null
  },
  {
    id: '3',
    name: 'Combo Sensor Pack',
    description: 'Bundle of temperature and concrete humidity sensors at a discounted price',
    price: 599,
    imageUrl: '/placeholder.svg',
    createdAt: new Date().toISOString(),
    createdBy: 'Admin User',
    updatedAt: null
  }
];

const mockPurchases: Purchase[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Temperature Sensor',
    quantity: 5,
    totalPrice: 1495,
    status: 'sent',
    purchasedAt: new Date().toISOString(),
    purchasedBy: 'John Doe',
    companyId: '1',
    companyName: 'Demo Company',
    shippingAddress: '123 Main St',
    shippingCity: 'Oslo',
    shippingPostalCode: '0123',
    shippingCountry: 'Norway',
    contactEmail: 'john.doe@example.com',
    contactPhone: '+47 12345678',
    orderDetails: 'Please deliver during business hours',
    updatedAt: null,
    notes: 'Priority shipping'
  },
  {
    id: '2',
    productId: '2',
    productName: 'Concrete Sensor',
    quantity: 3,
    totalPrice: 1047,
    status: 'pending',
    purchasedAt: new Date().toISOString(),
    purchasedBy: 'Jane Smith',
    companyId: '2',
    companyName: 'Test Company',
    shippingAddress: '456 Oak Ave',
    shippingCity: 'Bergen',
    shippingPostalCode: '5000',
    shippingCountry: 'Norway',
    contactEmail: 'jane.smith@example.com',
    contactPhone: '+47 87654321',
    orderDetails: null,
    updatedAt: null,
    notes: null
  }
];

// Implementation of the store service using mock data
class MockStoreService implements StoreServiceInterface {
  private products: Product[] = [...mockProducts];
  private purchases: Purchase[] = [...mockPurchases];

  // Product methods
  async listProducts(): Promise<Product[]> {
    return this.products;
  }
  
  async getProduct(id: string): Promise<Product | null> {
    const product = this.products.find(p => p.id === id);
    return product || null;
  }
  
  async createProduct(data: CreateProductDto): Promise<Product> {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'master') {
      throw new Error('Only site-wide admins can create products');
    }
    
    const newProduct: Product = {
      id: generateMockUUID(),
      ...data,
      price: Number(data.price),
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      updatedAt: null
    };
    
    this.products.push(newProduct);
    return newProduct;
  }
  
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product | null> {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'master') {
      throw new Error('Only site-wide admins can update products');
    }
    
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      return null;
    }
    
    const updatedProduct = {
      ...this.products[index],
      ...data,
      price: data.price !== undefined ? Number(data.price) : this.products[index].price
    };
    
    this.products[index] = updatedProduct;
    return updatedProduct;
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'master') {
      throw new Error('Only site-wide admins can delete products');
    }
    
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    
    return this.products.length < initialLength;
  }
  
  // Purchase methods
  async listPurchases(): Promise<Purchase[]> {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'master') {
      throw new Error('Only site-wide admins can list all purchases');
    }
    
    return this.purchases;
  }
  
  async listUserPurchases(): Promise<Purchase[]> {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    return this.purchases.filter(p => p.purchasedBy === currentUser.name);
  }
  
  async getPurchase(id: string): Promise<Purchase | null> {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const purchase = this.purchases.find(p => p.id === id);
    
    if (!purchase) {
      return null;
    }
    
    // Check if the user is authorized to view this purchase
    if (currentUser.role !== 'master' && purchase.purchasedBy !== currentUser.name) {
      throw new Error('Unauthorized to view this purchase');
    }
    
    return purchase;
  }
  
  async createPurchase(data: CreatePurchaseDto): Promise<Purchase> {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Get the product to calculate the total price
    const product = this.products.find(p => p.id === data.productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    const totalPrice = product.price * data.quantity;
    
    // Get company name
    let companyName = 'Unknown Company';
    try {
      const company = await companyService.get(currentUser.companyId);
      companyName = company.name;
    } catch (error) {
      console.error('Error fetching company name:', error);
    }
    
    const newPurchase: Purchase = {
      id: generateMockUUID(),
      productId: data.productId,
      productName: product.name,
      quantity: data.quantity,
      totalPrice,
      status: 'pending',
      purchasedAt: new Date().toISOString(),
      purchasedBy: currentUser.name,
      companyId: currentUser.companyId,
      companyName,
      shippingAddress: data.shippingAddress,
      shippingCity: data.shippingCity,
      shippingPostalCode: data.shippingPostalCode,
      shippingCountry: data.shippingCountry,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      orderDetails: data.orderDetails,
      updatedAt: null,
      notes: null
    };
    
    this.purchases.push(newPurchase);
    return newPurchase;
  }
  
  async updatePurchaseStatus(id: string, data: UpdatePurchaseStatusDto): Promise<Purchase | null> {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'master') {
      throw new Error('Only site-wide admins can update purchase status');
    }
    
    const index = this.purchases.findIndex(p => p.id === id);
    if (index === -1) {
      return null;
    }
    
    const updatedPurchase = {
      ...this.purchases[index],
      status: data.status
    };
    
    this.purchases[index] = updatedPurchase;
    return updatedPurchase;
  }
}

export const mockStoreService: StoreServiceInterface = new MockStoreService();