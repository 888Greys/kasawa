import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthTest: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Test database connection
      const { data: dbTest, error: dbError } = await supabase
        .from('products')
        .select('id, name')
        .limit(1);

      setAuthStatus({
        user: user,
        userError: userError,
        session: session,
        sessionError: sessionError,
        dbTest: dbTest,
        dbError: dbError,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setAuthStatus({
        error: error,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testOrderCreation = async () => {
    try {
      // Test order creation with minimal data
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          total: 29.99,
          shipping_address: { test: true },
          notes: 'Auth test order'
        })
        .select()
        .single();

      if (error) {
        console.error('Order creation test failed:', error);
        alert(`Order creation failed: ${error.message}`);
      } else {
        console.log('Order creation test succeeded:', order);
        alert(`Order created successfully! ID: ${order.id}`);
      }
    } catch (error) {
      console.error('Order creation test error:', error);
      alert(`Order creation error: ${error}`);
    }
  };

  if (loading) {
    return <div className="p-4">Loading auth status...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Authentication Test</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">User Status:</h4>
          <pre className="bg-white dark:bg-gray-700 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(authStatus?.user, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-medium">Session Status:</h4>
          <pre className="bg-white dark:bg-gray-700 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(authStatus?.session, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-medium">Database Test:</h4>
          <pre className="bg-white dark:bg-gray-700 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(authStatus?.dbTest, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-medium">Errors:</h4>
          <pre className="bg-white dark:bg-gray-700 p-2 rounded text-sm overflow-auto">
            {JSON.stringify({
              userError: authStatus?.userError,
              sessionError: authStatus?.sessionError,
              dbError: authStatus?.dbError
            }, null, 2)}
          </pre>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={checkAuthStatus}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Status
          </button>
          
          <button
            onClick={testOrderCreation}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Order Creation
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthTest; 