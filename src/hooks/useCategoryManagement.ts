// src/hooks/useCategoryManagement.ts  

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApiService } from '@/lib/api/categoryService';
import { QUERY_KEYS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import type { 
  Category, 
  CategoryStats, 
  CategoryWithProgress,
  CreateCategoryRequest, 
  UpdateCategoryRequest 
} from '@/types';

/**
 * Hook to get all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES.LIST,
    queryFn: async (): Promise<Category[]> => {
      const response = await categoryApiService.getAllCategories();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch categories');
    },
    // PHASE 1: Use global defaults (staleTime: 0, refetchOnMount: true)
  });
}

/**
 * PHASE 1: Optimized hook to get all categories with stats and user progress
 * Now always fetches fresh data on page refresh
 */
export function useCategoriesWithProgress() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS,
    queryFn: async (): Promise<CategoryWithProgress[]> => {
      const response = await categoryApiService.getCategoriesWithProgress();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch categories with progress');
    },
    enabled: !!user, // Only fetch when user is logged in
    // PHASE 1: Use global defaults for fresh data
    // staleTime: 0 means always refetch on mount
    // refetchOnMount: true means fresh data on page refresh
  });
}

/**
 * Hook to get category by ID
 */
export function useCategoryById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES.DETAIL(id),
    queryFn: async (): Promise<Category> => {
      const response = await categoryApiService.getCategoryById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch category');
    },
    enabled: !!id,
    // PHASE 1: Use global defaults
  });
}

/**
 * Hook to get category statistics
 */
export function useCategoryStats(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES.STATS(id),
    queryFn: async (): Promise<CategoryStats> => {
      const response = await categoryApiService.getCategoryStats(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch category stats');
    },
    enabled: !!id,
    // PHASE 1: Use global defaults
  });
}

/**
 * DEPRECATED: Use useCategoriesWithProgress() instead
 */
export function useCategoriesWithStats() {
  console.warn('useCategoriesWithStats() is deprecated. Use useCategoriesWithProgress() instead for better performance.');
  
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  
  const { data: allStats, isLoading: statsLoading } = useQuery({
    queryKey: ['categories-with-stats', categories.map(c => c.id).sort()],
    queryFn: async () => {
      if (categories.length === 0) return {};
      
      const statsPromises = categories.map(async (category) => {
        try {
          const response = await categoryApiService.getCategoryStats(category.id);
          if (response.success && response.data) {
            return { [category.id]: response.data };
          }
          return { [category.id]: { totalQuestions: 0, questionsByLevel: { easy: 0, medium: 0, hard: 0 }, totalSolutions: 0 } };
        } catch (error) {
          console.warn(`Failed to fetch stats for category ${category.id}:`, error);
          return { [category.id]: { totalQuestions: 0, questionsByLevel: { easy: 0, medium: 0, hard: 0 }, totalSolutions: 0 } };
        }
      });
      
      const statsResults = await Promise.all(statsPromises);
      return statsResults.reduce((acc, stat) => ({ ...acc, ...stat }), {});
    },
    enabled: categories.length > 0,
    // PHASE 1: Use global defaults for fresh data
  });

  const categoriesWithStats = categories.map((category) => {
    const statsData = allStats?.[category.id];
    return {
      ...category,
      totalQuestions: statsData?.totalQuestions || 0,
      questionsByLevel: statsData?.questionsByLevel || { easy: 0, medium: 0, hard: 0 },
      totalSolutions: statsData?.totalSolutions || 0,
    };
  });

  const isLoading = categoriesLoading || statsLoading;

  return {
    data: categoriesWithStats,
    isLoading,
    error: null,
  };
}

/**
 * Hook to create category with better cache invalidation
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (request: CreateCategoryRequest): Promise<Category> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can create categories');
      }

      if (!request.name.trim()) {
        throw new Error('Category name is required');
      }

      if (request.name.trim().length < 2) {
        throw new Error('Category name must be at least 2 characters long');
      }

      if (request.name.trim().length > 50) {
        throw new Error('Category name must be less than 50 characters');
      }

      const response = await categoryApiService.createCategory(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create category');
    },
    onSuccess: (newCategory) => {
      // PHASE 1: More aggressive cache invalidation
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      queryClient.invalidateQueries({ queryKey: ['categories-with-stats'] });
      
      // PHASE 1: Also invalidate questions since they show category names
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.LIST });
      
      toast.success(`Category "${newCategory.name}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });
}

/**
 * Hook to update category with better cache invalidation
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateCategoryRequest }): Promise<Category> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can update categories');
      }

      if (!request.name.trim()) {
        throw new Error('Category name is required');
      }

      if (request.name.trim().length < 2) {
        throw new Error('Category name must be at least 2 characters long');
      }

      if (request.name.trim().length > 50) {
        throw new Error('Category name must be less than 50 characters');
      }

      const response = await categoryApiService.updateCategory(id, request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update category');
    },
    onSuccess: (updatedCategory, variables) => {
      // PHASE 1: Aggressive cache invalidation for category updates
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.STATS(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['categories-with-stats'] });
      
      // PHASE 1: CRITICAL - Invalidate questions list since category names are embedded
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.LIST });
      
      toast.success(`Category "${updatedCategory.name}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });
}

/**
 *  Hook to delete category with better cache invalidation
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: boolean; deletedQuestions: number }> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can delete categories');
      }

      const response = await categoryApiService.deleteCategory(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to delete category');
    },
    onSuccess: (result, categoryId) => {
      // PHASE 1: Aggressive cache invalidation for deletes
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.DETAIL(categoryId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.STATS(categoryId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      queryClient.invalidateQueries({ queryKey: ['categories-with-stats'] });
      
      // PHASE 1: CRITICAL - Invalidate questions since associated questions are deleted
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.LIST });

      if (result.deletedQuestions > 0) {
        toast.success(
          `Category deleted successfully. ${result.deletedQuestions} questions were also removed.`,
          { duration: 6000 }
        );
      } else {
        toast.success('Category deleted successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });
}