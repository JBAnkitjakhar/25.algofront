// src/having/adminSolutions/hooks.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminSolutionsService } from "./service";
import { ADMIN_SOLUTIONS_QUERY_KEYS } from "./constants";
import toast from "react-hot-toast";
import type {
  SolutionsSummaryResponse,
  QuestionsMetadataResponse,
  SolutionDetail,
  CreateSolutionRequest,
  UpdateSolutionRequest,
  SolutionWithQuestion,
  VisualizerFilesResponse,
} from "./types";

// Fetch solutions summary with pagination
export function useSolutionsSummary(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...ADMIN_SOLUTIONS_QUERY_KEYS.SUMMARY, params],
    queryFn: async (): Promise<SolutionsSummaryResponse> => {
      const response = await adminSolutionsService.getSolutionsSummary(params);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch solutions");
    },
    staleTime: 20 * 60 * 1000, // 20 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

// Fetch questions metadata
export function useQuestionsMetadata() {
  return useQuery({
    queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.QUESTIONS_METADATA,
    queryFn: async (): Promise<QuestionsMetadataResponse> => {
      const response = await adminSolutionsService.getQuestionsMetadata();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch questions");
    },
    staleTime: 20 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

// Fetch solution detail
export function useSolutionDetail(id: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.DETAIL(id),
    queryFn: async (): Promise<SolutionDetail> => {
      const response = await adminSolutionsService.getSolutionById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch solution");
    },
    enabled: !!id && enabled,
    staleTime: 20 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Merge solutions with questions
export function useSolutionsWithQuestions(params?: { page?: number; size?: number }) {
  const { data: solutionsData, isLoading: solutionsLoading, error: solutionsError } = 
    useSolutionsSummary(params);
  const { data: questionsData, isLoading: questionsLoading, error: questionsError } = 
    useQuestionsMetadata();

  const solutions: SolutionWithQuestion[] =
    solutionsData && questionsData
      ? adminSolutionsService.mergeSolutionsWithQuestions(solutionsData, questionsData)
      : [];

  return {
    solutions,
    pagination: solutionsData ? {
      currentPage: solutionsData.number,
      totalPages: solutionsData.totalPages,
      totalElements: solutionsData.totalElements,
      pageSize: solutionsData.size,
      isFirst: solutionsData.first,
      isLast: solutionsData.last,
    } : null,
    isLoading: solutionsLoading || questionsLoading,
    error: solutionsError || questionsError,
  };
}

// Create solution
export function useCreateSolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      request,
    }: {
      questionId: string;
      request: CreateSolutionRequest;
    }): Promise<SolutionDetail> => {
      const response = await adminSolutionsService.createSolution(questionId, request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to create solution");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.SUMMARY });
      queryClient.invalidateQueries({ queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.STATS });
      toast.success("Solution created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create solution: ${error.message}`);
    },
  });
}

// Update solution
export function useUpdateSolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateSolutionRequest;
    }): Promise<SolutionDetail> => {
      const response = await adminSolutionsService.updateSolution(id, request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to update solution");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.SUMMARY });
      queryClient.invalidateQueries({ queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.STATS });
      toast.success("Solution updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update solution: ${error.message}`);
    },
  });
}

// Delete solution
export function useDeleteSolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: string }> => {
      const response = await adminSolutionsService.deleteSolution(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to delete solution");
    },
    onSuccess: (_, solutionId) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.SUMMARY });
      queryClient.invalidateQueries({ queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.DETAIL(solutionId) });
      queryClient.invalidateQueries({ queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.STATS });
      toast.success("Solution deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete solution: ${error.message}`);
    },
  });
}

// Upload solution image
export function useUploadSolutionImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await adminSolutionsService.uploadImage(file);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to upload image");
    },
    onError: (error: Error) => {
      toast.error(`Image upload failed: ${error.message}`);
    },
  });
}

// Upload visualizer file
export function useUploadVisualizerFile() {
  return useMutation({
    mutationFn: async ({ solutionId, file }: { solutionId: string; file: File }) => {
      const response = await adminSolutionsService.uploadVisualizer(solutionId, file);
      if (response.success && response.data) {
        toast.success(`Visualizer "${file.name}" uploaded successfully`);
        return response.data;
      }
      throw new Error(response.message || "Failed to upload visualizer");
    },
    onError: (error: Error) => {
      toast.error(`Visualizer upload failed: ${error.message}`);
    },
  });
}

// Get visualizers by solution
export function useVisualizerFilesBySolution(solutionId: string) {
  return useQuery({
    queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.VISUALIZERS(solutionId),
    queryFn: async (): Promise<VisualizerFilesResponse> => {
      const response = await adminSolutionsService.getVisualizersBySolution(solutionId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch visualizers");
    },
    enabled: !!solutionId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Delete visualizer file
export function useDeleteVisualizerFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      const response = await adminSolutionsService.deleteVisualizer(fileId);
      if (response.success && response.data) {
        toast.success("Visualizer deleted successfully");
        return response.data;
      }
      throw new Error(response.message || "Failed to delete visualizer");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'admin-solutions' && query.queryKey[1] === 'visualizers'
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete visualizer: ${error.message}`);
    },
  });
}