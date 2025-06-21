import { supabase } from '../lib/supabase';
import { CartItem, Product } from '../types';

export interface CartItemWithProduct extends CartItem {
  id: string; // Add the id field from Supabase cart_items table
  created_at?: string;
  updated_at?: string;
}

export class CartService {
  // Get user's cart items with product details
  static async getCartItems(): Promise<CartItemWithProduct[]> {
    try {
      console.log('CartService.getCartItems: Starting...');
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          created_at,
          updated_at,
          products (
            id,
            name,
            description,
            price,
            images,
            category,
            stock_quantity,
            thc_content,
            cbd_content
          )
        `)
        .order('created_at', { ascending: false });

      console.log('CartService.getCartItems: Supabase response:', { cartItems, error });

      if (error) {
        console.error('Error fetching cart items:', error);
        return [];
      }

      const mappedItems = (cartItems as any[])?.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          ...item.products,
          imageUrl: item.products?.images?.[0] || '', // Use first image as imageUrl
          inStock: (item.products?.stock_quantity || 0) > 0,
          featured: false // Default to false since we don't have this field in DB
        },
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];

      console.log('CartService.getCartItems: Mapped items:', mappedItems);
      return mappedItems;
    } catch (error) {
      console.error('Error in getCartItems:', error);
      return [];
    }
  }

  // Add item to cart
  static async addToCart(productId: string, quantity: number = 1): Promise<boolean> {
    try {
      console.log('CartService.addToCart: Starting with productId:', productId, 'quantity:', quantity);
      
      // Use upsert operation - the database trigger will set user_id automatically
      console.log('CartService.addToCart: Using upsert operation...');
      const { error } = await supabase
        .from('cart_items')
        .upsert({
          product_id: productId,
          quantity: quantity
        }, {
          onConflict: 'user_id,product_id',
          ignoreDuplicates: false
        });

      console.log('CartService.addToCart: Upsert result:', { error });

      if (error) {
        console.error('Error adding item to cart:', error);
        return false;
      }

      console.log('CartService.addToCart: Success!');
      return true;
    } catch (error) {
      console.error('Error in addToCart:', error);
      return false;
    }
  }

  // Update cart item quantity
  static async updateQuantity(cartItemId: string, quantity: number): Promise<boolean> {
    try {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return await this.removeFromCart(cartItemId);
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) {
        console.error('Error updating cart item quantity:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateQuantity:', error);
      return false;
    }
  }

  // Remove item from cart
  static async removeFromCart(cartItemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) {
        console.error('Error removing cart item:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      return false;
    }
  }

  // Clear entire cart
  static async clearCart(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all items

      if (error) {
        console.error('Error clearing cart:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearCart:', error);
      return false;
    }
  }

  // Get cart total
  static async getCartTotal(): Promise<number> {
    try {
      const cartItems = await this.getCartItems();
      return cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);
    } catch (error) {
      console.error('Error in getCartTotal:', error);
      return 0;
    }
  }

  // Get cart item count
  static async getCartItemCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error getting cart item count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getCartItemCount:', error);
      return 0;
    }
  }
} 