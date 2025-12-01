// src/userCategory/constants.ts

import { API_BASE_URL } from "@/constants";

export const USER_CATEGORY_ENDPOINTS = {
  ALL_CATEGORIES: `${API_BASE_URL}/categories`,
  CATEGORY_BY_ID: (categoryId: string) => `${API_BASE_URL}/categories/${categoryId}`,
  USER_STATS: `${API_BASE_URL}/user/me/stats`,
  QUESTIONS_METADATA: `${API_BASE_URL}/questions/metadata`,
} as const;

export const USER_CATEGORY_QUERY_KEYS = {
  // All categories with user progress
  ALL_CATEGORIES: ['user-category', 'all'] as const,
  
  // Specific category detail with questions
  CATEGORY_DETAIL: (categoryId: string) => ['user-category', 'detail', categoryId] as const,
  
  // Paginated questions for specific category
  PAGINATED: (categoryId: string, page: number, level?: string) => 
    ['user-category', 'paginated', categoryId, page, level || 'all'] as const,
} as const;

export const PAGINATION_CONFIG = {
  PAGE_SIZE: 20,
} as const;