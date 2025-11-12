// src/hooks/useSolutionManagement.ts - Solution management hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { solutionApiService } from '@/lib/api/solutionService';
import { fileUploadApiService } from '@/lib/api/fileUploadService';
import { QUERY_KEYS, SOLUTION_VALIDATION } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import type { 
  Solution, 
  SolutionPageResponse,
  SolutionStats,
  CreateSolutionRequest, 
  UpdateSolutionRequest,
  ImageUploadResponse,
  LinkValidationResponse
} from '@/types';

/**
 * Hook to get all solutions with pagination and filters (Admin/SuperAdmin only)
 */
export function useSolutions(params?: {
  page?: number;
  size?: number;
  questionId?: string;
  creatorId?: string;
}) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.SOLUTIONS.LIST, params],
    queryFn: async (): Promise<SolutionPageResponse> => {
      const response = await solutionApiService.getAllSolutions(params);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch solutions');
    },
    enabled: isAdmin(), // Only admins can see all solutions
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

/**
 * Hook to get solution by ID
 */
export function useSolutionById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.SOLUTIONS.DETAIL(id),
    queryFn: async (): Promise<Solution> => {
      const response = await solutionApiService.getSolutionById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch solution');
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to get solutions for a specific question
 */
export function useSolutionsByQuestion(questionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.SOLUTIONS.BY_QUESTION(questionId),
    queryFn: async (): Promise<Solution[]> => {
      const response = await solutionApiService.getSolutionsByQuestion(questionId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch solutions');
    },
    enabled: !!questionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get solution statistics (Admin/SuperAdmin only)
 */
export function useSolutionStats() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.SOLUTIONS.STATS,
    queryFn: async (): Promise<SolutionStats> => {
      const response = await solutionApiService.getSolutionStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch solution stats');
    },
    enabled: isAdmin(), // Only admins can see stats
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create solution (Admin/SuperAdmin only)
 */
export function useCreateSolution() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ questionId, request }: { questionId: string; request: CreateSolutionRequest }): Promise<Solution> => {
      // Frontend validation
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can create solutions');
      }

      // Validate content
      if (!request.content.trim()) {
        throw new Error('Solution content is required');
      }
      if (request.content.trim().length < SOLUTION_VALIDATION.CONTENT_MIN_LENGTH) {
        throw new Error(`Content must be at least ${SOLUTION_VALIDATION.CONTENT_MIN_LENGTH} characters long`);
      }
      if (request.content.trim().length > SOLUTION_VALIDATION.CONTENT_MAX_LENGTH) {
        throw new Error(`Content must be less than ${SOLUTION_VALIDATION.CONTENT_MAX_LENGTH} characters`);
      }

      // Validate images
      if (request.imageUrls && request.imageUrls.length > SOLUTION_VALIDATION.MAX_IMAGES_PER_SOLUTION) {
        throw new Error(`Maximum ${SOLUTION_VALIDATION.MAX_IMAGES_PER_SOLUTION} images allowed per solution`);
      }

      // Validate visualizers
      if (request.visualizerFileIds && request.visualizerFileIds.length > SOLUTION_VALIDATION.MAX_VISUALIZERS_PER_SOLUTION) {
        throw new Error(`Maximum ${SOLUTION_VALIDATION.MAX_VISUALIZERS_PER_SOLUTION} HTML visualizers allowed per solution`);
      }

      const response = await solutionApiService.createSolution(questionId, request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create solution');
    },
    onSuccess: (newSolution) => {
      // Invalidate and refetch solutions list and stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOLUTIONS.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOLUTIONS.BY_QUESTION(newSolution.questionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOLUTIONS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      
      toast.success(`Solution for "${newSolution.questionTitle}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create solution: ${error.message}`);
    },
  });
}

/**
 * Hook to update solution (Admin/SuperAdmin only)
 */
export function useUpdateSolution() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateSolutionRequest }): Promise<Solution> => {
      // Frontend validation (same as create)
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can update solutions');
      }

      // Validate content
      if (!request.content.trim()) {
        throw new Error('Solution content is required');
      }
      if (request.content.trim().length < SOLUTION_VALIDATION.CONTENT_MIN_LENGTH) {
        throw new Error(`Content must be at least ${SOLUTION_VALIDATION.CONTENT_MIN_LENGTH} characters long`);
      }
      if (request.content.trim().length > SOLUTION_VALIDATION.CONTENT_MAX_LENGTH) {
        throw new Error(`Content must be less than ${SOLUTION_VALIDATION.CONTENT_MAX_LENGTH} characters`);
      }

      const response = await solutionApiService.updateSolution(id, request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update solution');
    },
    onSuccess: (updatedSolution, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOLUTIONS.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOLUTIONS.DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOLUTIONS.BY_QUESTION(updatedSolution.questionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOLUTIONS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      
      toast.success(`Solution for "${updatedSolution.questionTitle}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update solution: ${error.message}`);
    },
  });
}

/**
 * Hook to delete solution (Admin/SuperAdmin only)
 */
export function useDeleteSolution() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: string }> => {
      // Frontend validation
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can delete solutions');
      }

      const response = await solutionApiService.deleteSolution(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to delete solution');
    },
    onSuccess: (result, solutionId) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOLUTIONS.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOLUTIONS.DETAIL(solutionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOLUTIONS.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });

      toast.success('Solution deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete solution: ${error.message}`);
    },
  });
}

/**
 * Hook to upload solution image (Admin/SuperAdmin only)
 */
export function useUploadSolutionImage() {
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

      const response = await fileUploadApiService.uploadSolutionImage(file);
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
 * Hook to validate YouTube link
 */
export function useValidateYoutubeLink() {
  return useMutation({
    mutationFn: async (youtubeLink: string): Promise<LinkValidationResponse> => {
      const response = await solutionApiService.validateYoutubeLink(youtubeLink);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to validate YouTube link');
    },
    onError: (error: Error) => {
      toast.error(`YouTube link validation failed: ${error.message}`);
    },
  });
}

/**
 * Hook to validate Google Drive link
 */
export function useValidateDriveLink() {
  return useMutation({
    mutationFn: async (driveLink: string): Promise<LinkValidationResponse> => {
      const response = await solutionApiService.validateDriveLink(driveLink);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to validate Google Drive link');
    },
    onError: (error: Error) => {
      toast.error(`Google Drive link validation failed: ${error.message}`);
    },
  });
}

/**
 * Hook to upload HTML visualizer file
 */
export function useUploadVisualizerFile() {
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ solutionId, file }: { solutionId: string; file: File }): Promise<{
      fileId: string;
      filename: string;
      originalFileName: string;
      size: number;
      solutionId: string;
      uploadedAt: number;
    }> => {
      // Frontend validation
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can upload HTML visualizers');
      }

      // Validate HTML file
      if (!file.name.toLowerCase().endsWith('.html')) {
        throw new Error('Only HTML files are allowed for visualizers');
      }

      const maxSize = 500 * 1024; // 500KB
      if (file.size > maxSize) {
        throw new Error('HTML file size cannot exceed 500KB');
      }

      const response = await solutionApiService.uploadVisualizerFile(solutionId, file);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to upload visualizer file');
    },
    onSuccess: (result, variables) => {
      // FIXED: Show proper success message with filename
      const fileName = result.originalFileName || variables.file.name;
      toast.success(
        `"${fileName}" uploaded successfully!`,
        {
          duration: 2500,
          icon: "🚀",
        }
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload visualizer: ${error.message}`);
    },
  });
}

/**
 * Hook to get visualizer files for solution
 */
export function useVisualizerFilesBySolution(solutionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.SOLUTIONS.VISUALIZERS(solutionId),
    queryFn: async () => {
      const response = await solutionApiService.getVisualizerFilesBySolution(solutionId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch visualizer files');
    },
    enabled: !!solutionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to delete visualizer file
 */
export function useDeleteVisualizerFile() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (fileId: string) => {
      if (!isAdmin()) {
        throw new Error('Only Admins and Super Admins can delete visualizer files');
      }

      const response = await solutionApiService.deleteVisualizerFile(fileId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to delete visualizer file');
    },
    onSuccess: () => {
      // Invalidate all visualizer queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOLUTIONS.VISUALIZERS() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOLUTIONS.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOLUTIONS.STATS });
      
      toast.success('Visualizer removed successfully', {
        duration: 2000,
        icon: "🗑️",
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete visualizer: ${error.message}`);
    },
  });
}