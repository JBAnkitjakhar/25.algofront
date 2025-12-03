// src/having/adminCategory/service.ts

import apiClient from '@/lib/api/client';
import { CategoryResponse, CreateCategoryRequest, DeleteCategoryResponse, UpdateCategoryRequest } from './types';

export const categoryService = {
  getAllCategories: async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<Record<string, CategoryResponse>>('/categories');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch categories');
    }
    // Backend already returns sorted by displayOrder
    return Object.values(response.data);
  },

  createCategory: async (request: CreateCategoryRequest): Promise<CategoryResponse> => {
    const response = await apiClient.post<CategoryResponse>('/categories', request);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create category');
    }
    return response.data;
  },

  updateCategory: async (id: string, request: UpdateCategoryRequest): Promise<CategoryResponse> => {
    const response = await apiClient.put<CategoryResponse>(`/categories/${id}`, request);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update category');
    }
    return response.data;
  },

  deleteCategory: async (id: string): Promise<DeleteCategoryResponse> => {
    const response = await apiClient.delete<DeleteCategoryResponse>(`/categories/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to delete category');
    }
    return response.data;
  }
};