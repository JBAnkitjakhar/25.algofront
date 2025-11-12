// src/app/auth/callback/page.tsx
'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess, setError, setLoading } from '@/store/slices/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/auth/authService';
import { ROUTES } from '@/constants';
// import { cookieManager } from '@/lib/utils';
import toast from 'react-hot-toast';
import { cookieManager } from '@/lib/utils/auth';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { handleAuthCallback } = useAuth();
  
  // Use ref to prevent multiple executions
  const hasProcessed = useRef(false);
  const isProcessing = useRef(false);

  useEffect(() => {
    // Prevent multiple executions and infinite loops
    if (hasProcessed.current || isProcessing.current) {
      return;
    }

    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    // If no token and no error, this might be an invalid callback
    if (!token && !error) {
      // console.log('No token or error in callback, redirecting to login');
      router.replace(ROUTES.LOGIN);
      return;
    }

    isProcessing.current = true;
    
    const processCallback = async () => {
      try {
        dispatch(setLoading(true));
        
        // Extract token and user info from URL
        const result = handleAuthCallback(searchParams);
        
        if (!result.success) {
          console.error('Callback failed:', result.error);
          hasProcessed.current = true;
          router.replace(`${ROUTES.LOGIN}?error=callback_failed&message=${encodeURIComponent(result.error || 'Authentication failed')}`);
          return;
        }

        if (!result.token) {
          console.error('No token received');
          hasProcessed.current = true;
          router.replace(`${ROUTES.LOGIN}?error=missing_token&message=Authentication token not received`);
          return;
        }

        // console.log('Token received, setting up authentication...');
        
        // Store token in cookies before API call using centralized cookie manager
        cookieManager.setToken(result.token);

        // Get user info using the token
        // console.log('Fetching user info...');
        const userResponse = await authService.getCurrentUser();
        
        // console.log('User response received:', userResponse);
        
        if (!userResponse.success || !userResponse.data) {
          const errorMessage = userResponse.message || 'Failed to get user information';
          console.error('Failed to get user info:', errorMessage);
          toast.error('Failed to get user information');
          hasProcessed.current = true;
          router.replace(`${ROUTES.LOGIN}?error=user_fetch_failed&message=${encodeURIComponent(errorMessage)}`);
          return;
        }

        // Store auth data in Redux and cookies using centralized utilities
        dispatch(loginSuccess({
          user: userResponse.data,
          token: result.token,
          refreshToken: result.token, // Backend should provide separate refresh token
        }));

        // console.log('Login successful, redirecting...');
        toast.success(`Welcome back, ${userResponse.data.name}!`);

        // Mark as processed
        hasProcessed.current = true;

        // Redirect based on user role using centralized role utilities
        const isUserAdmin = userResponse.data.role === 'SUPERADMIN' || userResponse.data.role === 'ADMIN';
        const redirectPath = isUserAdmin ? ROUTES.ADMIN : ROUTES.ME;
          
        // Use replace to prevent back navigation issues
        router.replace(redirectPath);

      } catch (error) {
        console.error('Callback processing error:', error);
        hasProcessed.current = true;
        dispatch(setError('Authentication failed'));
        toast.error('Authentication failed. Please try again.');
        router.replace(`${ROUTES.LOGIN}?error=processing_failed&message=Failed to process authentication`);
      } finally {
        dispatch(setLoading(false));
        isProcessing.current = false;
      }
    };

    processCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - we only want this to run once on mount

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing Authentication
        </h2>
        <p className="text-gray-600">
          Please wait while we securely log you in...
        </p>
        
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}