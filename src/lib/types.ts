export type Category = 'Cleanse' | 'Treat' | 'Hydrate' | 'Protect';
export const CATEGORIES: Category[] = ['Cleanse', 'Treat', 'Hydrate', 'Protect'];

export type ProductStatus = 'active' | 'draft';

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  descriptor: string;
  category: Category;
  price: number;
  size: string;
  image: string;
  stock: number;
  lowStockThreshold: number;
  shortDescription: string;
  description: string;
  keyIngredients: string[];
  howToUse: string;
  skinTypes: string;
  transparencyNote?: string;
  status: ProductStatus;
  featured: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>;

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  descriptor: string;
  image: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'Demo — received';
}

export type StockState = 'in' | 'low' | 'out';

export function stockState(p: Pick<Product, 'stock' | 'lowStockThreshold'>): StockState {
  if (p.stock <= 0) return 'out';
  if (p.stock <= p.lowStockThreshold) return 'low';
  return 'in';
}
