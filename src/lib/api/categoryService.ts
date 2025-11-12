// src/lib/api/categoryService.ts  

import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';
import type { 
  Category, 
  CategoryStats, 
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  DeleteCategoryResponse,
  CategoryWithProgress // NEW TYPE
} from '@/types';
import { CATEGORY_ENDPOINTS } from '@/constants';

class CategoryApiService {
  /**
   * NEW OPTIMIZED: Get all categories with their stats and user progress in single call
   * This eliminates N+1 queries by fetching everything at once
   * Matches: GET /api/categories/with-progress
   */
  async getCategoriesWithProgress(): Promise<ApiResponse<CategoryWithProgress[]>> {
    return await apiClient.get<CategoryWithProgress[]>(CATEGORY_ENDPOINTS.WITH_PROGRESS);
  }

  /**
   * LEGACY: Get all categories (basic data only)
   * Matches: GET /api/categories
   */
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    return await apiClient.get<Category[]>(CATEGORY_ENDPOINTS.LIST);
  }

  /**
   * Get category by ID
   * Matches: GET /api/categories/{id}
   */
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return await apiClient.get<Category>(CATEGORY_ENDPOINTS.GET_BY_ID(id));
  }

  /**
   * Create new category (Admin/SuperAdmin only)
   * Matches: POST /api/categories
   */
  async createCategory(request: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return await apiClient.post<Category>(CATEGORY_ENDPOINTS.CREATE, {
      name: request.name.trim()
    });
  }

  /**
   * Update category (Admin/SuperAdmin only)
   * Matches: PUT /api/categories/{id}
   */
  async updateCategory(id: string, request: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    return await apiClient.put<Category>(CATEGORY_ENDPOINTS.UPDATE(id), {
      name: request.name.trim()
    });
  }

  /**
   * Delete category (Admin/SuperAdmin only)
   * Matches: DELETE /api/categories/{id}
   */
  async deleteCategory(id: string): Promise<ApiResponse<DeleteCategoryResponse>> {
    return await apiClient.delete<DeleteCategoryResponse>(CATEGORY_ENDPOINTS.DELETE(id));
  }

  /**
   * LEGACY: Get category statistics (use getCategoriesWithProgress instead)
   * Matches: GET /api/categories/{id}/stats
   */
  async getCategoryStats(id: string): Promise<ApiResponse<CategoryStats>> {
    return await apiClient.get<CategoryStats>(CATEGORY_ENDPOINTS.GET_STATS(id));
  }
}

export const categoryApiService = new CategoryApiService();