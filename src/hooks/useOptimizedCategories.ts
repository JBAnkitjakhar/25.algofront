// src/hooks/useOptimizedCategories.ts - SIMPLIFIED FOR ALWAYS FRESH DATA

import { useQuery, useMutation  } from '@tanstack/react-query';
import { categoryApiService } from '@/lib/api/categoryService';
import { QUERY_KEYS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { simpleCacheHelpers } from '@/lib/api/queryClient';
import type { 
  CategoryWithProgress,
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  Category
} from '@/types';

/**
 * SIMPLIFIED: Always fetch fresh categories data like /me page
 * No complex caching - just always get fresh data
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
    enabled: !!user,
    
    // SIMPLIFIED: Use minimal caching like /me page
    staleTime: 0, // Always fresh
    gcTime: 30 * 1000, // Keep for only 30 seconds
    refetchOnMount: true, // Always refetch on page visit
    refetchOnWindowFocus: true, // Always refetch when tab focus
  });
}

/**
 * SIMPLIFIED: Create category with simple cache refresh
 */
export function useCreateCategory() {
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (request: CreateCategoryRequest): Promise<Category> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can create categories');
      }

      const response = await categoryApiService.createCategory(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create category');
    },
    onSuccess: () => {
      // SIMPLIFIED: Just refresh everything like /me page approach
      simpleCacheHelpers.refreshAllData();
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });
}

/**
 * SIMPLIFIED: Update category with simple cache refresh
 */
export function useUpdateCategory() {
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateCategoryRequest }): Promise<Category> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can update categories');
      }

      const response = await categoryApiService.updateCategory(id, request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update category');
    },
    onSuccess: (updatedCategory) => {
      // SIMPLIFIED: Just refresh everything
      simpleCacheHelpers.refreshAllData();
      toast.success(`Category "${updatedCategory.name}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });
}

/**
 * SIMPLIFIED: Delete category with simple cache refresh
 */
export function useDeleteCategory() {
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
    onSuccess: (result) => {
      // SIMPLIFIED: Just refresh everything
      simpleCacheHelpers.refreshAllData();
      
      toast.success(
        result.deletedQuestions > 0
          ? `Category deleted successfully. ${result.deletedQuestions} questions were also removed.`
          : 'Category deleted successfully'
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });
}