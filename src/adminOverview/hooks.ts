// src/adminOverview/hooks.ts

import { useQuery } from "@tanstack/react-query";
import { adminOverviewService } from "./service";
import { ADMIN_OVERVIEW_QUERY_KEYS } from "./constants";

/**
 * Hook to fetch admin overview data
 * NO CACHING - Always fetches fresh data
 */
export function useAdminOverview() {
  return useQuery({
    queryKey: ADMIN_OVERVIEW_QUERY_KEYS.OVERVIEW,
    queryFn: async () => {
      const response = await adminOverviewService.getOverview();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch admin overview");
    },
    
    // ✅ NO CACHING - Always fresh data for admin
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't keep in cache
    
    // ✅ Refetch on every mount
    refetchOnMount: true,
    
    // ✅ Refetch when window gains focus
    refetchOnWindowFocus: true,
    
    // ✅ Refetch on network reconnect
    refetchOnReconnect: true,
    
    // ❌ No auto-polling (admin refreshes manually)
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}