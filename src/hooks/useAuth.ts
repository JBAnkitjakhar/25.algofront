// src/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  selectAuth, 
  loginSuccess, 
  logout as logoutAction, 
  setError, 
  setLoading 
} from '@/store/slices/authSlice';
import { authService } from '@/lib/auth/authService';
import { AuthResponse } from '@/types';
import { QUERY_KEYS } from '@/constants';
import { roleUtils } from '@/lib/utils/auth';
import toast from 'react-hot-toast';
import { useCallback } from 'react';

export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const queryClient = useQueryClient();

  // Query to get current user (only if token exists but no user data)
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: QUERY_KEYS.AUTH.USER,
    queryFn: async () => {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get user data');
    },
    enabled: !!auth.token && !auth.user && auth.isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Limit retries to prevent loops
  });

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: async (refreshToken: string): Promise<AuthResponse> => {
      const response = await authService.refreshToken(refreshToken);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to refresh token');
    },
    onSuccess: (data: AuthResponse) => {
      dispatch(loginSuccess({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
      }));
      toast.success('Session refreshed successfully');
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
      dispatch(logoutAction());
      toast.error('Session expired. Please login again.');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await authService.logout();
      if (!response.success) {
        throw new Error(response.message || 'Logout failed');
      }
      return response.data;
    },
    onSuccess: () => {
      dispatch(logoutAction());
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error: Error) => {
      // Still logout locally even if server request fails
      dispatch(logoutAction());
      queryClient.clear();
      toast.error(`Logout failed: ${error.message}`);
    },
  });

  // Memoized login functions to prevent re-renders
  const loginWithGoogle = useCallback(() => {
    dispatch(setLoading(true));
    authService.loginWithGoogle();
  }, [dispatch]);

  const loginWithGithub = useCallback(() => {
    dispatch(setLoading(true));
    authService.loginWithGithub();
  }, [dispatch]);

  // Handle auth callback - memoized
  const handleAuthCallback = useCallback((searchParams: URLSearchParams) => {
    const result = authService.handleAuthCallback(searchParams);
    
    if (result.error) {
      dispatch(setError(result.error));
      dispatch(setLoading(false));
      return { success: false, error: result.error };
    }

    if (result.token && result.userId) {
      return { success: true, token: result.token, userId: result.userId };
    }

    dispatch(setError('Invalid callback parameters'));
    dispatch(setLoading(false));
    return { success: false, error: 'Invalid callback parameters' };
  }, [dispatch]);

  // Logout function - memoized
  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  // Refresh token function - memoized
  const refreshToken = useCallback(() => {
    if (auth.refreshToken) {
      refreshTokenMutation.mutate(auth.refreshToken);
    }
  }, [auth.refreshToken, refreshTokenMutation]);

  // Current user - prefer auth.user over query user, handle undefined
  const currentUser = auth.user || user || null;

  // Use centralized role utilities with proper null handling
  const isAdmin = useCallback(() => roleUtils.isAdmin(currentUser), [currentUser]);
  const isSuperAdmin = useCallback(() => roleUtils.isSuperAdmin(currentUser), [currentUser]);
  const canAccessAdmin = useCallback(() => roleUtils.canAccessAdmin(currentUser), [currentUser]);
  const hasRole = useCallback((role: Parameters<typeof roleUtils.hasRole>[1]) => 
    roleUtils.hasRole(currentUser, role), [currentUser]);

  return {
    // State
    user: currentUser,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading || userLoading || refreshTokenMutation.isPending || logoutMutation.isPending,
    error: auth.error || userError?.message,
    
    // Actions
    loginWithGoogle,
    loginWithGithub,
    logout,
    refreshToken,
    handleAuthCallback,
    
    // Helper functions using centralized utilities
    isAdmin,
    isSuperAdmin,
    canAccessAdmin,
    hasRole,
    
    // Mutation states
    isRefreshing: refreshTokenMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}