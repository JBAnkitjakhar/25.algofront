// src/hooks/useOptimizedQuestions.ts - SIMPLIFIED FOR ALWAYS FRESH DATA

import { useQuery, useMutation } from '@tanstack/react-query';
import { questionApiService } from '@/lib/api/questionService';
import { QUERY_KEYS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { simpleCacheHelpers } from '@/lib/api/queryClient';
import type { 
  QuestionSummaryPageResponse,
  CreateQuestionRequest, 
  UpdateQuestionRequest,
  Question
} from '@/types';

/**
 * SIMPLIFIED: Always fetch fresh questions data like /me page
 * No complex caching - just always get fresh data
 */
export function useQuestionSummaries(params?: {
  page?: number;
  size?: number;
  categoryId?: string;
  level?: string;
  search?: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.QUESTIONS.LIST, 'summary', params],
    queryFn: async (): Promise<QuestionSummaryPageResponse> => {
      return await questionApiService.getQuestionSummaries(params);
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
 * SIMPLIFIED: Create question with simple cache refresh
 */
export function useCreateQuestion() {
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (request: CreateQuestionRequest): Promise<Question> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can create questions');
      }

      const response = await questionApiService.createQuestion(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create question');
    },
    onSuccess: () => {
      // SIMPLIFIED: Just refresh everything like /me page approach
      simpleCacheHelpers.refreshAllData();
      toast.success('Question created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create question: ${error.message}`);
    },
  });
}

/**
 * SIMPLIFIED: Update question with simple cache refresh
 */
export function useUpdateQuestion() {
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateQuestionRequest }): Promise<Question> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can update questions');
      }

      const response = await questionApiService.updateQuestion(id, request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update question');
    },
    onSuccess: (updatedQuestion) => {
      // SIMPLIFIED: Just refresh everything
      simpleCacheHelpers.refreshAllData();
      toast.success(`Question "${updatedQuestion.title}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update question: ${error.message}`);
    },
  });
}

/**
 * SIMPLIFIED: Delete question with simple cache refresh
 */
export function useDeleteQuestion() {
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: string }> => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can delete questions');
      }

      const response = await questionApiService.deleteQuestion(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to delete question');
    },
    onSuccess: () => {
      // SIMPLIFIED: Just refresh everything
      simpleCacheHelpers.refreshAllData();
      toast.success('Question deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete question: ${error.message}`);
    },
  });
}