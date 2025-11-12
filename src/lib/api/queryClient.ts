// src/lib/api/queryClient.ts - SIMPLIFIED FOR ALWAYS FRESH DATA

import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // SIMPLIFIED STRATEGY: Always fetch fresh data like /me page
      staleTime: 0, // Always consider data stale
      gcTime: 1 * 60 * 1000, // Keep in cache for only 1 minute
      
      // ALWAYS FRESH DATA STRATEGY
      refetchOnMount: true, // Always refetch when component mounts
      refetchOnWindowFocus: true, // Always refetch when user returns to tab
      refetchOnReconnect: true, // Always refetch on network reconnect
      
      // NO AUTO-REFRESH - only on user action
      refetchInterval: false, // Disable auto-refresh to avoid complexity
      refetchIntervalInBackground: false,
      
      // Simple retry logic
      retry: (failureCount, error: Error) => {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        
        // Don't retry client errors except 401
        if (status && status >= 400 && status < 500 && status !== 401) {
          return false;
        }
        
        // Only retry once for server errors
        return failureCount < 1;
      },
      
      // Fast retry
      retryDelay: () => 1000, // 1 second
    },
    mutations: {
      retry: false, // Never retry mutations
    },
  },
});

// SIMPLE CACHE HELPERS
export const simpleCacheHelpers = {
  // Force refresh all data - used after mutations
  refreshAllData: () => {
    queryClient.invalidateQueries();
    queryClient.refetchQueries({ type: 'active' });
  },
  
  // Clear all cache - nuclear option
  clearAllCache: () => {
    queryClient.clear();
  },
};