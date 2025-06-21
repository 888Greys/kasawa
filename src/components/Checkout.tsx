import React, { useState } from 'react';
import { X, CreditCard, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { CartItemWithProduct } from '../services/cartService';
import { OrderService, CreateOrderData } from '../services/orderService';
import LoadingSpinner from './LoadingSpinner';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItemWithProduct[];
  total: number;
  onOrderSuccess: () => void;
}

interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const Checkout: React.FC<CheckoutProps> = ({
  isOpen,
  onClose,
  cartItems,
  total,
  onOrderSuccess
}) => {
  const [step, setStep] = useState<'shipping' | 'payment' | 'review' | 'success'>('shipping');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  
  const [billingAddress, setBillingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [notes, setNotes] = useState('');

  const handleAddressChange = (address: 'shipping' | 'billing', field: keyof Address, value: string) => {
    if (address === 'shipping') {
      setShippingAddress(prev => ({ ...prev, [field]: value }));
      if (useSameAddress) {
        setBillingAddress(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNext = () => {
    if (step === 'shipping') {
      setStep('payment');
    } else if (step === 'payment') {
      setStep('review');
    }
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('shipping');
    } else if (step === 'review') {
      setStep('payment');
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const orderData: CreateOrderData = {
        cartItems,
        shipping_address: shippingAddress,
        billing_address: useSameAddress ? shippingAddress : billingAddress,
        payment_method: paymentMethod,
        notes
      };

      const order = await OrderService.createOrder(orderData);
      
      if (order) {
        setStep('success');
        onOrderSuccess();
      } else {
        setError('Failed to create order. Please try again.');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError(`An error occurred while placing your order: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateShipping = () => {
    return total > 100 ? 0 : 10; // Free shipping over $100
  };

  const calculateTax = () => {
    return total * 0.08; // 8% tax rate
  };

  const finalTotal = total + calculateShipping() + calculateTax();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step === 'shipping' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === 'shipping' ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Shipping</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step === 'payment' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === 'payment' ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Payment</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step === 'review' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === 'review' ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {step === 'shipping' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.firstName}
                    onChange={(e) => handleAddressChange('shipping', 'firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.lastName}
                    onChange={(e) => handleAddressChange('shipping', 'lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => handleAddressChange('shipping', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => handleAddressChange('shipping', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  value={shippingAddress.address}
                  onChange={(e) => handleAddressChange('shipping', 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => handleAddressChange('shipping', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => handleAddressChange('shipping', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.zipCode}
                    onChange={(e) => handleAddressChange('shipping', 'zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="same-address"
                  checked={useSameAddress}
                  onChange={(e) => setUseSameAddress(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="same-address" className="text-sm text-gray-700 dark:text-gray-300">
                  Use same address for billing
                </label>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Method</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <input
                    type="radio"
                    id="credit-card"
                    name="payment"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <label htmlFor="credit-card" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Credit Card
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <input
                    type="radio"
                    id="paypal"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <label htmlFor="paypal" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    PayPal
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Review</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order Summary</h4>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Shipping Address</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                    <p>{shippingAddress.country}</p>
                    <p>{shippingAddress.email}</p>
                    <p>{shippingAddress.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order Notes</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or notes..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-900 dark:text-white">
                      {calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="text-gray-900 dark:text-white">${calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Order Placed Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Thank you for your order. You will receive a confirmation email shortly.
              </p>
              <button
                onClick={onClose}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleBack}
              disabled={step === 'shipping'}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Total: ${finalTotal.toFixed(2)}
              </span>
              
              {step === 'review' ? (
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Place Order</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout; 