// src/hooks/useUserProgress.ts  

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userProgressApiService } from '@/lib/api/userProgressService';
import { QUERY_KEYS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import type { 
  UserProgressDTO,
  UserProgressStats,
  CategoryProgressStats
} from '@/types';

/**
 * Hook to get current user's progress statistics
 * This is the main hook for the /me page
 */
export function useCurrentUserProgressStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRESS.CURRENT_STATS,
    queryFn: async (): Promise<UserProgressStats> => {
      return await userProgressApiService.getCurrentUserProgressStats();
    },
    enabled: !!user, // Only fetch if user is authenticated
    // PHASE 1: Use global defaults (staleTime: 0, refetchOnMount: true)
  });
}

/**
 * Hook to get current user's recent progress
 */
export function useCurrentUserRecentProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRESS.CURRENT_RECENT,
    queryFn: async (): Promise<UserProgressDTO[]> => {
      return await userProgressApiService.getCurrentUserRecentProgress();
    },
    enabled: !!user,
    // PHASE 1: Use global defaults for fresh recent progress
  });
}

/**
 * Hook to get progress for specific question
 * Now properly handles 404 errors when question hasn't been solved
 */
export function useQuestionProgress(questionId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRESS.QUESTION_PROGRESS(questionId),
    queryFn: async (): Promise<UserProgressDTO | null> => {
      try {
        const response = await userProgressApiService.getQuestionProgress(questionId);
        return response;
      } catch (error: unknown) {
        // Handle 404s gracefully - question hasn't been solved yet
        const axiosError = error as { response?: { status?: number }; status?: number; message?: string };
        
        if (axiosError?.response?.status === 404 || 
            axiosError?.status === 404 || 
            axiosError?.message?.includes('404') ||
            axiosError?.message?.includes('Not Found')) {
          return null; // This is expected behavior
        }
        throw error; // Re-throw other errors
      }
    },
    enabled: !!user && !!questionId,
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 errors
      const axiosError = error as { response?: { status?: number }; status?: number; message?: string };
      
      if (axiosError?.response?.status === 404 || 
          axiosError?.status === 404 || 
          axiosError?.message?.includes('404') ||
          axiosError?.message?.includes('Not Found')) {
        return false;
      }
      return failureCount < 2;
    },
    // PHASE 1: Use global defaults but don't show 404 errors in console
    meta: {
      errorHandler: (error: unknown) => {
        // Only log actual errors, not 404s
        const axiosError = error as { response?: { status?: number }; status?: number; message?: string };
        
        if (!(axiosError?.response?.status === 404 || 
              axiosError?.status === 404 || 
              axiosError?.message?.includes('404') ||
              axiosError?.message?.includes('Not Found'))) {
          console.error('Error fetching question progress:', error);
        }
      }
    }
  });
}

/**
 * Hook to get category progress for current user
 */
export function useCategoryProgress(categoryId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRESS.CATEGORY_PROGRESS(categoryId),
    queryFn: async (): Promise<CategoryProgressStats> => {
      return await userProgressApiService.getCategoryProgress(categoryId);
    },
    enabled: !!user && !!categoryId,
    // PHASE 1: Use global defaults for fresh category progress
  });
}

/**
 * Hook to update question progress with comprehensive cache invalidation
 */
export function useUpdateQuestionProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      questionId, 
      solved 
    }: { 
      questionId: string; 
      solved: boolean; 
    }): Promise<UserProgressDTO> => {
      if (!user) {
        throw new Error('User must be authenticated to update progress');
      }

      return await userProgressApiService.updateQuestionProgress(questionId, solved);
    },
    onSuccess: (updatedProgress, variables) => {
      const { questionId, solved } = variables;

      // PHASE 1: Comprehensive cache invalidation when user progress changes
      
      // Update specific question progress
      queryClient.setQueryData(
        QUERY_KEYS.USER_PROGRESS.QUESTION_PROGRESS(questionId),
        updatedProgress
      );

      // Invalidate user progress queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.USER_PROGRESS.CURRENT_STATS 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.USER_PROGRESS.CURRENT_RECENT 
      });
      
      // CRITICAL: Invalidate question detail to update solved status
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.DETAIL(questionId) 
      });

      // CRITICAL: Invalidate questions list since it shows solved status
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.QUESTIONS.LIST 
      });

      // CRITICAL: Invalidate categories since progress affects category stats
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS 
      });

      // Also invalidate the old combined categories query if still in use
      queryClient.invalidateQueries({ 
        queryKey: ['categories-with-stats'] 
      });

      // Invalidate category progress queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'userProgress' && 
          query.queryKey[1] === 'category'
      });

      // Show success toast
      const action = solved ? 'marked as solved' : 'marked as unsolved';
      toast.success(`Question ${action} successfully!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update progress: ${error.message}`);
    },
  });
}

/**
 * Hook to check if a question is solved by current user
 * This is a derived hook that uses question progress
 */
export function useIsQuestionSolved(questionId: string) {
  const { data: questionProgress, isLoading } = useQuestionProgress(questionId);
  
  return {
    isSolved: questionProgress?.solved || false,
    solvedAt: questionProgress?.solvedAt,
    isLoading,
  };
}

/**
 * Hook to get multiple questions progress using the bulk endpoint
 * This is more efficient than making individual requests
 */
export function useMultipleQuestionProgress(questionIds: string[]) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userProgress', 'bulk', questionIds.sort()],
    queryFn: async (): Promise<Record<string, boolean>> => {
      if (!user || questionIds.length === 0) {
        return {};
      }

      try {
        return await userProgressApiService.getBulkQuestionProgress(questionIds);
      } catch (error) {
        // Handle errors gracefully - return empty object
        console.warn('Failed to fetch bulk question progress:', error);
        return {};
      }
    },
    enabled: !!user && questionIds.length > 0,
    // PHASE 1: Shorter cache for bulk data but still fresh
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry since we handle errors gracefully
  });
}

// ADMIN HOOKS (for future use)

/**
 * Hook to get progress stats for any user (Admin only)
 */
export function useUserProgressStats(userId: string) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRESS.USER_STATS(userId),
    queryFn: async (): Promise<UserProgressStats> => {
      return await userProgressApiService.getUserProgressStats(userId);
    },
    enabled: isAdmin() && !!userId,
    // Admin data can have slightly longer cache
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get all progress for any user (Admin only)
 */
export function useAllUserProgress(userId: string) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRESS.USER_ALL(userId),
    queryFn: async (): Promise<UserProgressDTO[]> => {
      return await userProgressApiService.getAllUserProgress(userId);
    },
    enabled: isAdmin() && !!userId,
    // Admin data can have slightly longer cache
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}