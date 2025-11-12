// src/lib/api/solutionService.ts - Solution management API service

import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";
import type {
  Solution,
  SolutionPageResponse,
  SolutionStats,
  CreateSolutionRequest,
  UpdateSolutionRequest,
  LinkValidationResponse,
} from "@/types";
import { SOLUTION_ENDPOINTS } from "@/constants";

class SolutionApiService {
  /**
   * Get all solutions with pagination (Admin/SuperAdmin only)
   * Matches: GET /api/solutions?page=0&size=20
   */
  async getAllSolutions(params?: {
    page?: number;
    size?: number;
    questionId?: string;
    creatorId?: string;
  }): Promise<ApiResponse<SolutionPageResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params?.questionId) queryParams.append("questionId", params.questionId);
    if (params?.creatorId) queryParams.append("creatorId", params.creatorId);

    const url = queryParams.toString()
      ? `${SOLUTION_ENDPOINTS.LIST}?${queryParams.toString()}`
      : SOLUTION_ENDPOINTS.LIST;

    return await apiClient.get<SolutionPageResponse>(url);
  }

  /**
   * Get solution by ID
   * Matches: GET /api/solutions/{id}
   */
  async getSolutionById(id: string): Promise<ApiResponse<Solution>> {
    return await apiClient.get<Solution>(SOLUTION_ENDPOINTS.GET_BY_ID(id));
  }

  /**
   * Get solutions for specific question
   * Matches: GET /api/solutions/question/{questionId}
   */
  async getSolutionsByQuestion(
    questionId: string
  ): Promise<ApiResponse<Solution[]>> {
    return await apiClient.get<Solution[]>(
      SOLUTION_ENDPOINTS.BY_QUESTION(questionId)
    );
  }

  /**
   * Create new solution (Admin/SuperAdmin only)
   * Matches: POST /api/solutions/question/{questionId}
   */
  async createSolution(
    questionId: string,
    request: CreateSolutionRequest
  ): Promise<ApiResponse<Solution>> {
    return await apiClient.post<Solution>(
      SOLUTION_ENDPOINTS.CREATE_FOR_QUESTION(questionId),
      {
        content: request.content,
        codeSnippet: request.codeSnippet,
        driveLink: request.driveLink,
        youtubeLink: request.youtubeLink,
        imageUrls: request.imageUrls,
        visualizerFileIds: request.visualizerFileIds,
      }
    );
  }

  /**
   * Update solution (Admin/SuperAdmin only)
   * Matches: PUT /api/solutions/{id}
   */
  async updateSolution(
    id: string,
    request: UpdateSolutionRequest
  ): Promise<ApiResponse<Solution>> {
    return await apiClient.put<Solution>(SOLUTION_ENDPOINTS.UPDATE(id), {
      content: request.content,
      codeSnippet: request.codeSnippet,
      driveLink: request.driveLink,
      youtubeLink: request.youtubeLink,
      imageUrls: request.imageUrls,
      visualizerFileIds: request.visualizerFileIds,
    });
  }

  /**
   * Delete solution (Admin/SuperAdmin only)
   * Matches: DELETE /api/solutions/{id}
   */
  async deleteSolution(id: string): Promise<ApiResponse<{ success: string }>> {
    return await apiClient.delete<{ success: string }>(
      SOLUTION_ENDPOINTS.DELETE(id)
    );
  }

  /**
   * Validate YouTube link
   * Matches: POST /api/solutions/validate-youtube
   */
  async validateYoutubeLink(
    youtubeLink: string
  ): Promise<ApiResponse<LinkValidationResponse>> {
    return await apiClient.post<LinkValidationResponse>(
      SOLUTION_ENDPOINTS.VALIDATE_YOUTUBE,
      {
        youtubeLink,
      }
    );
  }

  /**
   * Validate Google Drive link
   * Matches: POST /api/solutions/validate-drive
   */
  async validateDriveLink(
    driveLink: string
  ): Promise<ApiResponse<LinkValidationResponse>> {
    return await apiClient.post<LinkValidationResponse>(
      SOLUTION_ENDPOINTS.VALIDATE_DRIVE,
      {
        driveLink,
      }
    );
  }

  /**
   * Add image to solution
   * Matches: POST /api/solutions/{id}/images
   */
  async addImageToSolution(
    id: string,
    imageUrl: string
  ): Promise<ApiResponse<Solution>> {
    return await apiClient.post<Solution>(
      SOLUTION_ENDPOINTS.ADD_IMAGE(id),
      null,
      {
        params: { imageUrl },
      }
    );
  }

  /**
   * Remove image from solution
   * Matches: DELETE /api/solutions/{id}/images
   */
  async removeImageFromSolution(
    id: string,
    imageUrl: string
  ): Promise<ApiResponse<Solution>> {
    return await apiClient.delete<Solution>(
      SOLUTION_ENDPOINTS.REMOVE_IMAGE(id),
      {
        params: { imageUrl },
      }
    );
  }

  /**
   * Add visualizer to solution
   * Matches: POST /api/solutions/{id}/visualizers
   */
  async addVisualizerToSolution(
    id: string,
    visualizerFileId: string
  ): Promise<ApiResponse<Solution>> {
    return await apiClient.post<Solution>(
      SOLUTION_ENDPOINTS.ADD_VISUALIZER(id),
      null,
      {
        params: { visualizerFileId },
      }
    );
  }

  /**
   * Remove visualizer from solution
   * Matches: DELETE /api/solutions/{id}/visualizers
   */
  async removeVisualizerFromSolution(
    id: string,
    visualizerFileId: string
  ): Promise<ApiResponse<Solution>> {
    return await apiClient.delete<Solution>(
      SOLUTION_ENDPOINTS.REMOVE_VISUALIZER(id),
      {
        params: { visualizerFileId },
      }
    );
  }

  /**
   * Get solution statistics (Admin/SuperAdmin only)
   * Matches: GET /api/solutions/stats
   */
  async getSolutionStats(): Promise<ApiResponse<SolutionStats>> {
    return await apiClient.get<SolutionStats>(SOLUTION_ENDPOINTS.STATS);
  }

  /**
   * Get solutions with images (Admin/SuperAdmin only)
   * Matches: GET /api/solutions/with-images
   */
  async getSolutionsWithImages(): Promise<ApiResponse<Solution[]>> {
    return await apiClient.get<Solution[]>(SOLUTION_ENDPOINTS.WITH_IMAGES);
  }

  /**
   * Get solutions with visualizers (Admin/SuperAdmin only)
   * Matches: GET /api/solutions/with-visualizers
   */
  async getSolutionsWithVisualizers(): Promise<ApiResponse<Solution[]>> {
    return await apiClient.get<Solution[]>(SOLUTION_ENDPOINTS.WITH_VISUALIZERS);
  }

  /**
   * Get solutions with YouTube videos (Admin/SuperAdmin only)
   * Matches: GET /api/solutions/with-youtube
   */
  async getSolutionsWithYoutubeVideos(): Promise<ApiResponse<Solution[]>> {
    return await apiClient.get<Solution[]>(SOLUTION_ENDPOINTS.WITH_YOUTUBE);
  }

  /**
   * Get solutions by creator (Admin/SuperAdmin only)
   * Matches: GET /api/solutions/creator/{creatorId}
   */
  async getSolutionsByCreator(
    creatorId: string,
    params?: {
      page?: number;
      size?: number;
    }
  ): Promise<ApiResponse<SolutionPageResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());

    const url = queryParams.toString()
      ? `${SOLUTION_ENDPOINTS.BY_CREATOR(creatorId)}?${queryParams.toString()}`
      : SOLUTION_ENDPOINTS.BY_CREATOR(creatorId);

    return await apiClient.get<SolutionPageResponse>(url);
  }

  /**
   * Upload HTML visualizer file (Admin/SuperAdmin only)
   * Matches: POST /api/files/visualizers/{solutionId}
   */
  async uploadVisualizerFile(
    solutionId: string,
    file: File
  ): Promise<
    ApiResponse<{
      fileId: string;
      filename: string;
      originalFileName: string;
      size: number;
      solutionId: string;
      uploadedAt: number;
    }>
  > {
    const formData = new FormData();
    formData.append("visualizer", file);

    return await apiClient.post(`/files/visualizers/${solutionId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * Get visualizer files for solution
   * Matches: GET /api/files/solutions/{solutionId}/visualizers
   */
  async getVisualizerFilesBySolution(solutionId: string): Promise<
    ApiResponse<{
      success: boolean;
      data: Array<{
        fileId: string;
        filename: string;
        size: number;
        uploadDate: string;
        originalFileName: string;
      }>;
      count: number;
      solutionId: string;
    }>
  > {
    return await apiClient.get(`/files/solutions/${solutionId}/visualizers`);
  }

  /**
   * Delete visualizer file (Admin/SuperAdmin only)
   * Matches: DELETE /api/files/visualizers/{fileId}
   */
  async deleteVisualizerFile(fileId: string): Promise<
    ApiResponse<{
      success: boolean;
      message: string;
      fileId: string;
    }>
  > {
    return await apiClient.delete(`/files/visualizers/${fileId}`);
  }
 
  /**
   * FIXED: Get visualizer file URL for direct access
   * This method was missing and causing the admin solutions page to fail
   */
  getVisualizerFileUrl(fileId: string): string {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
    return `${apiBaseUrl}/files/visualizers/${fileId}`;
  }

  /**
   * FIXED: Get visualizer download URL (Admin only)
   */
  getVisualizerDownloadUrl(fileId: string): string {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
    return `${apiBaseUrl}/files/visualizers/${fileId}/download`;
  }

  /**
   * FIXED: Get visualizer metadata (Admin only)
   */
  async getVisualizerMetadata(fileId: string): Promise<
    ApiResponse<{
      fileId: string;
      filename: string;
      size: number;
      uploadDate: string;
      originalFileName?: string;
      contentType: string;
      solutionId: string;
    }>
  > {
    return await apiClient.get(`/files/visualizers/${fileId}/metadata`);
  }

  /**
   * FIXED: Helper method to handle API responses properly
   */
}

export const solutionApiService = new SolutionApiService();
