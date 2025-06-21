import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, X } from 'lucide-react';
import { Order, OrderService, OrderWithItems } from '../services/orderService';
import LoadingSpinner from './LoadingSpinner';

interface OrdersProps {
  isOpen: boolean;
  onClose: () => void;
}

const Orders: React.FC<OrdersProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const userOrders = await OrderService.getOrders();
      setOrders(userOrders);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const orderWithItems = await OrderService.getOrderWithItems(orderId);
      if (orderWithItems) {
        setSelectedOrder(orderWithItems);
        setShowOrderDetails(true);
      }
    } catch (err) {
      console.error('Error loading order details:', err);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={loadOrders}
                className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No orders yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Start shopping to see your order history here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Order #{order.order_number || order.id.slice(0, 8)}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </div>
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Placed on {formatDate(order.created_at)}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Total: ${order.total.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewOrder(order.id)}
                      className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Order Details
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Order Information</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p><span className="font-medium">Order #:</span> {selectedOrder.order_number || selectedOrder.id.slice(0, 8)}</p>
                      <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.created_at)}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(selectedOrder.status)}
                            <span className="capitalize">{selectedOrder.status}</span>
                          </div>
                        </span>
                      </p>
                      <p><span className="font-medium">Total:</span> ${selectedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Shipping Address</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedOrder.shipping_address ? (
                        (() => {
                          try {
                            const address = JSON.parse(selectedOrder.shipping_address);
                            return (
                              <>
                                <p>{address.firstName} {address.lastName}</p>
                                <p>{address.address}</p>
                                <p>{address.city}, {address.state} {address.zipCode}</p>
                                <p>{address.country}</p>
                                <p>{address.email}</p>
                                <p>{address.phone}</p>
                              </>
                            );
                          } catch {
                            return <p>{selectedOrder.shipping_address}</p>;
                          }
                        })()
                      ) : (
                        <p>No shipping address provided</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Product ID: {item.product_id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity} × ${item.price_at_purchase.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ${(item.price_at_purchase * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 