// src/app/auth/callback/page.tsx - Minimal Clean Design
'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess, setError, setLoading } from '@/store/slices/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/auth/authService';
import { ROUTES } from '@/constants';
import toast from 'react-hot-toast';
import { cookieManager } from '@/lib/utils/auth';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { handleAuthCallback } = useAuth();
  
  const hasProcessed = useRef(false);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (hasProcessed.current || isProcessing.current) {
      return;
    }

    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    if (!token && !error) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    isProcessing.current = true;
    
    const processCallback = async () => {
      try {
        dispatch(setLoading(true));
        
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
        
        cookieManager.setToken(result.token);

        const userResponse = await authService.getCurrentUser();
        
        if (!userResponse.success || !userResponse.data) {
          const errorMessage = userResponse.message || 'Failed to get user information';
          console.error('Failed to get user info:', errorMessage);
          toast.error('Failed to get user information');
          hasProcessed.current = true;
          router.replace(`${ROUTES.LOGIN}?error=user_fetch_failed&message=${encodeURIComponent(errorMessage)}`);
          return;
        }

        dispatch(loginSuccess({
          user: userResponse.data,
          token: result.token,
          refreshToken: result.token,
        }));

        toast.success(`Welcome back, ${userResponse.data.name}!`);

        hasProcessed.current = true;

        const isUserAdmin = userResponse.data.role === 'SUPERADMIN' || userResponse.data.role === 'ADMIN';
        const redirectPath = isUserAdmin ? ROUTES.ADMIN : ROUTES.ME;
          
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
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-400">
      <div className="flex flex-col items-center space-y-8">
        
        {/* Logo */}
        <div 
          className="logo-container"
          style={{ perspective: '1000px' }}
        >
          <div className="logo-rotate">
            <Image 
              src="/logo.jpg" 
              alt="AlgoArena" 
              width={80}
              height={80}
              className="rounded-2xl object-cover"
              priority
            />
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        {/* Text */}
        <p className="text-gray-700 text-lg font-medium">
          Just a sec...
        </p>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes rotate3d {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        .logo-rotate {
          animation: rotate3d 5s linear infinite;
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}

// Loading Fallback
function CallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <CallbackHandler />
    </Suspense>
  );
}