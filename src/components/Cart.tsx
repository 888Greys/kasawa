import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import { CartItemWithProduct } from '../services/cartService';
import { CreateOrderData } from '../services/orderService';
import LoadingSpinner from './LoadingSpinner';
import Checkout from './Checkout';

interface CartProps {
  items: CartItemWithProduct[];
  total: number;
  onUpdateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  onRemoveItem: (cartItemId: string) => Promise<boolean>;
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  onCreateOrder?: (orderData: CreateOrderData) => Promise<any>;
}

const Cart: React.FC<CartProps> = ({
  items,
  total,
  onUpdateQuantity,
  onRemoveItem,
  isOpen,
  onClose,
  loading = false,
  error = null,
  onCreateOrder
}) => {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    await onUpdateQuantity(cartItemId, newQuantity);
  };

  const handleRemoveItem = async (cartItemId: string) => {
    await onRemoveItem(cartItemId);
  };

  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  const handleOrderSuccess = () => {
    setShowCheckoutModal(false);
    onClose(); // Close cart after successful order
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
        <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Cart ({items.length} items)
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 m-4 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Cart Items */}
          {!loading && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Add some products to get started
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    {/* Product Image */}
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Footer */}
          {!loading && items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total:
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                {checkoutLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <Checkout
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cartItems={items}
        total={total}
        onOrderSuccess={handleOrderSuccess}
      />
    </>
  );
};

export default Cart; 