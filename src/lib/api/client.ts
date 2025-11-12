// src/lib/api/client.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '@/constants';
import type { ApiResponse, ApiError } from '@/types';
import { cookieManager } from '@/lib/utils/auth';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 40000, // 40 seconds
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for CORS
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token using centralized cookie manager
    this.client.interceptors.request.use(
      (config) => {
        const token = cookieManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle responses and errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = cookieManager.getRefreshToken();
            if (!refreshToken) {
              this.handleLogout();
              return Promise.reject(error);
            }

            // Try to refresh token
            const response = await this.client.post('/auth/refresh', {}, {
              headers: { Authorization: `Bearer ${refreshToken}` }
            });

            const { token, refreshToken: newRefreshToken } = response.data;

            // Update tokens using centralized cookie manager
            cookieManager.setToken(token);
            cookieManager.setRefreshToken(newRefreshToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.handleLogout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private handleLogout(): void {
    // Clear all auth data using centralized cookie manager
    cookieManager.clearAll();

    // Redirect to login (if we're in browser)
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  // Generic request method
  async request<T = unknown>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request<T>(config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      // Handle different types of errors
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        // Server responded with error status
        const errorData = axiosError.response.data as ApiError;
        return {
          success: false,
          error: errorData.error || 'Server Error',
          message: errorData.message || 'An error occurred',
          details: errorData.details,
        };
      } else if (axiosError.request) {
        // Network error
        return {
          success: false,
          error: 'Network Error',
          message: 'Unable to connect to the server',
        };
      } else {
        // Other error
        return {
          success: false,
          error: 'Unknown Error',
          message: axiosError.message || 'An unexpected error occurred',
        };
      }
    }
  }

  // Convenience methods
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Get the raw axios instance if needed
  getInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;