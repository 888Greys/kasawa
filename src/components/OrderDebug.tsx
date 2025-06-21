import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { OrderService } from '../services/orderService';

const OrderDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebugTest = async () => {
    setLoading(true);
    const info: any = {};

    try {
      // Test 1: Check authentication
      console.log('=== Testing Authentication ===');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      info.authentication = { user, userError };
      console.log('User:', user);
      console.log('User error:', userError);

      // Test 2: Check database connection
      console.log('=== Testing Database Connection ===');
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price')
        .limit(3);
      info.database = { products, productsError };
      console.log('Products:', products);
      console.log('Products error:', productsError);

      // Test 3: Check table structure
      console.log('=== Testing Table Structure ===');
      const { data: ordersStructure, error: ordersStructureError } = await supabase
        .from('orders')
        .select('*')
        .limit(0);
      info.ordersStructure = { columns: ordersStructure, error: ordersStructureError };
      console.log('Orders structure:', ordersStructure);

      // Test 4: Test direct order insertion
      console.log('=== Testing Direct Order Insertion ===');
      const testOrderData = {
        total: 29.99,
        shipping_address: {
          firstName: 'Test',
          lastName: 'User',
          address: '123 Test St',
          city: 'Test City',
          state: 'CA',
          zipCode: '12345'
        },
        billing_address: {
          firstName: 'Test',
          lastName: 'User',
          address: '123 Test St',
          city: 'Test City',
          state: 'CA',
          zipCode: '12345'
        },
        payment_method: 'credit_card',
        notes: 'Debug test order'
      };

      const { data: directOrder, error: directOrderError } = await supabase
        .from('orders')
        .insert(testOrderData)
        .select()
        .single();
      
      info.directOrder = { order: directOrder, error: directOrderError };
      console.log('Direct order result:', directOrder);
      console.log('Direct order error:', directOrderError);

      // Test 5: Test OrderService
      console.log('=== Testing OrderService ===');
      const mockCartItems = [
        {
          id: 'test-cart-item',
          user_id: user?.id || 'test-user',
          product_id: products?.[0]?.id || 'test-product',
          quantity: 1,
          product: {
            id: products?.[0]?.id || 'test-product',
            name: products?.[0]?.name || 'Test Product',
            description: 'Test product description',
            price: products?.[0]?.price || 29.99,
            category: 'flower' as const,
            imageUrl: 'test-image.jpg',
            inStock: true,
            featured: false,
            createdAt: new Date()
          }
        }
      ];

      const orderServiceResult = await OrderService.createOrder({
        cartItems: mockCartItems,
        shipping_address: testOrderData.shipping_address,
        billing_address: testOrderData.billing_address,
        payment_method: testOrderData.payment_method,
        notes: 'OrderService test'
      });

      info.orderService = { result: orderServiceResult };
      console.log('OrderService result:', orderServiceResult);

      // Test 6: Check RLS policies
      console.log('=== Testing RLS Policies ===');
      const { data: rlsTest, error: rlsError } = await supabase
        .rpc('get_current_user_id');
      info.rls = { currentUserId: rlsTest, error: rlsError };
      console.log('RLS test:', rlsTest);
      console.log('RLS error:', rlsError);

    } catch (error) {
      console.error('Debug test error:', error);
      info.error = error;
    } finally {
      setLoading(false);
      setDebugInfo(info);
    }
  };

  const cleanTestData = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('notes', 'Debug test order');
      
      if (error) {
        console.error('Cleanup error:', error);
        alert('Cleanup failed: ' + error.message);
      } else {
        alert('Test data cleaned up successfully');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      alert('Cleanup failed: ' + error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Order Creation Debug</h2>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={runDebugTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Debug Tests'}
        </button>
        
        <button
          onClick={cleanTestData}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clean Test Data
        </button>
      </div>

      {debugInfo && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Debug Results:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded">
              <h4 className="font-medium mb-2">Authentication</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugInfo.authentication, null, 2)}
              </pre>
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded">
              <h4 className="font-medium mb-2">Database Connection</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugInfo.database, null, 2)}
              </pre>
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded">
              <h4 className="font-medium mb-2">Direct Order Insertion</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugInfo.directOrder, null, 2)}
              </pre>
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded">
              <h4 className="font-medium mb-2">OrderService Test</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugInfo.orderService, null, 2)}
              </pre>
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded">
              <h4 className="font-medium mb-2">RLS Test</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugInfo.rls, null, 2)}
              </pre>
            </div>

            {debugInfo.error && (
              <div className="bg-red-100 dark:bg-red-900 p-4 rounded">
                <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">Error</h4>
                <pre className="text-sm overflow-auto text-red-700 dark:text-red-300">
                  {JSON.stringify(debugInfo.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDebug; 