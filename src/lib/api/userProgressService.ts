// src/lib/api/userProgressService.ts  

import { apiClient } from './client';
import type { 
  UserProgressDTO,
  UserProgressStats,
  CategoryProgressStats,
  GlobalProgressStats
} from '@/types';

class UserProgressApiService {
  /**
   * Get current user's progress statistics
   * Matches: GET /api/users/progress
   * Returns the response directly without wrapping in success/data structure
   */
  async getCurrentUserProgressStats(): Promise<UserProgressStats> {
    try {
      const response = await apiClient.get<UserProgressStats>('/users/progress');
      // The backend returns the data directly, not wrapped in {success: true, data: ...}
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch progress stats');
    } catch (error) {
      console.error('Error fetching user progress stats:', error);
      throw error;
    }
  }

  /**
   * Get current user's recent progress (last 10 solved questions)
   * Matches: GET /api/users/progress/recent
   */
  async getCurrentUserRecentProgress(): Promise<UserProgressDTO[]> {
    try {
      const response = await apiClient.get<UserProgressDTO[]>('/users/progress/recent');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch recent progress');
    } catch (error) {
      console.error('Error fetching recent progress:', error);
      throw error;
    }
  }

  /**
   * Get progress for specific question and current user
   * Matches: GET /api/questions/{questionId}/progress
   */
  async getQuestionProgress(questionId: string): Promise<UserProgressDTO | null> {
    try {
      const response = await apiClient.get<UserProgressDTO>(`/questions/${questionId}/progress`);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      // Handle 404 gracefully - means no progress record exists
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
      console.error('Error fetching question progress:', error);
      throw error;
    }
  }

  /**
   * Update progress for specific question
   * Matches: POST /api/questions/{questionId}/progress
   */
  async updateQuestionProgress(
    questionId: string, 
    solved: boolean
  ): Promise<UserProgressDTO> {
    try {
      const response = await apiClient.post<UserProgressDTO>(`/questions/${questionId}/progress`, {
        solved
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update question progress');
    } catch (error) {
      console.error('Error updating question progress:', error);
      throw error;
    }
  }

  /**
   * Get progress for specific category and current user
   * Matches: GET /api/categories/{categoryId}/progress
   */
  async getCategoryProgress(categoryId: string): Promise<CategoryProgressStats> {
    try {
      const response = await apiClient.get<CategoryProgressStats>(`/categories/${categoryId}/progress`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch category progress');
    } catch (error) {
      console.error('Error fetching category progress:', error);
      throw error;
    }
  }

  /**
   * BULK: Get progress status for multiple questions (no 404s)
   * Matches: POST /api/users/progress/bulk
   */
  async getBulkQuestionProgress(questionIds: string[]): Promise<Record<string, boolean>> {
    try {
      const response = await apiClient.post<Record<string, boolean>>('/users/progress/bulk', {
        questionIds
      });
      if (response.success && response.data) {
        return response.data;
      }
      return {};
    } catch (error) {
      console.error('Error fetching bulk question progress:', error);
      // Return empty object on error - questions will be treated as not solved
      return {};
    }
  }

  // ADMIN ENDPOINTS (for future use)

  /**
   * Get progress for specific user (Admin only)
   * Matches: GET /api/users/{userId}/progress
   */
  async getUserProgressStats(userId: string): Promise<UserProgressStats> {
    try {
      const response = await apiClient.get<UserProgressStats>(`/users/${userId}/progress`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch user progress stats');
    } catch (error) {
      console.error('Error fetching user progress stats:', error);
      throw error;
    }
  }

  /**
   * Get all progress for a user (Admin only)
   * Matches: GET /api/users/{userId}/progress/all
   */
  async getAllUserProgress(userId: string): Promise<UserProgressDTO[]> {
    try {
      const response = await apiClient.get<UserProgressDTO[]>(`/users/${userId}/progress/all`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch all user progress');
    } catch (error) {
      console.error('Error fetching all user progress:', error);
      throw error;
    }
  }

  /**
   * Get global progress statistics (Admin only)
   * Matches: GET /api/admin/progress/global
   */
  async getGlobalProgressStats(): Promise<GlobalProgressStats> {
    try {
      const response = await apiClient.get<GlobalProgressStats>('/admin/progress/global');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch global progress stats');
    } catch (error) {
      console.error('Error fetching global progress stats:', error);
      throw error;
    }
  }
}

export const userProgressApiService = new UserProgressApiService();