// src/lib/api/queryClient.ts

import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      
      staleTime: 20 * 60 * 1000,  
      gcTime: 30 * 60 * 1000,  
      
      // ALWAYS FRESH DATA STRATEGY
      refetchOnMount: true, // Always refetch when component mounts
      refetchOnWindowFocus: false, // Always refetch when user returns to tab
      refetchOnReconnect: false, // Always refetch on network reconnect
      
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