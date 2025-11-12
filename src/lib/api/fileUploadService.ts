// src/lib/api/fileUploadService.ts - File upload API service

import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';
import type { FileUploadResponse, ImageUploadResponse } from '@/types';
import { FILE_ENDPOINTS } from '@/constants';

interface FileConfigResponse {
  success: boolean;
  data: {
    images: {
      allowedTypes: string[];
      allowedExtensions: string[];
      maxSizeBytes: number;
      maxSize: string;
      maxPerQuestion: number;
      maxPerSolution: number;
    };
    html: {
      allowedTypes: string[];
      allowedExtensions: string[];
      maxSizeBytes: number;
      maxSize: string;
      maxPerSolution: number;
    };
  };
}

class FileUploadApiService {
  /**
   * Get file upload configuration
   * Matches: GET /api/files/config
   */
  async getFileConfig(): Promise<ApiResponse<FileConfigResponse['data']>> {
    const response = await apiClient.get<FileConfigResponse>(FILE_ENDPOINTS.CONFIG);
    if (response.success && response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }
    return {
      success: false,
      error: 'Failed to load file config',
      message: 'Unable to retrieve file upload configuration'
    };
  }

  /**
   * Upload image for question (Admin/SuperAdmin only)
   * Matches: POST /api/files/images/questions
   */
  async uploadQuestionImage(file: File): Promise<ApiResponse<ImageUploadResponse>> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<FileUploadResponse>(
      FILE_ENDPOINTS.UPLOAD_QUESTION_IMAGE,
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
   * Upload image for solution (Admin/SuperAdmin only)
   * Matches: POST /api/files/images/solutions
   */
  async uploadSolutionImage(file: File): Promise<ApiResponse<ImageUploadResponse>> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<FileUploadResponse>(
      FILE_ENDPOINTS.UPLOAD_SOLUTION_IMAGE,
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
   * Check Cloudinary health (Admin/SuperAdmin only)
   * Matches: GET /api/files/health/cloudinary
   */
  async checkCloudinaryHealth(): Promise<ApiResponse<{
    success: boolean;
    service: string;
    status: string;
    timestamp: number;
  }>> {
    return await apiClient.get(FILE_ENDPOINTS.HEALTH_CHECK);
  }

  /**
   * Validate file before upload
   */
  validateImageFile(file: File, config?: FileConfigResponse['data']['images']): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Default config if not provided
    const defaultConfig = {
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxSizeBytes: 2 * 1024 * 1024, // 2MB
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    };
    
    const fileConfig = config || defaultConfig;

    // Check file type
    if (!fileConfig.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${fileConfig.allowedTypes.join(', ')}`);
    }

    // Check file size
    if (file.size > fileConfig.maxSizeBytes) {
      const maxSizeMB = fileConfig.maxSizeBytes / (1024 * 1024);
      errors.push(`File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds maximum ${maxSizeMB}MB`);
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!fileConfig.allowedExtensions.includes(fileExtension)) {
      errors.push(`File extension ${fileExtension} is not allowed. Allowed extensions: ${fileConfig.allowedExtensions.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const fileUploadApiService = new FileUploadApiService();