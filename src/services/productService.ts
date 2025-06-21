import { supabase } from '../lib/supabase';
import { Product } from '../types';

export interface SupabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock_quantity: number;
  thc_content: number | null;
  cbd_content: number | null;
  effects: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// Convert Supabase product to app product format
const convertSupabaseProduct = (product: SupabaseProduct): Product => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  category: product.category as 'flower' | 'concentrate' | 'edible' | 'accessory',
  thcContent: product.thc_content || 0,
  cbdContent: product.cbd_content || 0,
  imageUrl: product.images[0] || '',
  images: product.images,
  inStock: product.stock_quantity > 0,
  featured: product.featured || false,
  createdAt: new Date(product.created_at),
});

export const productService = {
  // Fetch all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data?.map(convertSupabaseProduct) || [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  },

  // Fetch products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products by category:', error);
        throw error;
      }

      return data?.map(convertSupabaseProduct) || [];
    } catch (error) {
      console.error('Failed to fetch products by category:', error);
      return [];
    }
  },

  // Fetch featured products
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching featured products:', error);
        throw error;
      }

      return data?.map(convertSupabaseProduct) || [];
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      return [];
    }
  },

  // Fetch product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product by ID:', error);
        throw error;
      }

      return data ? convertSupabaseProduct(data) : null;
    } catch (error) {
      console.error('Failed to fetch product by ID:', error);
      return null;
    }
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }

      return data?.map(convertSupabaseProduct) || [];
    } catch (error) {
      console.error('Failed to search products:', error);
      return [];
    }
  },

  // Get product categories
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .order('category');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      const categories = data?.map(item => item.category) || [];
      return Array.from(new Set(categories)); // Remove duplicates
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },
}; 