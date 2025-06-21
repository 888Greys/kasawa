import { useState, useEffect, useCallback } from 'react';
import { OrderService, Order, OrderWithItems, CreateOrderData } from '../services/orderService';
import { useAuth } from './useAuth';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load user's orders
  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userOrders = await OrderService.getOrders();
      setOrders(userOrders);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create new order
  const createOrder = useCallback(async (orderData: CreateOrderData): Promise<Order | null> => {
    if (!user) {
      setError('Please log in to create an order');
      return null;
    }

    try {
      setError(null);
      const order = await OrderService.createOrder(orderData);
      if (order) {
        await loadOrders(); // Reload orders
        return order;
      } else {
        setError('Failed to create order');
        return null;
      }
    } catch (err) {
      setError('Failed to create order');
      console.error('Error creating order:', err);
      return null;
    }
  }, [user, loadOrders]);

  // Get order with items
  const getOrderWithItems = useCallback(async (orderId: string): Promise<OrderWithItems | null> => {
    if (!user) {
      setError('Please log in to view order details');
      return null;
    }

    try {
      setError(null);
      const order = await OrderService.getOrderWithItems(orderId);
      return order;
    } catch (err) {
      setError('Failed to load order details');
      console.error('Error loading order details:', err);
      return null;
    }
  }, [user]);

  // Get order by number
  const getOrderByNumber = useCallback(async (orderNumber: string): Promise<Order | null> => {
    if (!user) {
      setError('Please log in to view order');
      return null;
    }

    try {
      setError(null);
      const order = await OrderService.getOrderByNumber(orderNumber);
      return order;
    } catch (err) {
      setError('Failed to load order');
      console.error('Error loading order:', err);
      return null;
    }
  }, [user]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']): Promise<boolean> => {
    if (!user) {
      setError('Please log in to update order');
      return false;
    }

    try {
      setError(null);
      const success = await OrderService.updateOrderStatus(orderId, status);
      if (success) {
        await loadOrders(); // Reload orders
        return true;
      } else {
        setError('Failed to update order status');
        return false;
      }
    } catch (err) {
      setError('Failed to update order status');
      console.error('Error updating order status:', err);
      return false;
    }
  }, [user, loadOrders]);

  // Cancel order
  const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
    if (!user) {
      setError('Please log in to cancel order');
      return false;
    }

    try {
      setError(null);
      const success = await OrderService.cancelOrder(orderId);
      if (success) {
        await loadOrders(); // Reload orders
        return true;
      } else {
        setError('Failed to cancel order');
        return false;
      }
    } catch (err) {
      setError('Failed to cancel order');
      console.error('Error canceling order:', err);
      return false;
    }
  }, [user, loadOrders]);

  // Get order statistics
  const getOrderStats = useCallback(async () => {
    if (!user) {
      return { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 };
    }

    try {
      setError(null);
      const stats = await OrderService.getOrderStats();
      return stats;
    } catch (err) {
      setError('Failed to load order statistics');
      console.error('Error loading order stats:', err);
      return { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 };
    }
  }, [user]);

  // Get recent orders
  const getRecentOrders = useCallback(async (): Promise<Order[]> => {
    if (!user) {
      return [];
    }

    try {
      setError(null);
      const recentOrders = await OrderService.getRecentOrders();
      return recentOrders;
    } catch (err) {
      setError('Failed to load recent orders');
      console.error('Error loading recent orders:', err);
      return [];
    }
  }, [user]);

  // Load orders when user changes
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    loading,
    error,
    createOrder,
    getOrderWithItems,
    getOrderByNumber,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
    getRecentOrders,
    refreshOrders: loadOrders
  };
}; 