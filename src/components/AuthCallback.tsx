import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';

const AuthCallback: React.FC = () => {
  const [message, setMessage] = useState<string>('Processing...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          setMessage(`Error: ${errorDescription || error}`);
          setTimeout(() => window.location.href = '/', 3000);
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setMessage('Failed to complete authentication');
            setTimeout(() => window.location.href = '/', 3000);
            return;
          }

          setMessage('Authentication successful! Redirecting...');
          setTimeout(() => window.location.href = '/', 2000);
        } else {
          setMessage('No authentication tokens found');
          setTimeout(() => window.location.href = '/', 3000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setMessage('An error occurred during authentication');
        setTimeout(() => window.location.href = '/', 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 text-center">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Authentication Complete
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback; 