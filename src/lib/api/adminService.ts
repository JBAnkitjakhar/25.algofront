// src/lib/api/adminService.ts  

import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';
import type { 
  AdminStats, 
  SystemSettings, 
  SystemHealth, 
  ApplicationMetrics, 
  GlobalProgress 
} from '@/types/admin';

class AdminApiService {
  /**
   * Get admin statistics
   */
  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    return await apiClient.get<AdminStats>('/admin/stats');
  }

  /**
   * Get system settings (SUPERADMIN only)
   */
  async getSystemSettings(): Promise<ApiResponse<SystemSettings>> {
    return await apiClient.get<SystemSettings>('/admin/settings');
  }

  /**
   * Update system settings (SUPERADMIN only)
   */
  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> {
    return await apiClient.put<SystemSettings>('/admin/settings', settings);
  }

  /**
   * Get global progress statistics
   */
  async getGlobalProgress(): Promise<ApiResponse<GlobalProgress>> {
    return await apiClient.get<GlobalProgress>('/admin/progress');
  }

  /**
   * Get system health information
   */
  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    return await apiClient.get<SystemHealth>('/admin/health');
  }

  /**
   * Get application metrics
   */
  async getApplicationMetrics(): Promise<ApiResponse<ApplicationMetrics>> {
    return await apiClient.get<ApplicationMetrics>('/admin/metrics');
  }
}

// Export singleton instance
export const adminApiService = new AdminApiService();
export default adminApiService;