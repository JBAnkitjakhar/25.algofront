// src/having/adminQuestions/service.ts

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  QuestionsSummaryResponse,
  CategoriesMetadataResponse,
  QuestionDetail,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  QuestionWithCategory,
  ImageUploadResponse,
} from "./types";
import { ADMIN_QUESTIONS_ENDPOINTS } from "./constants";

class AdminQuestionsService {
  /**
   * Fetch questions summary with pagination
   */
  async getQuestionsSummary(params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<QuestionsSummaryResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined)
        queryParams.append("page", params.page.toString());
      if (params?.size !== undefined)
        queryParams.append("size", params.size.toString());

      const url = queryParams.toString()
        ? `${ADMIN_QUESTIONS_ENDPOINTS.SUMMARY}?${queryParams}`
        : ADMIN_QUESTIONS_ENDPOINTS.SUMMARY;

      return await apiClient.get<QuestionsSummaryResponse>(url);
    } catch (error) {
      console.error("Error fetching questions summary:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to load questions",
      };
    }
  }

  /**
   * Fetch categories metadata
   */
  async getCategoriesMetadata(): Promise<
    ApiResponse<CategoriesMetadataResponse>
  > {
    try {
      return await apiClient.get<CategoriesMetadataResponse>(
        ADMIN_QUESTIONS_ENDPOINTS.CATEGORIES_METADATA
      );
    } catch (error) {
      console.error("Error fetching categories metadata:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to load categories",
      };
    }
  }

  /**
   * Fetch full question detail by ID
   */
  async getQuestionById(id: string): Promise<ApiResponse<QuestionDetail>> {
    try {
      return await apiClient.get<QuestionDetail>(
        ADMIN_QUESTIONS_ENDPOINTS.GET_BY_ID(id)
      );
    } catch (error) {
      console.error("Error fetching question:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to load question",
      };
    }
  }

  /**
   * Create new question
   */
  async createQuestion(
    request: CreateQuestionRequest
  ): Promise<ApiResponse<QuestionDetail>> {
    try {
      return await apiClient.post<QuestionDetail>(
        ADMIN_QUESTIONS_ENDPOINTS.CREATE,
        request
      );
    } catch (error) {
      console.error("Error creating question:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to create question",
      };
    }
  }

  /**
   * Update existing question
   */
  async updateQuestion(
    id: string,
    request: UpdateQuestionRequest
  ): Promise<ApiResponse<QuestionDetail>> {
    try {
      return await apiClient.put<QuestionDetail>(
        ADMIN_QUESTIONS_ENDPOINTS.UPDATE(id),
        request
      );
    } catch (error) {
      console.error("Error updating question:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to update question",
      };
    }
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: string): Promise<ApiResponse<{ success: string }>> {
    try {
      return await apiClient.delete<{ success: string }>(
        ADMIN_QUESTIONS_ENDPOINTS.DELETE(id)
      );
    } catch (error) {
      console.error("Error deleting question:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to delete question",
      };
    }
  }

  /**
   * Upload question image
   */
  async uploadImage(file: File): Promise<ApiResponse<ImageUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append("image", file);

      // ✅ FIXED: Specify the full response structure
      const response = await apiClient.post<{
        success: boolean;
        data: ImageUploadResponse;
        message: string;
      }>(ADMIN_QUESTIONS_ENDPOINTS.UPLOAD_IMAGE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // ✅ FIXED: Unwrap the nested response structure
      if (response.success && response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data, // ← Access nested data
        };
      }

      if (!response.success) {
        return {
          success: false,
          error: response.error || "Upload failed",
          message: response.message || "Failed to upload image",
        };
      }

      return {
        success: false,
        error: "Upload failed",
        message: response.data?.message || "Failed to upload image",
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

  /**
   * Merge questions with category names (O(n) with O(1) lookup)
   */
  mergeQuestionsWithCategories(
    questions: QuestionsSummaryResponse,
    categories: CategoriesMetadataResponse
  ): QuestionWithCategory[] {
    // Create O(1) lookup map
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

    // Map questions with category names
    return questions.content.map((question) => ({
      ...question,
      categoryName: categoryMap.get(question.categoryId) || "Unknown Category",
    }));
  }
}

export const adminQuestionsService = new AdminQuestionsService();
