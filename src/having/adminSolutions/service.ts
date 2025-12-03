// src/having/adminSolutions/service.ts

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  SolutionsSummaryResponse,
  QuestionsMetadataResponse,
  SolutionDetail,
  CreateSolutionRequest,
  UpdateSolutionRequest,
  SolutionWithQuestion,
  VisualizerFilesResponse,
} from "./types";
import { ADMIN_SOLUTIONS_ENDPOINTS } from "./constants";

class AdminSolutionsService {
  // Fetch solutions summary with pagination
  async getSolutionsSummary(params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<SolutionsSummaryResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append("page", params.page.toString());
      if (params?.size !== undefined) queryParams.append("size", params.size.toString());

      const url = queryParams.toString()
        ? `${ADMIN_SOLUTIONS_ENDPOINTS.SUMMARY}?${queryParams}`
        : ADMIN_SOLUTIONS_ENDPOINTS.SUMMARY;

      return await apiClient.get<SolutionsSummaryResponse>(url);
    } catch (error) {
      console.error("Error fetching solutions summary:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to load solutions",
      };
    }
  }

  // Fetch questions metadata
  async getQuestionsMetadata(): Promise<ApiResponse<QuestionsMetadataResponse>> {
    try {
      return await apiClient.get<QuestionsMetadataResponse>(
        ADMIN_SOLUTIONS_ENDPOINTS.QUESTIONS_METADATA
      );
    } catch (error) {
      console.error("Error fetching questions metadata:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to load questions",
      };
    }
  }

  // Fetch solution detail by ID
  async getSolutionById(id: string): Promise<ApiResponse<SolutionDetail>> {
    try {
      return await apiClient.get<SolutionDetail>(
        ADMIN_SOLUTIONS_ENDPOINTS.GET_BY_ID(id)
      );
    } catch (error) {
      console.error("Error fetching solution:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to load solution",
      };
    }
  }

  // Create solution for question
  async createSolution(
    questionId: string,
    request: CreateSolutionRequest
  ): Promise<ApiResponse<SolutionDetail>> {
    try {
      return await apiClient.post<SolutionDetail>(
        ADMIN_SOLUTIONS_ENDPOINTS.CREATE_FOR_QUESTION(questionId),
        request
      );
    } catch (error) {
      console.error("Error creating solution:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to create solution",
      };
    }
  }

  // Update solution
  async updateSolution(
    id: string,
    request: UpdateSolutionRequest
  ): Promise<ApiResponse<SolutionDetail>> {
    try {
      return await apiClient.put<SolutionDetail>(
        ADMIN_SOLUTIONS_ENDPOINTS.UPDATE(id),
        request
      );
    } catch (error) {
      console.error("Error updating solution:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to update solution",
      };
    }
  }

  // Delete solution
  async deleteSolution(id: string): Promise<ApiResponse<{ success: string }>> {
    try {
      return await apiClient.delete<{ success: string }>(
        ADMIN_SOLUTIONS_ENDPOINTS.DELETE(id)
      );
    } catch (error) {
      console.error("Error deleting solution:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to delete solution",
      };
    }
  }

  // Upload solution image
  async uploadImage(file: File): Promise<ApiResponse<{
    secure_url: string;
    public_id: string;
  }>> {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiClient.post<{
        success: boolean;
        data: { secure_url: string; public_id: string };
      }>(ADMIN_SOLUTIONS_ENDPOINTS.UPLOAD_IMAGE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.success && response.data?.success) {
        return { success: true, data: response.data.data };
      }

      return {
        success: false,
        error: "Upload failed",
        message: "Failed to upload image",
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to upload image",
      };
    }
  }

  // Validate YouTube link
  async validateYoutubeLink(link: string): Promise<ApiResponse<{
    valid: boolean;
    error?: string;
  }>> {
    try {
      return await apiClient.post(ADMIN_SOLUTIONS_ENDPOINTS.VALIDATE_YOUTUBE, { link });
    } catch (error) {
      console.error("Error validating YouTube link:", error);
      return {
        success: false,
        error: "Validation failed",
        message: "Failed to validate YouTube link",
      };
    }
  }

  // Validate Drive link
  async validateDriveLink(link: string): Promise<ApiResponse<{
    valid: boolean;
    error?: string;
  }>> {
    try {
      return await apiClient.post(ADMIN_SOLUTIONS_ENDPOINTS.VALIDATE_DRIVE, { link });
    } catch (error) {
      console.error("Error validating Drive link:", error);
      return {
        success: false,
        error: "Validation failed",
        message: "Failed to validate Drive link",
      };
    }
  }

  // Upload visualizer file
  async uploadVisualizer(solutionId: string, file: File): Promise<ApiResponse<{
    fileId: string;
    filename: string;
  }>> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<{
        success: boolean;
        data: { fileId: string; filename: string };
      }>(ADMIN_SOLUTIONS_ENDPOINTS.UPLOAD_VISUALIZER(solutionId), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.success && response.data?.success) {
        return { success: true, data: response.data.data };
      }

      return {
        success: false,
        error: "Upload failed",
        message: "Failed to upload visualizer",
      };
    } catch (error) {
      console.error("Error uploading visualizer:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to upload visualizer",
      };
    }
  }

  // Get visualizers for solution
  async getVisualizersBySolution(
    solutionId: string
  ): Promise<ApiResponse<VisualizerFilesResponse>> {
    try {
      return await apiClient.get<VisualizerFilesResponse>(
        ADMIN_SOLUTIONS_ENDPOINTS.VISUALIZERS_BY_SOLUTION(solutionId)
      );
    } catch (error) {
      console.error("Error fetching visualizers:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to load visualizers",
      };
    }
  }

  // Delete visualizer file
  async deleteVisualizer(fileId: string): Promise<ApiResponse<{ success: string }>> {
    try {
      return await apiClient.delete(ADMIN_SOLUTIONS_ENDPOINTS.DELETE_VISUALIZER(fileId));
    } catch (error) {
      console.error("Error deleting visualizer:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to delete visualizer",
      };
    }
  }

  // Get visualizer file URL
  getVisualizerFileUrl(fileId: string): string {
    return ADMIN_SOLUTIONS_ENDPOINTS.GET_VISUALIZER(fileId);
  }

  // Merge solutions with question data (O(n) with O(1) lookup)
  mergeSolutionsWithQuestions(
    solutions: SolutionsSummaryResponse,
    questions: QuestionsMetadataResponse
  ): SolutionWithQuestion[] {
    const questionsMap = questions.questions;

    return solutions.content.map((solution) => {
      const question = questionsMap[solution.questionId];
      return {
        ...solution,
        questionTitle: question?.title || "Unknown Question",
        questionLevel: question?.level || "MEDIUM",
        categoryId: question?.categoryId || "",
      };
    });
  }
}

export const adminSolutionsService = new AdminSolutionsService();