// src/having/adminquestions/hooks.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQuestionsService } from "./service";
import { ADMIN_QUESTIONS_QUERY_KEYS } from "./constants";
import toast from "react-hot-toast";
import type {
  QuestionsSummaryResponse,
  CategoriesMetadataResponse,
  QuestionDetail,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  QuestionWithCategory,
  ImageUploadResponse,
} from "./types";

/**
 * Hook to fetch questions summary
 * Used in admin questions page
 */
export function useQuestionsSummary(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...ADMIN_QUESTIONS_QUERY_KEYS.SUMMARY, params],
    queryFn: async (): Promise<QuestionsSummaryResponse> => {
      const response = await adminQuestionsService.getQuestionsSummary(params);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch questions");
    },

    // ✅ Caching strategy: 20 minutes stale time
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
 * Hook to fetch categories metadata
 * Used in create/edit modals for category dropdown
 */
export function useCategoriesMetadata() {
  return useQuery({
    queryKey: ADMIN_QUESTIONS_QUERY_KEYS.CATEGORIES,
    queryFn: async (): Promise<CategoriesMetadataResponse> => {
      const response = await adminQuestionsService.getCategoriesMetadata();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch categories");
    },

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
 * Hook to fetch full question detail
 * Used in edit modal to load question data
 */
export function useQuestionDetail(id: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ADMIN_QUESTIONS_QUERY_KEYS.DETAIL(id),
    queryFn: async (): Promise<QuestionDetail> => {
      const response = await adminQuestionsService.getQuestionById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch question");
    },

    enabled: !!id && enabled,

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
 * Hook to get questions with category names merged
 * Combines questions summary and categories metadata
 */
export function useQuestionsWithCategories(params?: {
  page?: number;
  size?: number;
}) {
  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuestionsSummary(params);

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesMetadata();

  const questions: QuestionWithCategory[] =
    questionsData && categoriesData
      ? adminQuestionsService.mergeQuestionsWithCategories(
          questionsData,
          categoriesData
        )
      : [];

  return {
    questions,
    pagination: questionsData
      ? {
          currentPage: questionsData.number,
          totalPages: questionsData.totalPages,
          totalElements: questionsData.totalElements,
          pageSize: questionsData.size,
          isFirst: questionsData.first,
          isLast: questionsData.last,
        }
      : null,
    isLoading: questionsLoading || categoriesLoading,
    error: questionsError || categoriesError,
  };
}

/**
 * Hook to create question
 * Invalidates all question caches on success
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: CreateQuestionRequest
    ): Promise<QuestionDetail> => {
      const response = await adminQuestionsService.createQuestion(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to create question");
    },

    onSuccess: (newQuestion) => {
      // ✅ Invalidate all question-related caches
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUESTIONS_QUERY_KEYS.SUMMARY,
      });

      // ✅ Also invalidate categories metadata (question count might change)
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUESTIONS_QUERY_KEYS.CATEGORIES,
      });

      toast.success(`Question "${newQuestion.title}" created successfully`);
    },

    onError: (error: Error) => {
      toast.error(`Failed to create question: ${error.message}`);
    },
  });
}

/**
 * Hook to update question
 * Invalidates all question caches on success
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateQuestionRequest;
    }): Promise<QuestionDetail> => {
      const response = await adminQuestionsService.updateQuestion(id, request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to update question");
    },

    onSuccess: (updatedQuestion, variables) => {
      // ✅ Invalidate all question-related caches
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUESTIONS_QUERY_KEYS.SUMMARY,
      });

      // ✅ Invalidate specific question detail
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUESTIONS_QUERY_KEYS.DETAIL(variables.id),
      });

      // ✅ Invalidate categories metadata
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUESTIONS_QUERY_KEYS.CATEGORIES,
      });

      toast.success(`Question "${updatedQuestion.title}" updated successfully`);
    },

    onError: (error: Error) => {
      toast.error(`Failed to update question: ${error.message}`);
    },
  });
}

/**
 * Hook to delete question
 * Invalidates all question caches on success
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: string }> => {
      const response = await adminQuestionsService.deleteQuestion(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to delete question");
    },

    onSuccess: (result, questionId) => {
      // ✅ Invalidate all question-related caches
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUESTIONS_QUERY_KEYS.SUMMARY,
      });

      // ✅ Invalidate specific question detail
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUESTIONS_QUERY_KEYS.DETAIL(questionId),
      });

      // ✅ Invalidate categories metadata
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUESTIONS_QUERY_KEYS.CATEGORIES,
      });

      toast.success(
        "Question deleted successfully. All related data has been removed."
      );
    },

    onError: (error: Error) => {
      toast.error(`Failed to delete question: ${error.message}`);
    },
  });
}

/**
 * Hook to upload question image
 */
export function useUploadQuestionImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<ImageUploadResponse> => {
      // Basic validation
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("Image size must be less than 5MB");
      }

      const response = await adminQuestionsService.uploadImage(file);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to upload image");
    },

    onError: (error: Error) => {
      toast.error(`Failed to upload image: ${error.message}`);
    },
  });
}