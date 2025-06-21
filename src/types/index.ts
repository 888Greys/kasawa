export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'flower' | 'concentrate' | 'edible' | 'accessory';
  thcContent?: number;
  cbdContent?: number;
  imageUrl: string;
  // Optional: Add multiple images for gallery
  images?: string[];
  inStock: boolean;
  featured: boolean;
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: Date;
  customer: User;
} 