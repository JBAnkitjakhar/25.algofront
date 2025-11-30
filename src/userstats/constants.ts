// src/userstats/constants.ts

import { API_BASE_URL } from "@/constants";

export const USER_STATS_ENDPOINTS = {
  USER_STATS: `${API_BASE_URL}/user/me/stats`,
  QUESTIONS_METADATA: `${API_BASE_URL}/questions/metadata`,
  CATEGORIES_METADATA: `${API_BASE_URL}/categories/metadata`,
} as const;

export const USER_STATS_QUERY_KEYS = {
  // Combined key for all user progress data
  PROGRESS: ['user-stats', 'progress'] as const,
  
  // Paginated questions (includes page number)
  PAGINATED: (page: number) => ['user-stats', 'paginated', page] as const,
} as const;

export const PAGINATION_CONFIG = {
  PAGE_SIZE: 20,
  MAX_RECENT_DAYS: 7,
} as const;