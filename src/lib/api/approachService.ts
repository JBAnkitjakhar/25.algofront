// src/lib/api/approachService.ts

import { apiClient } from './client';
import { APPROACH_ENDPOINTS } from '@/constants';
import type { 
  ApiResponse, 
  ApproachDTO, 
  CreateApproachRequest, 
  UpdateApproachRequest,
  ApproachLimitsResponse,
  ApproachSizeUsage,
  ApproachStats
} from '@/types';

export const approachService = {
  // ==================== APPROACH CRUD OPERATIONS ====================

  /**
   * Get approach by ID (only if user owns it)
   */
  getApproachById: async (id: string): Promise<ApiResponse<ApproachDTO>> => {
    return apiClient.get<ApproachDTO>(APPROACH_ENDPOINTS.GET_BY_ID(id));
  },

  /**
   * Get all approaches for a question by current user
   */
  getApproachesByQuestion: async (questionId: string): Promise<ApiResponse<ApproachDTO[]>> => {
    return apiClient.get<ApproachDTO[]>(APPROACH_ENDPOINTS.BY_QUESTION(questionId));
  },

  /**
   * Create new approach for a question
   */
  createApproach: async (
    questionId: string, 
    data: CreateApproachRequest
  ): Promise<ApiResponse<{ success: boolean; data: ApproachDTO; message: string }>> => {
    return apiClient.post(APPROACH_ENDPOINTS.CREATE_FOR_QUESTION(questionId), data);
  },

  /**
   * Update approach (only if user owns it)
   */
  updateApproach: async (
    id: string, 
    data: UpdateApproachRequest
  ): Promise<ApiResponse<{ success: boolean; data: ApproachDTO; message: string }>> => {
    return apiClient.put(APPROACH_ENDPOINTS.UPDATE(id), data);
  },

  /**
   * Delete approach (only if user owns it)
   */
  deleteApproach: async (id: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return apiClient.delete(APPROACH_ENDPOINTS.DELETE(id));
  },

  // ==================== USER APPROACH STATISTICS ====================

  /**
   * Get all approaches by current user
   */
  getMyApproaches: async (): Promise<ApiResponse<ApproachDTO[]>> => {
    return apiClient.get<ApproachDTO[]>(APPROACH_ENDPOINTS.MY_APPROACHES);
  },

  /**
   * Get recent approaches by current user
   */
  getMyRecentApproaches: async (): Promise<ApiResponse<ApproachDTO[]>> => {
    return apiClient.get<ApproachDTO[]>(APPROACH_ENDPOINTS.MY_RECENT);
  },

  /**
   * Get approach statistics for current user
   */
  getMyApproachStats: async (): Promise<ApiResponse<ApproachStats>> => {
    return apiClient.get<ApproachStats>(APPROACH_ENDPOINTS.MY_STATS);
  },

  /**
   * Get size usage for current user on a specific question
   */
  getQuestionSizeUsage: async (questionId: string): Promise<ApiResponse<ApproachSizeUsage>> => {
    return apiClient.get<ApproachSizeUsage>(APPROACH_ENDPOINTS.SIZE_USAGE(questionId));
  },

  /**
   * Check both count and size limits before creating/updating approach
   */
  checkApproachLimits: async (
    questionId: string,
    textContent: string,
    codeContent?: string,
    excludeApproachId?: string
  ): Promise<ApiResponse<ApproachLimitsResponse>> => {
    const requestData = {
      textContent,
      codeContent: codeContent || '',
    };

    const params = excludeApproachId ? `?excludeApproachId=${excludeApproachId}` : '';
    const url = `${APPROACH_ENDPOINTS.CHECK_LIMITS(questionId)}${params}`;

    return apiClient.post<ApproachLimitsResponse>(url, requestData);
  },

  /**
   * DEPRECATED: Use checkApproachLimits instead (kept for backward compatibility)
   */
  checkSizeLimits: async (
    questionId: string,
    textContent: string,
    codeContent?: string,
    excludeApproachId?: string
  ): Promise<ApiResponse<Partial<ApproachLimitsResponse>>> => {
    const requestData = {
      textContent,
      codeContent: codeContent || '',
    };

    const params = excludeApproachId ? `?excludeApproachId=${excludeApproachId}` : '';
    const url = `${APPROACH_ENDPOINTS.CHECK_SIZE(questionId)}${params}`;

    return apiClient.post<Partial<ApproachLimitsResponse>>(url, requestData);
  },
};