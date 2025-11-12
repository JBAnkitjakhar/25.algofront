// src/hooks/useApproachManagement.ts  

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approachService } from '@/lib/api/approachService';
import { ApproachLimitCalculator } from '@/lib/utils/approachLimits';
import { QUERY_KEYS } from '@/constants';
import { toast } from 'react-hot-toast';
import type { 
  CreateApproachRequest, 
  UpdateApproachRequest,
  ApproachDTO,
} from '@/types';

// ==================== QUERY HOOKS ====================

/**
 * Get approach by ID (only if user owns it)
 */
export const useApproachById = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROACHES.DETAIL(id),
    queryFn: async () => {
      const response = await approachService.getApproachById(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch approach');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Get all approaches for a question by current user
 */
export const useApproachesByQuestion = (questionId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROACHES.BY_QUESTION(questionId),
    queryFn: async () => {
      const response = await approachService.getApproachesByQuestion(questionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch approaches');
      }
      return response.data || [];
    },
    enabled: !!questionId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get all approaches by current user
 */
export const useMyApproaches = () => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROACHES.MY_APPROACHES,
    queryFn: async () => {
      const response = await approachService.getMyApproaches();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch approaches');
      }
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Get recent approaches by current user
 */
export const useMyRecentApproaches = () => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROACHES.MY_RECENT,
    queryFn: async () => {
      const response = await approachService.getMyRecentApproaches();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch recent approaches');
      }
      return response.data || [];
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get approach statistics for current user
 */
export const useMyApproachStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROACHES.MY_STATS,
    queryFn: async () => {
      const response = await approachService.getMyApproachStats();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch approach stats');
      }
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * UPDATED: Get size usage using centralized calculator
 */
export const useQuestionSizeUsage = (questionId: string) => {
  const { data: approaches = [] } = useApproachesByQuestion(questionId);
  
  return useQuery({
    queryKey: [...QUERY_KEYS.APPROACHES.SIZE_USAGE(questionId), approaches.length],
    queryFn: () => {
      return ApproachLimitCalculator.calculateSizeUsage(approaches);
    },
    enabled: !!questionId,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 60 * 1000, // 1 minute
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Create new approach for a question
 */
export const useCreateApproach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, data }: { questionId: string; data: CreateApproachRequest }) => {
      const response = await approachService.createApproach(questionId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create approach');
      }
      return response.data;
    },
    onSuccess: async (result, { questionId }) => {
      if (result?.success && result.data) {
        toast.success(result.message || 'Approach created successfully!');
        
        // Sequential cache invalidation for better reliability
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.BY_QUESTION(questionId),
        });
        
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_APPROACHES,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_RECENT,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_STATS,
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create approach');
    },
  });
};

/**
 * Update approach (only if user owns it)
 */
export const useUpdateApproach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateApproachRequest }) => {
      const response = await approachService.updateApproach(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update approach');
      }
      return response.data;
    },
    onSuccess: async (result, { id }) => {
      if (result?.success && result.data) {
        toast.success(result.message || 'Approach updated successfully!');
        
        const approach = result.data;
        
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.DETAIL(id),
        });
        
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.BY_QUESTION(approach.questionId),
        });
        
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_APPROACHES,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_RECENT,
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update approach');
    },
  });
};

/**
 * Delete approach (only if user owns it)
 */
export const useDeleteApproach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, questionId }: { id: string; questionId: string }) => {
      const response = await approachService.deleteApproach(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete approach');
      }
      return { ...response.data, deletedId: id, questionId };
    },
    onSuccess: async (result) => {
      if (result?.success && result.questionId) {
        toast.success(result.message || 'Approach deleted successfully!');
        
        // Immediately update approaches cache
        queryClient.setQueryData(
          QUERY_KEYS.APPROACHES.BY_QUESTION(result.questionId),
          (oldApproaches: ApproachDTO[] | undefined) => {
            return oldApproaches?.filter(approach => approach.id !== result.deletedId) || [];
          }
        );
        
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_APPROACHES,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_RECENT,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.APPROACHES.MY_STATS,
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete approach');
    },
  });
};

// ==================== UTILITY HOOKS ====================

/**
 * UPDATED: Real-time approach limits checker using centralized calculator
 */
export const useApproachLimits = (
  questionId: string,
  textContent: string,
  codeContent: string = '',
  excludeApproachId?: string
) => {
  const { data: approaches = [], isLoading } = useApproachesByQuestion(questionId);

  return React.useMemo(() => {
    if (isLoading || !questionId) {
      return {
        data: null,
        isLoading: true,
        error: null,
      };
    }

    try {
      const limits = ApproachLimitCalculator.checkApproachLimits(
        approaches,
        textContent,
        codeContent,
        excludeApproachId
      );

      return {
        data: limits,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        isLoading: false,
        error: error as Error,
      };
    }
  }, [approaches, textContent, codeContent, excludeApproachId, isLoading, questionId]);
};

/**
 * UPDATED: Get submission status using centralized calculator
 */
export const useSubmissionStatus = (
  questionId: string,
  textContent: string,
  codeContent: string = '',
  excludeApproachId?: string
) => {
  const { data: approaches = [], isLoading } = useApproachesByQuestion(questionId);

  return React.useMemo(() => {
    if (isLoading || !questionId) {
      return {
        canSubmit: false,
        message: 'Loading approach data...',
        type: 'loading' as const,
      };
    }

    return ApproachLimitCalculator.getSubmissionStatus(
      approaches,
      textContent,
      codeContent,
      excludeApproachId
    );
  }, [approaches, textContent, codeContent, excludeApproachId, isLoading, questionId]);
};

/**
 * Validate approach content using centralized validator
 */
export const useContentValidation = (textContent: string, codeContent: string = '') => {
  return React.useMemo(() => {
    return ApproachLimitCalculator.validateContent(textContent, codeContent);
  }, [textContent, codeContent]);
};

/**
 * DEPRECATED: Use useApproachLimits instead
 */
export const useApproachLimitsQuery = (
  questionId: string,
  textContent: string,
  codeContent?: string,
  excludeApproachId?: string
) => {
  console.warn('useApproachLimitsQuery is deprecated. Use useApproachLimits instead.');
  return useApproachLimits(questionId, textContent, codeContent || '', excludeApproachId);
};