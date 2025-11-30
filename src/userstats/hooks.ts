// src/userstats/hooks.ts

import { useQuery } from "@tanstack/react-query";
import { userStatsService } from "./service";
import { USER_STATS_QUERY_KEYS, PAGINATION_CONFIG } from "./constants";
import type {PaginatedQuestions } from "./types";

/**
 * Main hook to fetch and cache all user progress stats
 * This fetches data from 3 APIs and processes it into a single stats object
 */
export function useUserProgressStats() {
  return useQuery({
    queryKey: USER_STATS_QUERY_KEYS.PROGRESS,
    queryFn: async () => {
      const response = await userStatsService.getUserProgressStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch user progress");
    },
    
    // ✅ Long stale time - user stats don't change often
    staleTime: 20 * 60 * 1000, // 20 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 mins
    
    // ✅ Refetch on page refresh
    refetchOnMount: true,
    
    // ❌ Don't refetch on tab switch
    refetchOnWindowFocus: false,
    
    // ❌ Don't refetch on network reconnect
    refetchOnReconnect: false,
    
    // ❌ No background polling
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}

/**
 * Hook to get paginated solved questions
 * Uses cached stats from useUserProgressStats
 */
export function usePaginatedSolvedQuestions(page: number = 1) {
  // First, get all stats (this will be cached)
  const { data: stats} = useUserProgressStats();

  // Then create paginated view
  return useQuery({
    queryKey: USER_STATS_QUERY_KEYS.PAGINATED(page),
    queryFn: (): PaginatedQuestions => {
      if (!stats) {
        return {
          questions: [],
          currentPage: 1,
          totalPages: 0,
          pageSize: PAGINATION_CONFIG.PAGE_SIZE,
          totalItems: 0,
        };
      }
      
      return userStatsService.getPaginatedQuestions(
        stats.allSolvedQuestions,
        page
      );
    },
    
    // Only run if we have stats
    enabled: !!stats,
    
    // ✅ Same caching strategy as parent
    staleTime: 20 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
}