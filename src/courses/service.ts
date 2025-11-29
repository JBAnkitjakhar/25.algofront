// src/courses/service.ts  

import { apiClient } from '@/lib/api/client';
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
  CourseStats,
  TopicsListResponse,
  DocsByTopicResponse
} from './types';
import { COURSES_ENDPOINTS } from './constants';

class CoursesService {
  async createTopic(data: CreateTopicRequest): Promise<ApiResponse<Topic>> {
    const response = await apiClient.post<{ data: Topic; success: boolean; message: string }>(
      COURSES_ENDPOINTS.CREATE_TOPIC, 
      data
    );

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    return {
      success: false,
      error: response.success ? 'Create failed' : (response.error || 'Create failed'),
      message: response.success ? (response.data?.message || 'Failed to create topic') : (response.message || 'Failed to create topic')
    };
  }

  async updateTopic(topicId: string, data: UpdateTopicRequest): Promise<ApiResponse<Topic>> {
    const response = await apiClient.put<{ data: Topic; success: boolean; message: string }>(
      COURSES_ENDPOINTS.UPDATE_TOPIC(topicId),
      data
    );

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    return {
      success: false,
      error: response.success ? 'Update failed' : (response.error || 'Update failed'),
      message: response.success ? (response.data?.message || 'Failed to update topic') : (response.message || 'Failed to update topic')
    };
  }

  async toggleTopicVisibility(topicId: string): Promise<ApiResponse<Topic>> {
    const response = await apiClient.request<{ data: Topic; success: boolean; message: string }>({
      method: 'PATCH',
      url: COURSES_ENDPOINTS.TOGGLE_VISIBILITY(topicId)
    });

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    return {
      success: false,
      error: response.success ? 'Toggle failed' : (response.error || 'Toggle failed'),
      message: response.success ? (response.data?.message || 'Failed to toggle visibility') : (response.message || 'Failed to toggle visibility')
    };
  }

  async deleteTopic(topicId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      COURSES_ENDPOINTS.DELETE_TOPIC(topicId)
    );
  }

  async getAllTopicsAdmin(): Promise<ApiResponse<TopicsListResponse>> {
    return await apiClient.get<TopicsListResponse>(COURSES_ENDPOINTS.ALL_TOPICS_ADMIN);
  }

  async createDocument(data: CreateDocumentRequest): Promise<ApiResponse<Document>> {
    const response = await apiClient.post<{ data: Document; success: boolean; message: string }>(
      COURSES_ENDPOINTS.CREATE_DOC,
      data
    );

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    return {
      success: false,
      error: response.success ? 'Create failed' : (response.error || 'Create failed'),
      message: response.success ? (response.data?.message || 'Failed to create document') : (response.message || 'Failed to create document')
    };
  }

  async updateDocument(docId: string, data: UpdateDocumentRequest): Promise<ApiResponse<Document>> {
    const response = await apiClient.put<{ data: Document; success: boolean; message: string }>(
      COURSES_ENDPOINTS.UPDATE_DOC(docId),
      data
    );

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    return {
      success: false,
      error: response.success ? 'Update failed' : (response.error || 'Update failed'),
      message: response.success ? (response.data?.message || 'Failed to update document') : (response.message || 'Failed to update document')
    };
  }

  async deleteDocument(docId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      COURSES_ENDPOINTS.DELETE_DOC(docId)
    );
  }

  async uploadImage(file: File): Promise<ApiResponse<CourseImageUploadResponse>> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<{ success: boolean; data: CourseImageUploadResponse; message: string }>(
      COURSES_ENDPOINTS.UPLOAD_IMAGE,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    return {
      success: false,
      error: response.success ? 'Upload failed' : (response.error || 'Upload failed'),
      message: response.success ? (response.data?.message || 'Failed to upload image') : (response.message || 'Failed to upload image')
    };
  }

  async deleteImage(imageUrl: string): Promise<ApiResponse<{ result: string }>> {
    const response = await apiClient.delete<{ success: boolean; data: { result: string }; message: string }>(
      `${COURSES_ENDPOINTS.DELETE_IMAGE}?imageUrl=${encodeURIComponent(imageUrl)}`
    );

    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    return {
      success: false,
      error: response.success ? 'Delete failed' : (response.error || 'Delete failed'),
      message: response.success ? (response.data?.message || 'Failed to delete image') : (response.message || 'Failed to delete image')
    };
  }

  async getImageConfig(): Promise<ApiResponse<CourseImageConfig>> {
    const response = await apiClient.get<{ success: boolean; data: CourseImageConfig }>(
      COURSES_ENDPOINTS.IMAGE_CONFIG
    );
    
    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    return {
      success: false,
      error: 'Failed to load config',
      message: 'Unable to retrieve image upload configuration'
    };
  }

  async getPublicTopics(): Promise<ApiResponse<TopicsListResponse>> {
    return await apiClient.get<TopicsListResponse>(COURSES_ENDPOINTS.PUBLIC_TOPICS);
  }

  async getTopicById(topicId: string): Promise<ApiResponse<Topic>> {
    const response = await apiClient.get<{ data: Topic; success: boolean }>(
      COURSES_ENDPOINTS.GET_TOPIC(topicId)
    );
    
    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    return {
      success: false,
      error: response.success ? 'Fetch failed' : (response.error || 'Fetch failed'),
      message: response.success ? 'Failed to fetch topic' : (response.message || 'Failed to fetch topic')
    };
  }

  async getDocsByTopic(topicId: string): Promise<ApiResponse<DocsByTopicResponse>> {
    return await apiClient.get<DocsByTopicResponse>(
      COURSES_ENDPOINTS.GET_DOCS_BY_TOPIC(topicId)
    );
  }

  async getDocumentById(docId: string): Promise<ApiResponse<Document>> {
    const response = await apiClient.get<{ data: Document; success: boolean }>(
      COURSES_ENDPOINTS.GET_DOC(docId)
    );
    
    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    return {
      success: false,
      error: response.success ? 'Fetch failed' : (response.error || 'Fetch failed'),
      message: response.success ? 'Failed to fetch document' : (response.message || 'Failed to fetch document')
    };
  }

  async getCourseStats(): Promise<ApiResponse<CourseStats>> {
    const response = await apiClient.get<{ data: CourseStats; success: boolean }>(
      COURSES_ENDPOINTS.STATS
    );
    
    if (response.success && response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }

    return {
      success: false,
      error: response.success ? 'Fetch failed' : (response.error || 'Fetch failed'),
      message: response.success ? 'Failed to fetch statistics' : (response.message || 'Failed to fetch statistics')
    };
  }
}

export const coursesService = new CoursesService();