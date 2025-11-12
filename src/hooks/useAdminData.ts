// src/hooks/useAdminData.ts - Custom hooks for admin data management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApiService } from '@/lib/api/adminService';
import { QUERY_KEYS } from '@/constants';
import { AdminStats, SystemSettings, SystemHealth, ApplicationMetrics, GlobalProgress } from '@/types';
import toast from 'react-hot-toast';

/**
 * Hook to get admin statistics
 */
export function useAdminStats() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.STATS,
    queryFn: async (): Promise<AdminStats> => {
      const response = await adminApiService.getAdminStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch admin stats');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

/**
 * Hook to get system settings (SUPERADMIN only)
 */
export function useSystemSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.SETTINGS,
    queryFn: async (): Promise<SystemSettings> => {
      const response = await adminApiService.getSystemSettings();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch system settings');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to update system settings
 */
export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
      const response = await adminApiService.updateSystemSettings(settings);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update system settings');
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.ADMIN.SETTINGS, data);
      toast.success('System settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });
}

/**
 * Hook to get global progress statistics
 */
export function useGlobalProgress() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.PROGRESS,
    queryFn: async (): Promise<GlobalProgress> => {
      const response = await adminApiService.getGlobalProgress();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch global progress');
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refetch every 10 minutes
  });
}

/**
 * Hook to get system health
 */
export function useSystemHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.HEALTH,
    queryFn: async (): Promise<SystemHealth> => {
      const response = await adminApiService.getSystemHealth();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch system health');
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refetch every minute for health monitoring
  });
}

/**
 * Hook to get application metrics
 */
export function useApplicationMetrics() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.METRICS,
    queryFn: async (): Promise<ApplicationMetrics> => {
      const response = await adminApiService.getApplicationMetrics();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch application metrics');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}