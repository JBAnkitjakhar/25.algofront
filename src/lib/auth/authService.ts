// src/lib/auth/authService.ts

import { apiClient } from '@/lib/api/client';
import { User, AuthResponse, ApiResponse } from '@/types';
import { AUTH_ENDPOINTS } from '@/constants';
import { roleUtils } from '@/lib/utils/auth';

export class AuthService {
  // Get current user info
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<User>('/auth/me');
    
    // Debug log to see what we're getting
    // console.log('Auth service response:', response);
    
    return response;
  }

  // Refresh authentication token
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
  }

  // Logout user
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/auth/logout');
  }

  // Redirect to OAuth provider
  loginWithGoogle(): void {
    window.location.href = AUTH_ENDPOINTS.GOOGLE_LOGIN;
  }

  loginWithGithub(): void {
    window.location.href = AUTH_ENDPOINTS.GITHUB_LOGIN;
  }

  // Handle OAuth callback (extract token from URL)
  handleAuthCallback(searchParams: URLSearchParams): {
    token: string | null;
    userId: string | null;
    error: string | null;
  } {
    const token = searchParams.get('token');
    const userId = searchParams.get('user');
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('message');

    if (error) {
      return {
        token: null,
        userId: null,
        error: errorMessage || error,
      };
    }

    return {
      token,
      userId,
      error: null,
    };
  }

  // Use centralized role utilities instead of duplicating logic
  isAdmin(user: User | null): boolean {
    return roleUtils.isAdmin(user);
  }

  isSuperAdmin(user: User | null): boolean {
    return roleUtils.isSuperAdmin(user);
  }

  canAccessAdmin(user: User | null): boolean {
    return roleUtils.canAccessAdmin(user);
  }

  hasRole(user: User | null, role: User['role']): boolean {
    return roleUtils.hasRole(user, role);
  }
}

// Export singleton instance
export const authService = new AuthService();