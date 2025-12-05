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
  VisualizerFileMetadata,
} from "./types";

// ==================== SOLUTIONS HOOKS ====================

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
    staleTime: 20 * 60 * 1000,
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
export function useSolutionsWithQuestions(params?: {
  page?: number;
  size?: number;
}) {
  const {
    data: solutionsData,
    isLoading: solutionsLoading,
    error: solutionsError,
  } = useSolutionsSummary(params);
  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuestionsMetadata();

  const solutions: SolutionWithQuestion[] =
    solutionsData && questionsData
      ? adminSolutionsService.mergeSolutionsWithQuestions(
          solutionsData,
          questionsData
        )
      : [];

  return {
    solutions,
    pagination: solutionsData
      ? {
          currentPage: solutionsData.number,
          totalPages: solutionsData.totalPages,
          totalElements: solutionsData.totalElements,
          pageSize: solutionsData.size,
          isFirst: solutionsData.first,
          isLast: solutionsData.last,
        }
      : null,
    isLoading: solutionsLoading || questionsLoading,
    error: solutionsError || questionsError,
  };
}

// ==================== SOLUTION MUTATIONS ====================

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
      const response = await adminSolutionsService.createSolution(
        questionId,
        request
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to create solution");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.SUMMARY,
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.STATS,
      });
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
      queryClient.invalidateQueries({
        queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.SUMMARY,
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.DETAIL(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.STATS,
      });
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
      queryClient.invalidateQueries({
        queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.SUMMARY,
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.DETAIL(solutionId),
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_SOLUTIONS_QUERY_KEYS.STATS,
      });
      toast.success("Solution deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete solution: ${error.message}`);
    },
  });
}

// ==================== IMAGE UPLOAD ====================

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

// ==================== VISUALIZER HOOKS (NEW) ====================

/**
 * ✅ Fetch visualizer metadata for multiple files with React Query
 * - Automatic deduplication (multiple calls = 1 request)
 * - Built-in caching with TTL
 * - No manual cache management needed
 */
export function useVisualizerMetadata(fileIds: string[]) {
  return useQuery({
    queryKey: ["visualizers", "metadata", ...fileIds.sort()], // ✅ Spread array for proper reactivity
    queryFn: async (): Promise<VisualizerFileMetadata[]> => {
      if (fileIds.length === 0) {
        return [];
      }

      // console.log(
      //   `📥 Fetching metadata for ${fileIds.length} visualizer(s):`,
      //   fileIds
      // );

      const results = await Promise.all(
        fileIds.map(async (fileId) => {
          try {
            const response = await adminSolutionsService.getVisualizerMetadata(
              fileId
            );

            if (response.success && response.data?.data) {
              // console.log(`✅ Metadata loaded for ${fileId}`);
              return response.data.data;
            }

            console.warn(`⚠️ No metadata found for ${fileId}`);
            return null;
          } catch (error) {
            console.error(`❌ Metadata fetch failed for ${fileId}:`, error);
            return null;
          }
        })
      );

      const validFiles = results.filter(
        (file): file is VisualizerFileMetadata => file !== null
      );

      // console.log(
      //   `✅ Loaded ${validFiles.length}/${fileIds.length} visualizer metadata`
      // );
      return validFiles;
    },
    enabled: fileIds.length > 0,
    staleTime: 0, // ✅ Always refetch to see latest changes
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true, // ✅ Refetch when component mounts
    refetchOnWindowFocus: false,
  });
}

/**
 * ✅ Fetch visualizer HTML content with React Query
 * - Only fetches when popup is opened (controlled by enabled flag)
 * - Caches content for fast re-opening
 * - Automatic cleanup when not needed
 */
export function useVisualizerContent(fileId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["visualizers", "content", fileId],
    queryFn: async (): Promise<string> => {
      // console.log(`📥 Fetching content for visualizer: ${fileId}`);

      const token = document.cookie.split("token=")[1]?.split(";")[0];

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
        }/files/visualizers/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch visualizer content: ${response.statusText}`
        );
      }

      const htmlContent = await response.text();
      // console.log(
      //   `✅ Content loaded for ${fileId} (${(htmlContent.length / 1024).toFixed(
      //     1
      //   )} KB)`
      // );

      return htmlContent;
    },
    enabled: !!fileId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes - HTML content rarely changes
    gcTime: 20 * 60 * 1000, // 20 minutes cache retention
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2, // Retry failed requests twice
  });
}

// ==================== VISUALIZER MUTATIONS ====================

/**
 * ✅ Upload visualizer file with proper cache invalidation
 */
export function useUploadVisualizerFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      solutionId,
      file,
    }: {
      solutionId: string;
      file: File;
    }) => {
      // console.log(
      //   `📤 Uploading visualizer: ${file.name} (${(file.size / 1024).toFixed(
      //     1
      //   )} KB)`
      // );

      const response = await adminSolutionsService.uploadVisualizer(
        solutionId,
        file
      );

      if (response.success && response.data) {
        // console.log(`✅ Upload successful, fileId: ${response.data.fileId}`);
        return response.data;
      }

      throw new Error(response.message || "Failed to upload visualizer");
    },
    onSuccess: (data, variables) => {
      // ✅ Invalidate ALL metadata queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ["visualizers", "metadata"],
      });

      toast.success(
        `Visualizer "${variables.file.name}" uploaded successfully`
      );
    },
    onError: (error: Error, variables) => {
      console.error(`❌ Upload failed for ${variables.file.name}:`, error);
      toast.error(`Visualizer upload failed: ${error.message}`);
    },
  });
}

// Update delete mutation:
export function useDeleteVisualizerFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      // console.log(`🗑️ Deleting visualizer: ${fileId}`);

      const response = await adminSolutionsService.deleteVisualizer(fileId);

      if (response.success) {
        // console.log(`✅ Delete successful for ${fileId}`);
        return { fileId };
      }

      throw new Error(response.message || "Failed to delete visualizer");
    },
    onSuccess: (data) => {
      // ✅ Invalidate metadata queries
      queryClient.invalidateQueries({
        queryKey: ["visualizers", "metadata"],
      });

      // ✅ Remove content from cache
      queryClient.removeQueries({
        queryKey: ["visualizers", "content", data.fileId],
      });

      // console.log(`🧹 Cache cleaned for deleted visualizer: ${data.fileId}`);
    },
    onError: (error: Error, fileId) => {
      console.error(`❌ Delete failed for ${fileId}:`, error);
      toast.error(`Failed to delete visualizer: ${error.message}`);
    },
  });
}
