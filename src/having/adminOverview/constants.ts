// src/adminOverview/constants.ts

import { API_BASE_URL } from "@/constants";

export const ADMIN_OVERVIEW_ENDPOINTS = {
  OVERVIEW: `${API_BASE_URL}/admin/overview`,
} as const;

export const ADMIN_OVERVIEW_QUERY_KEYS = {
  // No caching - always fresh data
  OVERVIEW: ['admin-overview'] as const,
} as const;

export const LOGGED_IN_USERS_PAGINATION = {
  PAGE_SIZE: 10,
} as const;