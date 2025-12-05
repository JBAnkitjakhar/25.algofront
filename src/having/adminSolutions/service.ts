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
  VisualizerFile,
} from "./types";
import { ADMIN_SOLUTIONS_ENDPOINTS } from "./constants";

class AdminSolutionsService {
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

  async uploadVisualizer(solutionId: string, file: File): Promise<ApiResponse<{
    fileId: string;
    filename: string;
  }>> {
    try {
      const formData = new FormData();
      formData.append("visualizer", file);

      // console.log("Uploading visualizer:", { solutionId, fileName: file.name, fileSize: file.size });

      const response = await apiClient.post<{
        originalFileName: string;
        filename: string;
        fileId: string;
        size: number;
        uploadDate: string;
        solutionId: string;
        isInteractive: boolean;
      }>(
        ADMIN_SOLUTIONS_ENDPOINTS.UPLOAD_VISUALIZER(solutionId), 
        formData, 
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // console.log("Upload response:", response);

      if (response.success && response.data) {
        return { 
          success: true, 
          data: {
            fileId: response.data.fileId,
            filename: response.data.filename
          }
        };
      }

      return {
        success: false,
        error: "Upload failed",
        message: "Failed to upload visualizer",
      };
    } catch (error: unknown) {
      console.error("Error uploading visualizer:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload visualizer";
      return {
        success: false,
        error: "Unexpected error",
        message: errorMessage,
      };
    }
  }

  async getVisualizersBySolution(
    solutionId: string
  ): Promise<ApiResponse<VisualizerFilesResponse>> {
    try {
      const response = await apiClient.get<VisualizerFile[]>(
        ADMIN_SOLUTIONS_ENDPOINTS.VISUALIZERS_BY_SOLUTION(solutionId)
      );

      // console.log("Get visualizers response:", response);

      if (response.success && Array.isArray(response.data)) {
        return { 
          success: true, 
          data: { data: response.data }
        };
      }

      return {
        success: false,
        error: "Fetch failed",
        message: "Failed to load visualizers",
      };
    } catch (error) {
      console.error("Error fetching visualizers:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to load visualizers",
      };
    }
  }

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

  getVisualizerFileUrl(fileId: string): string {
    return ADMIN_SOLUTIONS_ENDPOINTS.GET_VISUALIZER(fileId);
  }

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