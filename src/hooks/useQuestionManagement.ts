// src/hooks/useQuestionManagement.ts  

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionApiService } from '@/lib/api/questionService';
import { fileUploadApiService } from '@/lib/api/fileUploadService';
import { QUERY_KEYS, QUESTION_VALIDATION } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import type { 
  Question, 
  QuestionDetail,
  QuestionPageResponse,
  QuestionSummaryPageResponse,
  QuestionStats,
  CreateQuestionRequest, 
  UpdateQuestionRequest,
  ImageUploadResponse
} from '@/types';

/**
 * PHASE 1: Hook to get question summaries with embedded user progress
 * Always fetches fresh data on page refresh
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
    enabled: !!user, // Only fetch if user is authenticated
    
    // PHASE 1: Use global defaults (staleTime: 0, refetchOnMount: true)
    // This ensures fresh data on every page refresh and navigation
  });
}

/**
 * Hook to get all questions with pagination and filters (ADMIN USE - full question data)
 */
export function useQuestions(params?: {
  page?: number;
  size?: number;
  categoryId?: string;
  level?: string;
  search?: string;
  sort?: string;
  direction?: string;
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.QUESTIONS.LIST, 'full', params],
    queryFn: async (): Promise<QuestionPageResponse> => {
      const response = await questionApiService.getAllQuestions(params);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch questions');
    },
    
    // PHASE 1: Use global defaults for admin pages too
    // Admin needs fresh data when questions are updated
  });
}

/**
 * PHASE 1: Hook to get question by ID - fresh data when navigating to question
 */
export function useQuestionById(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.QUESTIONS.DETAIL(id),
    queryFn: async (): Promise<QuestionDetail> => {
      const response = await questionApiService.getQuestionById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch question');
    },
    enabled: !!id && !!user, // Only fetch if user is authenticated
    
    // PHASE 1: Use global defaults for fresh data
    // This ensures when user navigates back to question after marking solved/unsolved,
    // the data is fresh and shows correct solved status
  });
}

/**
 * Hook to get question statistics
 */
export function useQuestionStats() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.QUESTIONS.STATS,
    queryFn: async (): Promise<QuestionStats> => {
      const response = await questionApiService.getQuestionStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch question stats');
    },
    enabled: isAdmin(), // Only admins can see stats
    
    // PHASE 1: Use global defaults - admin stats should be fresh
  });
}

/**
 * Hook to search questions (legacy - for search that needs full question data)
 */
export function useSearchQuestions(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.QUESTIONS.SEARCH(query),
    queryFn: async (): Promise<Question[]> => {
      const response = await questionApiService.searchQuestions(query);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to search questions');
    },
    enabled: !!query.trim() && query.length >= 2, // Only search if query has at least 2 characters
    
    // PHASE 1: Search results should be fresh
    // Use global defaults
  });
}

/**
 *  Hook to create question with comprehensive cache invalidation
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (request: CreateQuestionRequest): Promise<Question> => {
      // Frontend validation
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can create questions');
      }

      // Validate title
      if (!request.title.trim()) {
        throw new Error('Question title is required');
      }
      if (request.title.trim().length < QUESTION_VALIDATION.TITLE_MIN_LENGTH) {
        throw new Error(`Title must be at least ${QUESTION_VALIDATION.TITLE_MIN_LENGTH} characters long`);
      }
      if (request.title.trim().length > QUESTION_VALIDATION.TITLE_MAX_LENGTH) {
        throw new Error(`Title must be less than ${QUESTION_VALIDATION.TITLE_MAX_LENGTH} characters`);
      }

      // Validate statement
      if (!request.statement.trim()) {
        throw new Error('Question statement is required');
      }
      if (request.statement.trim().length < QUESTION_VALIDATION.STATEMENT_MIN_LENGTH) {
        throw new Error(`Statement must be at least ${QUESTION_VALIDATION.STATEMENT_MIN_LENGTH} characters long`);
      }
      if (request.statement.trim().length > QUESTION_VALIDATION.STATEMENT_MAX_LENGTH) {
        throw new Error(`Statement must be less than ${QUESTION_VALIDATION.STATEMENT_MAX_LENGTH} characters`);
      }

      // Validate category
      if (!request.categoryId) {
        throw new Error('Category is required');
      }

      // Validate level
      if (!request.level) {
        throw new Error('Difficulty level is required');
      }

      // Validate images
      if (request.imageUrls && request.imageUrls.length > QUESTION_VALIDATION.MAX_IMAGES_PER_QUESTION) {
        throw new Error(`Maximum ${QUESTION_VALIDATION.MAX_IMAGES_PER_QUESTION} images allowed per question`);
      }

      const response = await questionApiService.createQuestion(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create question');
    },
    onSuccess: (newQuestion) => {
      // PHASE 1: Comprehensive cache invalidation for question creation
      
      // Invalidate all question-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.STATS });
      
      // Invalidate admin stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      
      // CRITICAL: Invalidate category stats since question count increased
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.STATS(newQuestion.categoryId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS });
      
      // Also invalidate the old combined categories query if still in use
      queryClient.invalidateQueries({ queryKey: ['categories-with-stats'] });
      
      toast.success(`Question "${newQuestion.title}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create question: ${error.message}`);
    },
  });
}

/**
 * Hook to update question with comprehensive cache invalidation
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateQuestionRequest }): Promise<Question> => {
      // Frontend validation (same as create)
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can update questions');
      }

      // Validate title
      if (!request.title.trim()) {
        throw new Error('Question title is required');
      }
      if (request.title.trim().length < QUESTION_VALIDATION.TITLE_MIN_LENGTH) {
        throw new Error(`Title must be at least ${QUESTION_VALIDATION.TITLE_MIN_LENGTH} characters long`);
      }
      if (request.title.trim().length > QUESTION_VALIDATION.TITLE_MAX_LENGTH) {
        throw new Error(`Title must be less than ${QUESTION_VALIDATION.TITLE_MAX_LENGTH} characters`);
      }

      // Validate statement
      if (!request.statement.trim()) {
        throw new Error('Question statement is required');
      }
      if (request.statement.trim().length < QUESTION_VALIDATION.STATEMENT_MIN_LENGTH) {
        throw new Error(`Statement must be at least ${QUESTION_VALIDATION.STATEMENT_MIN_LENGTH} characters long`);
      }
      if (request.statement.trim().length > QUESTION_VALIDATION.STATEMENT_MAX_LENGTH) {
        throw new Error(`Statement must be less than ${QUESTION_VALIDATION.STATEMENT_MAX_LENGTH} characters`);
      }

      const response = await questionApiService.updateQuestion(id, request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update question');
    },
    onSuccess: (updatedQuestion, variables) => {
      // PHASE 1: Comprehensive cache invalidation for question updates
      
      // Invalidate all question-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.STATS });
      
      // Invalidate admin stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      
      // CRITICAL: Question updates might affect category stats
      // (e.g., if question changed category or difficulty level)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS });
      queryClient.invalidateQueries({ queryKey: ['categories-with-stats'] });
      
      // Invalidate specific category stats
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'categories' && 
          query.queryKey[1] === 'stats'
      });
      
      toast.success(`Question "${updatedQuestion.title}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update question: ${error.message}`);
    },
  });
}

/**
 * Hook to delete question with comprehensive cache invalidation
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: string }> => {
      // Frontend validation
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can delete questions');
      }

      const response = await questionApiService.deleteQuestion(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to delete question');
    },
    onSuccess: (result, questionId) => {
      // PHASE 1: Comprehensive cache invalidation for question deletion
      
      // Invalidate all question-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.DETAIL(questionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONS.STATS });
      
      // Invalidate admin stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      
      // CRITICAL: Question deletion affects category stats and user progress
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.WITH_PROGRESS });
      queryClient.invalidateQueries({ queryKey: ['categories-with-stats'] });
      
      // Invalidate all category stats since question count decreased
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'categories' && 
          query.queryKey[1] === 'stats'
      });
      
      // Invalidate user progress since question and related progress are deleted
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'userProgress'
      });

      toast.success('Question deleted successfully. All related solutions and progress have been removed.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete question: ${error.message}`);
    },
  });
}

/**
 * Hook to upload question image (Admin/SuperAdmin only)
 */
export function useUploadQuestionImage() {
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (file: File): Promise<ImageUploadResponse> => {
      // Frontend validation
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can upload images');
      }

      // Validate file
      const validation = fileUploadApiService.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await fileUploadApiService.uploadQuestionImage(file);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to upload image');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload image: ${error.message}`);
    },
  });
}

/**
 * Hook to get file upload configuration
 */
export function useFileConfig() {
  return useQuery({
    queryKey: QUERY_KEYS.FILES.CONFIG,
    queryFn: async () => {
      const response = await fileUploadApiService.getFileConfig();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch file config');
    },
    
    // File config can be cached longer since it rarely changes
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false, // Don't refetch config on every mount
    refetchOnWindowFocus: false, // Don't refetch config on focus
  });
}