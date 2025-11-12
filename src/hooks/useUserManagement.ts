// src/hooks/useUserManagement.ts  

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApiService } from '@/lib/api/userService';
import { QUERY_KEYS } from '@/constants';
import { UserListItem, RoleChangeRequest, UserPageResponse } from '@/types';
import { UserRole } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

/**
 * Hook to get all users with pagination
 */
export function useUsers(params?: {
  page?: number;
  size?: number;
  sort?: string;
}) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.ADMIN.USERS, params],
    queryFn: async (): Promise<UserPageResponse> => {
      const response = await userApiService.getAllUsers(params);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch users');
    },
    enabled: isAdmin(), // Only fetch if user is admin
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

/**
 * Hook to get users by specific role
 * FIXED: Added enabled condition to prevent calls with invalid roles
 */
export function useUsersByRole(role: UserRole, params?: {
  page?: number;
  size?: number;
}) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.USERS.BY_ROLE(role), params],
    queryFn: async (): Promise<UserPageResponse> => {
      const response = await userApiService.getUsersByRole(role, params);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch users by role');
    },
    // FIXED: Only enable when we have a valid UserRole (not 'ALL') and user is admin
    enabled: isAdmin() && Object.values(UserRole).includes(role),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to get specific user by ID
 */
export function useUserById(userId: string) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.USERS.DETAIL(userId),
    queryFn: async (): Promise<UserListItem> => {
      const response = await userApiService.getUserById(userId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch user');
    },
    enabled: !!userId && isAdmin(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update user role (SuperAdmin only)
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { user, isSuperAdmin } = useAuth();

  return useMutation({
    mutationFn: async (request: RoleChangeRequest): Promise<UserListItem> => {
      // Frontend validation (backend will also validate)
      if (!isSuperAdmin()) {
        throw new Error('Only Super Admins can change user roles');
      }

      if (request.userId === user?.id) {
        throw new Error('You cannot change your own role');
      }

      const response = await userApiService.updateUserRole(request);
      if (response.success && response.data) {
        // Extract user data from the nested response structure
        return response.data.user;
      }
      throw new Error(response.message || 'Failed to update user role');
    },
    onSuccess: (updatedUser, variables) => {
      // Invalidate all user-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.DETAIL(variables.userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      
      toast.success(`Successfully updated ${updatedUser.name}'s role to ${updatedUser.role}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });
}

/**
 * Hook to get role permissions matrix
 */
export function useRolePermissions() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.USER_PERMISSIONS,
    queryFn: async () => {
      const response = await userApiService.getRolePermissions();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch role permissions');
    },
    enabled: isAdmin(),
    staleTime: 10 * 60 * 1000, // 10 minutes - permissions don't change often
  });
}