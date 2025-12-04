// src/having/userQuestion/hooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userQuestionService } from './service';
import { USER_QUESTION_QUERY_KEYS } from './constants';
import toast from 'react-hot-toast';
import type {
  CreateApproachRequest,
  UpdateApproachRequest,
} from './types';

// Fetch question detail
export function useQuestionById(id: string) {
  return useQuery({
    queryKey: USER_QUESTION_QUERY_KEYS.DETAIL(id),
    queryFn: async () => {
      const response = await userQuestionService.getQuestionById(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch question');
      }
      return response.data!;
    },
    staleTime: 20 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!id,
  });
}

// Fetch question progress
export function useQuestionProgress(questionId: string) {
  return useQuery({
    queryKey: USER_QUESTION_QUERY_KEYS.PROGRESS(questionId),
    queryFn: async () => {
      const response = await userQuestionService.getQuestionProgress(questionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch progress');
      }
      return response.data!;
    },
    staleTime: 0, // Always fresh for progress
    gcTime: 5 * 60 * 1000,
    enabled: !!questionId,
  });
}

// Update question progress
export function useUpdateQuestionProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, solved }: { questionId: string; solved: boolean }) => {
      const response = await userQuestionService.updateQuestionProgress(questionId, solved);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update progress');
      }
      return response.data!;
    },
    
    onSuccess: (data, { questionId }) => {
      // Update progress cache
      queryClient.setQueryData(
        USER_QUESTION_QUERY_KEYS.PROGRESS(questionId),
        data
      );

      // Invalidate user progress stats
      queryClient.invalidateQueries({ 
        queryKey: ['userProgress', 'currentStats'] 
      });

      toast.success(data.solved ? 'Marked as solved ✓' : 'Marked as unsolved');
    },
    
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update progress');
    },
  });
}

// Fetch solutions by question
export function useSolutionsByQuestion(questionId: string) {
  return useQuery({
    queryKey: USER_QUESTION_QUERY_KEYS.SOLUTIONS(questionId),
    queryFn: async () => {
      const response = await userQuestionService.getSolutionsByQuestion(questionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch solutions');
      }
      return response.data || [];
    },
    staleTime: 20 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!questionId,
  });
}

// Fetch approaches by question
export function useApproachesByQuestion(questionId: string) {
  return useQuery({
    queryKey: USER_QUESTION_QUERY_KEYS.APPROACHES(questionId),
    queryFn: async () => {
      const response = await userQuestionService.getApproachesByQuestion(questionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch approaches');
      }
      return response.data || [];
    },
    staleTime: 0, // Always fresh for user's own approaches
    gcTime: 5 * 60 * 1000,
    enabled: !!questionId,
  });
}

// Fetch approach detail
export function useApproachDetail(questionId: string, approachId: string) {
  return useQuery({
    queryKey: USER_QUESTION_QUERY_KEYS.APPROACH_DETAIL(questionId, approachId),
    queryFn: async () => {
      const response = await userQuestionService.getApproachDetail(questionId, approachId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch approach detail');
      }
      return response.data!;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    enabled: !!questionId && !!approachId,
  });
}

// Create approach
export function useCreateApproach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      questionId, 
      data 
    }: { 
      questionId: string; 
      data: CreateApproachRequest;
    }) => {
      const response = await userQuestionService.createApproach(questionId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create approach');
      }
      return response.data!;
    },
    
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({
        queryKey: USER_QUESTION_QUERY_KEYS.APPROACHES(questionId),
      });
      toast.success('Approach submitted successfully!');
    },
    
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create approach');
    },
  });
}

// Update approach
export function useUpdateApproach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      approachId,
      data,
    }: {
      questionId: string;
      approachId: string;
      data: UpdateApproachRequest;
    }) => {
      const response = await userQuestionService.updateApproach(questionId, approachId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update approach');
      }
      return response.data!;
    },
    
    onSuccess: (newData, { questionId, approachId }) => {
      // Update approach detail cache
      queryClient.setQueryData(
        USER_QUESTION_QUERY_KEYS.APPROACH_DETAIL(questionId, approachId),
        newData
      );

      // Invalidate approaches list
      queryClient.invalidateQueries({
        queryKey: USER_QUESTION_QUERY_KEYS.APPROACHES(questionId),
      });

      toast.success('Approach updated successfully!');
    },
    
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update approach');
    },
  });
}

// Delete approach
export function useDeleteApproach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, approachId }: { questionId: string; approachId: string }) => {
      const response = await userQuestionService.deleteApproach(questionId, approachId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete approach');
      }
    },
    
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({
        queryKey: USER_QUESTION_QUERY_KEYS.APPROACHES(questionId),
      });
      toast.success('Approach deleted successfully');
    },
    
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete approach');
    },
  });
}

// Combined hook for question page data
export function useQuestionPageData(questionId: string) {
  const question = useQuestionById(questionId);
  const progress = useQuestionProgress(questionId);
  const solutions = useSolutionsByQuestion(questionId);
  const approaches = useApproachesByQuestion(questionId);

  return {
    question: question.data,
    progress: progress.data,
    solutions: solutions.data || [],
    approaches: approaches.data || [],
    isLoading: question.isLoading,
    isError: question.isError || progress.isError || solutions.isError || approaches.isError,
  };
}