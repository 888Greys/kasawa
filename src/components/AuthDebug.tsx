import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const AuthDebug: React.FC = () => {
  const { user } = useAuth();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [customAuthUid, setCustomAuthUid] = useState<string | null>(null);
  const [sessionCheck, setSessionCheck] = useState<any>(null);

  const refreshSession = async () => {
    console.log('Refreshing session...');
    const { data, error } = await supabase.auth.refreshSession();
    console.log('Session refresh result:', { data, error });
    
    if (data.session) {
      setSession(data.session);
      // Test auth.uid() after refresh
      const { data: authTest } = await supabase.rpc('auth_uid');
      setAuthUid(authTest);
      console.log('Auth.uid() after refresh:', authTest);
      
      // Test custom function
      const { data: customAuth } = await supabase.rpc('get_current_user_id');
      setCustomAuthUid(customAuth);
      console.log('Custom auth function result:', customAuth);
      
      // Test session check
      const { data: sessionData } = await supabase.rpc('check_auth_session');
      setSessionCheck(sessionData);
      console.log('Session check result:', sessionData);
    }
  };

  const testCartInsert = async () => {
    console.log('Testing cart insert...');
    try {
      // First, get a real product ID from the products table
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      if (productsError || !products || products.length === 0) {
        console.error('No products found:', productsError);
        return;
      }
      
      const productId = products[0].id;
      console.log('Using product ID for test:', productId);
      
      // Check if this product is already in the user's cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('product_id', productId)
        .eq('user_id', user?.id)
        .single();
      
      if (existingItem) {
        // Update existing item
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id)
          .select();
        
        console.log('Cart update test result:', { data, error });
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user?.id,
            product_id: productId,
            quantity: 1
          })
          .select();
        
        console.log('Cart insert test result:', { data, error });
        
        // Clean up test record
        if (data && data.length > 0) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('id', data[0].id);
          console.log('Test record cleaned up');
        }
      }
    } catch (err) {
      console.error('Cart insert test error:', err);
    }
  };

  const debugCartTable = async () => {
    console.log('=== Debugging Cart Table ===');
    
    // Test 1: Check if we can select from cart_items at all
    console.log('Test 1: Basic select from cart_items');
    const { data: basicSelect, error: basicError } = await supabase
      .from('cart_items')
      .select('*')
      .limit(1);
    console.log('Basic select result:', { data: basicSelect, error: basicError });
    
    // Test 2: Check current user's cart items
    console.log('Test 2: Select user cart items');
    const { data: userCart, error: userCartError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user?.id);
    console.log('User cart result:', { data: userCart, error: userCartError });
    
    // Test 3: Test the custom function directly
    console.log('Test 3: Test custom auth function');
    const { data: customAuth, error: customError } = await supabase.rpc('get_current_user_id');
    console.log('Custom auth result:', { data: customAuth, error: customError });
    
    // Test 4: Try to upsert without user_id (trigger will set it)
    console.log('Test 4: Upsert test without user_id');
    const { data: products } = await supabase.from('products').select('id').limit(1);
    if (products && products.length > 0) {
      const { data: upsertTest, error: upsertError } = await supabase
        .from('cart_items')
        .upsert({
          product_id: products[0].id,
          quantity: 1
        }, {
          onConflict: 'user_id,product_id',
          ignoreDuplicates: false
        })
        .select();
      console.log('Upsert test result:', { data: upsertTest, error: upsertError });
      
      // Log detailed error information
      if (upsertError) {
        console.error('Detailed upsert error:', {
          message: upsertError.message,
          details: upsertError.details,
          hint: upsertError.hint,
          code: upsertError.code
        });
      }
      
      // Clean up
      if (upsertTest && upsertTest.length > 0) {
        await supabase.from('cart_items').delete().eq('id', upsertTest[0].id);
        console.log('Test upsert cleaned up');
      }
    }
    
    // Test 5: Simple insert test without user_id (trigger will set it)
    console.log('Test 5: Simple insert test without user_id');
    if (products && products.length > 0) {
      const { data: insertTest, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          product_id: products[0].id,
          quantity: 1
        })
        .select();
      console.log('Simple insert test result:', { data: insertTest, error: insertError });
      
      if (insertError) {
        console.error('Detailed insert error:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
      }
      
      // Clean up
      if (insertTest && insertTest.length > 0) {
        await supabase.from('cart_items').delete().eq('id', insertTest[0].id);
        console.log('Test insert cleaned up');
      }
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Get current Supabase user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setSupabaseUser(currentUser);

      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      // Test auth.uid() function
      const { data, error } = await supabase
        .from('cart_items')
        .select('user_id')
        .limit(1);

      console.log('Auth debug - Supabase user:', currentUser);
      console.log('Auth debug - React user:', user);
      console.log('Auth debug - Session:', currentSession);
      console.log('Auth debug - Test query result:', { data, error });

      // Try to get auth.uid() directly
      const { data: authTest } = await supabase.rpc('auth_uid');
      setAuthUid(authTest);
      console.log('Auth debug - auth.uid() result:', authTest);
      
      // Test custom function
      const { data: customAuth } = await supabase.rpc('get_current_user_id');
      setCustomAuthUid(customAuth);
      console.log('Auth debug - custom auth function result:', customAuth);
      
      // Test session check
      const { data: sessionData } = await supabase.rpc('check_auth_session');
      setSessionCheck(sessionData);
      console.log('Auth debug - session check result:', sessionData);
    };

    checkAuth();
  }, [user]);

  return (
    <div className="fixed top-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs max-w-sm z-50">
      <h3 className="font-semibold mb-2">Auth Debug</h3>
      <div className="space-y-1 mb-3">
        <div>
          <strong>React User ID:</strong> {user?.id || 'null'}
        </div>
        <div>
          <strong>Supabase User ID:</strong> {supabaseUser?.id || 'null'}
        </div>
        <div>
          <strong>auth.uid():</strong> {authUid || 'null'}
        </div>
        <div>
          <strong>Custom auth.uid():</strong> {customAuthUid || 'null'}
        </div>
        <div>
          <strong>Authenticated:</strong> {user ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Session:</strong> {session ? 'Active' : 'None'}
        </div>
        {sessionCheck && (
          <div>
            <strong>Session Check:</strong> {JSON.stringify(sessionCheck)}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <button
          onClick={refreshSession}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded"
        >
          Refresh Session
        </button>
        <button
          onClick={testCartInsert}
          className="w-full bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded"
        >
          Test Cart Insert
        </button>
        <button
          onClick={debugCartTable}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white text-xs py-1 px-2 rounded"
        >
          Debug Cart Table
        </button>
      </div>
    </div>
  );
};

export default AuthDebug; 