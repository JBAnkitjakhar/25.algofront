// src/userCategory/hooks.ts

import { useQuery } from "@tanstack/react-query";
import { userCategoryService } from "./service";
import { USER_CATEGORY_QUERY_KEYS } from "./constants";
import type {  PaginatedQuestions } from "./types";

/**
 * Hook to fetch all categories with user progress
 * Used in /categories page
 */
export function useAllCategoriesWithProgress() {
  return useQuery({
    queryKey: USER_CATEGORY_QUERY_KEYS.ALL_CATEGORIES,
    queryFn: async () => {
      const response = await userCategoryService.getAllCategoriesWithProgress();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch categories");
    },
    
    // ✅ Long stale time - categories don't change often
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
 * Hook to fetch specific category detail with all questions
 * Used in /categories/[id] page
 */
export function useCategoryDetail(categoryId: string) {
  return useQuery({
    queryKey: USER_CATEGORY_QUERY_KEYS.CATEGORY_DETAIL(categoryId),
    queryFn: async () => {
      const response = await userCategoryService.getCategoryDetail(categoryId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch category details");
    },
    
    enabled: !!categoryId,
    
    // ✅ Same caching strategy
    staleTime: 20 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
}

/**
 * Hook to get paginated questions from cached category detail
 */
export function usePaginatedCategoryQuestions(
  categoryId: string,
  page: number = 1,
  levelFilter?: string
) {
  // First, get category detail (this will be cached)
  const { data: categoryDetail } = useCategoryDetail(categoryId);

  // Then create paginated view
  return useQuery({
    queryKey: USER_CATEGORY_QUERY_KEYS.PAGINATED(categoryId, page, levelFilter),
    queryFn: (): PaginatedQuestions => {
      if (!categoryDetail) {
        return {
          questions: [],
          currentPage: 1,
          totalPages: 0,
          pageSize: 20,
          totalItems: 0,
        };
      }
      
      return userCategoryService.getPaginatedQuestions(
        categoryDetail,
        page,
        levelFilter
      );
    },
    
    // Only run if we have category detail
    enabled: !!categoryDetail,
    
    // ✅ Same caching strategy
    staleTime: 20 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
}