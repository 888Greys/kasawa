import { useState, useEffect, useCallback } from 'react';
import { CartService, CartItemWithProduct } from '../services/cartService';
import { useAuth } from './useAuth';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load cart items from Supabase
  const loadCartItems = useCallback(async () => {
    console.log('Loading cart items, user:', user?.id);
    
    if (!user) {
      console.log('No user found, clearing cart');
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching cart items from Supabase...');
      const items = await CartService.getCartItems();
      console.log('Cart items fetched:', items);
      setCartItems(items);
    } catch (err) {
      console.error('Error loading cart items:', err);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    console.log('Adding to cart:', { productId, quantity, userId: user?.id });
    
    if (!user) {
      console.log('No user logged in, cannot add to cart');
      setError('Please log in to add items to cart');
      return false;
    }

    try {
      setError(null);
      console.log('Calling CartService.addToCart...');
      const success = await CartService.addToCart(productId, quantity);
      console.log('CartService.addToCart result:', success);
      
      if (success) {
        console.log('Successfully added to cart, reloading cart items...');
        await loadCartItems(); // Reload cart items
        return true;
      } else {
        console.log('Failed to add item to cart');
        setError('Failed to add item to cart');
        return false;
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart');
      return false;
    }
  }, [user, loadCartItems]);

  // Update item quantity
  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    console.log('Updating quantity:', { cartItemId, quantity });
    
    if (!user) {
      setError('Please log in to update cart');
      return false;
    }

    try {
      setError(null);
      const success = await CartService.updateQuantity(cartItemId, quantity);
      if (success) {
        await loadCartItems(); // Reload cart items
        return true;
      } else {
        setError('Failed to update quantity');
        return false;
      }
    } catch (err) {
      setError('Failed to update quantity');
      console.error('Error updating quantity:', err);
      return false;
    }
  }, [user, loadCartItems]);

  // Remove item from cart
  const removeFromCart = useCallback(async (cartItemId: string) => {
    console.log('Removing from cart:', cartItemId);
    
    if (!user) {
      setError('Please log in to remove items from cart');
      return false;
    }

    try {
      setError(null);
      const success = await CartService.removeFromCart(cartItemId);
      if (success) {
        await loadCartItems(); // Reload cart items
        return true;
      } else {
        setError('Failed to remove item from cart');
        return false;
      }
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error('Error removing from cart:', err);
      return false;
    }
  }, [user, loadCartItems]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!user) {
      setError('Please log in to clear cart');
      return false;
    }

    try {
      setError(null);
      const success = await CartService.clearCart();
      if (success) {
        setCartItems([]);
        return true;
      } else {
        setError('Failed to clear cart');
        return false;
      }
    } catch (err) {
      setError('Failed to clear cart');
      console.error('Error clearing cart:', err);
      return false;
    }
  }, [user]);

  // Get cart total
  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }, [cartItems]);

  // Get cart item count
  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Load cart items when user changes
  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  return {
    cartItems,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    refreshCart: loadCartItems
  };
}; 