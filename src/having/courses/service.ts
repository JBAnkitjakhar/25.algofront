// src/courses/service.ts

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  Topic,
  Document,
  CreateTopicRequest,
  UpdateTopicRequest,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  CourseImageUploadResponse,
  CourseImageConfig,
  CourseStats,
  TopicsListResponse,
  DocsByTopicResponse,
  MoveDocumentRequest,
} from "./types";
import { COURSES_ENDPOINTS } from "./constants";

class CoursesService {
  //create topic
  async createTopic(data: CreateTopicRequest): Promise<ApiResponse<Topic>> {
    const response = await apiClient.post<{
      data: Topic;
      success: boolean;
      message: string;
    }>(COURSES_ENDPOINTS.CREATE_TOPIC, data);

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Create failed",
        message: response.message || "Failed to create topic",
      };
    }

    return {
      success: false,
      error: "Create failed",
      message: response.data?.message || "Failed to create topic",
    };
  }

  //update topic
  async updateTopic(
    topicId: string,
    data: UpdateTopicRequest
  ): Promise<ApiResponse<Topic>> {
    const response = await apiClient.put<{
      data: Topic;
      success: boolean;
      message: string;
    }>(COURSES_ENDPOINTS.UPDATE_TOPIC(topicId), data);

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Update failed",
        message: response.message || "Failed to update topic",
      };
    }

    return {
      success: false,
      error: "Update failed",
      message: response.data?.message || "Failed to update topic",
    };
  }

  //toggle visibility
  async toggleTopicVisibility(topicId: string): Promise<ApiResponse<Topic>> {
    const url = COURSES_ENDPOINTS.TOGGLE_VISIBILITY(topicId);

    const response = await apiClient.put<{
      data: Topic;
      success: boolean;
      message: string;
    }>(url, {}); // Empty object as body

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Toggle failed",
        message: response.message || "Failed to toggle visibility",
      };
    }

    return {
      success: false,
      error: "Toggle failed",
      message: response.data?.message || "Failed to toggle visibility",
    };
  }

  //delete topic
  async deleteTopic(
    topicId: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      COURSES_ENDPOINTS.DELETE_TOPIC(topicId)
    );
  }

  // all topics for admin
  async getAllTopicsAdmin(): Promise<ApiResponse<TopicsListResponse>> {
    const response = await apiClient.get<TopicsListResponse>(
      COURSES_ENDPOINTS.ALL_TOPICS_ADMIN
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    // Type narrowing - now TypeScript knows response is ApiError
    if (!response.success) {
      return {
        success: false,
        error: response.error || "Fetch failed",
        message: response.message || "Failed to fetch topics",
      };
    }

    // Fallback (should never reach here)
    return {
      success: false,
      error: "Fetch failed",
      message: "Failed to fetch topics",
    };
  }

  //create doc
  async createDocument(
    data: CreateDocumentRequest
  ): Promise<ApiResponse<Document>> {
    const response = await apiClient.post<{
      data: Document;
      success: boolean;
      message: string;
    }>(COURSES_ENDPOINTS.CREATE_DOC, data);

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Create failed",
        message: response.message || "Failed to create document",
      };
    }

    return {
      success: false,
      error: "Create failed",
      message: response.data?.message || "Failed to create document",
    };
  }

  //update doc
  async updateDocument(
    docId: string,
    data: UpdateDocumentRequest
  ): Promise<ApiResponse<Document>> {
    // Add debugging
    // console.log("🔍 updateDocument called with:", { docId, data });
    const url = COURSES_ENDPOINTS.UPDATE_DOC(docId);
    // console.log("🔍 UPDATE_DOC URL:", url);
    // console.log("🔍 Full URL would be:", `${API_BASE_URL}${url}`);

    try {
      const response = await apiClient.put<{
        data: Document;
        success: boolean;
        message: string;
      }>(url, data);

      // console.log("🔍 Response received:", response);

      if (response.success && response.data && response.data.success) {
        return { success: true, data: response.data.data };
      }

      if (!response.success) {
        console.error("❌ Update failed:", response);
        return {
          success: false,
          error: response.error || "Update failed",
          message: response.message || "Failed to update document",
        };
      }

      return {
        success: false,
        error: "Update failed",
        message: response.data?.message || "Failed to update document",
      };
    } catch (error) {
      console.error("❌ Exception in updateDocument:", error);
      throw error;
    }
  }
  //delete doc
  async deleteDocument(
    docId: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      COURSES_ENDPOINTS.DELETE_DOC(docId)
    );
  }

  //upload image
  async uploadImage(
    file: File
  ): Promise<ApiResponse<CourseImageUploadResponse>> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post<{
      success: boolean;
      data: CourseImageUploadResponse;
      message: string;
    }>(COURSES_ENDPOINTS.UPLOAD_IMAGE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
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
  }

  //delete image
  async deleteImage(
    imageUrl: string
  ): Promise<ApiResponse<{ result: string }>> {
    const response = await apiClient.delete<{
      success: boolean;
      data: { result: string };
      message: string;
    }>(
      `${COURSES_ENDPOINTS.DELETE_IMAGE}?imageUrl=${encodeURIComponent(
        imageUrl
      )}`
    );

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Delete failed",
        message: response.message || "Failed to delete image",
      };
    }

    return {
      success: false,
      error: "Delete failed",
      message: response.data?.message || "Failed to delete image",
    };
  }

  //get image config
  async getImageConfig(): Promise<ApiResponse<CourseImageConfig>> {
    const response = await apiClient.get<{
      success: boolean;
      data: CourseImageConfig;
    }>(COURSES_ENDPOINTS.IMAGE_CONFIG);

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Failed to load config",
        message:
          response.message || "Unable to retrieve image upload configuration",
      };
    }

    return {
      success: false,
      error: "Failed to load config",
      message: "Unable to retrieve image upload configuration",
    };
  }

  //get public topics
  async getPublicTopics(): Promise<ApiResponse<TopicsListResponse>> {
    const response = await apiClient.get<TopicsListResponse>(
      COURSES_ENDPOINTS.PUBLIC_TOPICS
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    // Type narrowing - now TypeScript knows response is ApiError
    if (!response.success) {
      return {
        success: false,
        error: response.error || "Fetch failed",
        message: response.message || "Failed to fetch topics",
      };
    }

    // Fallback (should never reach here)
    return {
      success: false,
      error: "Fetch failed",
      message: "Failed to fetch topics",
    };
  }

  async getTopicById(topicId: string): Promise<ApiResponse<Topic>> {
    const response = await apiClient.get<{ data: Topic; success: boolean }>(
      COURSES_ENDPOINTS.GET_TOPIC(topicId)
    );

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Fetch failed",
        message: response.message || "Failed to fetch topic",
      };
    }

    return {
      success: false,
      error: "Fetch failed",
      message: "Failed to fetch topic",
    };
  }

  //get docs by topic
  async getDocsByTopic(
    topicId: string
  ): Promise<ApiResponse<DocsByTopicResponse>> {
    const response = await apiClient.get<DocsByTopicResponse>(
      COURSES_ENDPOINTS.GET_DOCS_BY_TOPIC(topicId)
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    // Type narrowing - now TypeScript knows response is ApiError
    if (!response.success) {
      return {
        success: false,
        error: response.error || "Fetch failed",
        message: response.message || "Failed to fetch documents",
      };
    }

    // Fallback (should never reach here)
    return {
      success: false,
      error: "Fetch failed",
      message: "Failed to fetch documents",
    };
  }

  //get doc by id
  async getDocumentById(docId: string): Promise<ApiResponse<Document>> {
    const response = await apiClient.get<{ data: Document; success: boolean }>(
      COURSES_ENDPOINTS.GET_DOC(docId)
    );

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Fetch failed",
        message: response.message || "Failed to fetch document",
      };
    }

    return {
      success: false,
      error: "Fetch failed",
      message: "Failed to fetch document",
    };
  }

  //get course stats
  async getCourseStats(): Promise<ApiResponse<CourseStats>> {
    const response = await apiClient.get<{
      data: CourseStats;
      success: boolean;
    }>(COURSES_ENDPOINTS.STATS);

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Fetch failed",
        message: response.message || "Failed to fetch statistics",
      };
    }

    return {
      success: false,
      error: "Fetch failed",
      message: "Failed to fetch statistics",
    };
  }

  async moveDocument(
    docId: string,
    data: MoveDocumentRequest
  ): Promise<ApiResponse<Document>> {
    const response = await apiClient.put<{
      data: Document;
      success: boolean;
      message: string;
    }>(COURSES_ENDPOINTS.MOVE_DOC(docId), data);

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Move failed",
        message: response.message || "Failed to move document",
      };
    }

    return {
      success: false,
      error: "Move failed",
      message: response.data?.message || "Failed to move document",
    };
  }
}

export const coursesService = new CoursesService();
