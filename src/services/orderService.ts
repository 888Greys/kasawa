import { supabase } from '../lib/supabase';
import { CartItemWithProduct } from './cartService';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number; // Fixed to match database schema
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shipping_address: any; // Changed to any to handle JSONB
  created_at: string;
  updated_at: string;
  // Additional fields from enhanced schema
  billing_address?: any;
  payment_method?: string;
  payment_status?: string;
  notes?: string;
  tracking_number?: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface CreateOrderData {
  cartItems: CartItemWithProduct[];
  shipping_address?: any;
  billing_address?: any;
  payment_method?: string;
  notes?: string;
}

export class OrderService {
  // Create a new order from cart items
  static async createOrder(orderData: CreateOrderData): Promise<Order | null> {
    try {
      const { cartItems, shipping_address, billing_address, payment_method, notes } = orderData;
      
      // Calculate total
      const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        return null;
      }

      // Prepare order data
      const orderInsertData: any = {
        total,
        shipping_address,
        billing_address,
        payment_method,
        notes
      };

      // Add user_id if available
      if (user) {
        orderInsertData.user_id = user.id;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderInsertData)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return null;
      }

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Clean up the order if items creation failed
        await supabase.from('orders').delete().eq('id', order.id);
        return null;
      }

      return order as Order;
    } catch (error) {
      console.error('Error in createOrder:', error);
      return null;
    }
  }

  // Get user's orders
  static async getOrders(): Promise<Order[]> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return orders as Order[] || [];
    } catch (error) {
      console.error('Error in getOrders:', error);
      return [];
    }
  }

  // Get order with items
  static async getOrderWithItems(orderId: string): Promise<OrderWithItems | null> {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        return null;
      }

      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        return null;
      }

      return {
        ...order,
        order_items: orderItems || []
      } as OrderWithItems;
    } catch (error) {
      console.error('Error in getOrderWithItems:', error);
      return null;
    }
  }

  // Get order by order number
  static async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (error) {
        console.error('Error fetching order by number:', error);
        return null;
      }

      return order as Order;
    } catch (error) {
      console.error('Error in getOrderByNumber:', error);
      return null;
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return false;
    }
  }

  // Cancel order
  static async cancelOrder(orderId: string): Promise<boolean> {
    return await this.updateOrderStatus(orderId, 'cancelled');
  }

  // Get order statistics
  static async getOrderStats(): Promise<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
  }> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total, status');

      if (error) {
        console.error('Error fetching order stats:', error);
        return { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 };
      }

      const completedOrders = orders?.filter(order => order.status !== 'cancelled') || [];
      const totalOrders = completedOrders.length;
      const totalSpent = completedOrders.reduce((sum, order) => sum + order.total, 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      return {
        totalOrders,
        totalSpent,
        averageOrderValue
      };
    } catch (error) {
      console.error('Error in getOrderStats:', error);
      return { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 };
    }
  }

  // Get recent orders (last 5)
  static async getRecentOrders(): Promise<Order[]> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent orders:', error);
        return [];
      }

      return orders as Order[] || [];
    } catch (error) {
      console.error('Error in getRecentOrders:', error);
      return [];
    }
  }
} 