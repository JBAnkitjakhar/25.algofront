// src/adminOverview/service.ts

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  AdminOverviewResponse,
  PaginatedLoggedInUsers,
  LoggedInUserToday,
} from "./types";
import { ADMIN_OVERVIEW_ENDPOINTS, LOGGED_IN_USERS_PAGINATION } from "./constants";

class AdminOverviewService {
  /**
   * Fetch admin overview data
   */
  async getOverview(): Promise<ApiResponse<AdminOverviewResponse>> {
    try {
      const response = await apiClient.get<AdminOverviewResponse>(
        ADMIN_OVERVIEW_ENDPOINTS.OVERVIEW
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: "Failed to fetch overview",
        message: response.message || "Unable to load admin overview",
      };
    } catch (error) {
      console.error("Error fetching admin overview:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to load admin overview",
      };
    }
  }

  /**
   * Get paginated logged in users (client-side pagination)
   */
  getPaginatedLoggedInUsers(
    users: LoggedInUserToday[],
    page: number
  ): PaginatedLoggedInUsers {
    const pageSize = LOGGED_IN_USERS_PAGINATION.PAGE_SIZE;
    const totalItems = users.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages || 1));
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedUsers = users.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      currentPage,
      totalPages,
      pageSize,
      totalItems,
    };
  }
}

export const adminOverviewService = new AdminOverviewService();