// src/lib/api/coursesService.ts

import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';
import type {
  Topic,
  Document,
  CreateTopicRequest,
  UpdateTopicRequest,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  CourseImageUploadResponse,
  CourseImageConfig,
  CourseStats
} from '@/types/courses';

class CoursesApiService {
  // ==================== ADMIN ENDPOINTS ====================
  
  /**
   * Create a new topic (Admin/SuperAdmin only)
   * POST /api/courses/topics
   */
  async createTopic(data: CreateTopicRequest): Promise<ApiResponse<Topic>> {
    return await apiClient.post<Topic>('/courses/topics', data);
  }

  /**
   * Update a topic (Admin/SuperAdmin only)
   * PUT /api/courses/topics/{topicId}
   */
  async updateTopic(topicId: string, data: UpdateTopicRequest): Promise<ApiResponse<Topic>> {
    return await apiClient.put<Topic>(`/courses/topics/${topicId}`, data);
  }

  /**
   * Delete a topic (Admin/SuperAdmin only) - CASCADE deletes all docs and images!
   * DELETE /api/courses/topics/{topicId}
   */
  async deleteTopic(topicId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return await apiClient.delete<{ success: boolean; message: string }>(`/courses/topics/${topicId}`);
  }

  /**
   * Create a new document (Admin/SuperAdmin only)
   * POST /api/courses/docs
   */
  async createDocument(data: CreateDocumentRequest): Promise<ApiResponse<Document>> {
    return await apiClient.post<Document>('/courses/docs', data);
  }

  /**
   * Update a document (Admin/SuperAdmin only)
   * PUT /api/courses/docs/{docId}
   */
  async updateDocument(docId: string, data: UpdateDocumentRequest): Promise<ApiResponse<Document>> {
    return await apiClient.put<Document>(`/courses/docs/${docId}`, data);
  }

  /**
   * Delete a document (Admin/SuperAdmin only) - Deletes all images!
   * DELETE /api/courses/docs/{docId}
   */
  async deleteDocument(docId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return await apiClient.delete<{ success: boolean; message: string }>(`/courses/docs/${docId}`);
  }

  /**
   * Upload image for courses (Admin/SuperAdmin only)
   * POST /api/courses/images
   */
  async uploadImage(file: File): Promise<ApiResponse<CourseImageUploadResponse>> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<{ success: boolean; data: CourseImageUploadResponse; message: string }>(
      '/courses/images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.success && response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      error: !response.success ? response.error : 'Upload failed',
      message: !response.success ? response.message : 'Failed to upload image'
    };
  }

  /**
   * Delete an image (Admin/SuperAdmin only)
   * DELETE /api/courses/images?imageUrl={url}
   */
  async deleteImage(imageUrl: string): Promise<ApiResponse<{ result: string }>> {
    const response = await apiClient.delete<{ success: boolean; data: { result: string }; message: string }>(
      `/courses/images?imageUrl=${encodeURIComponent(imageUrl)}`
    );

    if (response.success && response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      error: !response.success ? response.error : 'Delete failed',
      message: !response.success ? response.message : 'Failed to delete image'
    };
  }

  /**
   * Get image upload configuration
   * GET /api/courses/images/config
   */
  async getImageConfig(): Promise<ApiResponse<CourseImageConfig>> {
    const response = await apiClient.get<{ success: boolean; data: CourseImageConfig }>('/courses/images/config');
    
    if (response.success && response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      error: 'Failed to load config',
      message: 'Unable to retrieve image upload configuration'
    };
  }

  // ==================== USER ENDPOINTS (Available to all authenticated users) ====================

  /**
   * Get all topics with doc counts
   * GET /api/courses/topics
   */
  async getAllTopics(): Promise<ApiResponse<{ data: Topic[]; success: boolean; count: number }>> {
    const response = await apiClient.get<{ data: Topic[]; success: boolean; count: number }>('/courses/topics');
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data
      };
    }

    return {
      success: false,
      error: 'Failed to fetch topics',
      message: response.message || 'Unable to retrieve topics'
    };
  }

  /**
   * Get single topic by ID
   * GET /api/courses/topics/{topicId}
   */
  async getTopicById(topicId: string): Promise<ApiResponse<Topic>> {
    const response = await apiClient.get<{ data: Topic; success: boolean }>(`/courses/topics/${topicId}`);
    
    if (response.success && response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      error: 'Failed to fetch topic',
      message: response.message || 'Unable to retrieve topic'
    };
  }

  /**
   * Get all docs in a topic (WITHOUT full content)
   * GET /api/courses/topics/{topicId}/docs
   */
  async getDocsByTopic(topicId: string): Promise<ApiResponse<{ 
    docs: Document[]; 
    success: boolean; 
    count: number; 
    topic: Topic 
  }>> {
    const response = await apiClient.get<{ 
      docs: Document[]; 
      success: boolean; 
      count: number; 
      topic: Topic 
    }>(`/courses/topics/${topicId}/docs`);
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data
      };
    }

    return {
      success: false,
      error: 'Failed to fetch documents',
      message: response.message || 'Unable to retrieve documents'
    };
  }

  /**
   * Get single document (WITH full content)
   * GET /api/courses/docs/{docId}
   */
  async getDocumentById(docId: string): Promise<ApiResponse<Document>> {
    const response = await apiClient.get<{ data: Document; success: boolean }>(`/courses/docs/${docId}`);
    
    if (response.success && response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      error: 'Failed to fetch document',
      message: response.message || 'Unable to retrieve document'
    };
  }

  /**
   * Get course statistics
   * GET /api/courses/stats
   */
  async getCourseStats(): Promise<ApiResponse<CourseStats>> {
    const response = await apiClient.get<{ data: CourseStats; success: boolean }>('/courses/stats');
    
    if (response.success && response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      error: 'Failed to fetch stats',
      message: response.message || 'Unable to retrieve statistics'
    };
  }
}

// Export singleton instance
export const coursesApiService = new CoursesApiService();
export default coursesApiService;