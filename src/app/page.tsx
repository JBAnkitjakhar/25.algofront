// src/app/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect authenticated users to appropriate me page
      const redirectPath = user.role === 'ADMIN' || user.role === 'SUPERADMIN' 
        ? ROUTES.ADMIN 
        : ROUTES.ME;
      router.push(redirectPath);
    } else {
      // Redirect unauthenticated users to login
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, user, router]);

  // Show loading while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading AlgoArena...</p>
      </div>
    </div>
  );
}