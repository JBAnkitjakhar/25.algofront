// src/lib/api/compilerService.ts  

import { apiClient } from './client';
import { ApiResponse } from '@/types';

// Type definitions matching backend DTOs
export interface ExecutionRequest {
  language: string;
  version: string;
  code: string;
  input?: string;
  args?: string[];
  files?: Array<{ name: string; content: string }>;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  output: string;
  code: number;
  signal: string | null;
}

// Core execution response structure
export interface ExecutionResponse {
  language: string;
  version: string;
  run: ExecutionResult;
  compile?: ExecutionResult;
  successful: boolean;
  errorMessage: string | null;
  output: string;
}

// Wrapper type for the nested response structure from backend
export interface WrappedExecutionResponse {
  data?: ExecutionResponse;
  language?: string;
  version?: string;
  run?: ExecutionResult;
  compile?: ExecutionResult;
  successful?: boolean;
  errorMessage?: string | null;
  output?: string;
}

export interface Runtime {
  language: string;
  version: string;
  aliases: string[];
  runtime?: string;
}

// Health check response type
export interface HealthCheckResponse {
  status: string;
  responseTime?: number;
  runtimesCount?: number;
  apiUrl?: string;
  error?: string;
}

export class CompilerService {
  // Execute code
  async executeCode(request: ExecutionRequest): Promise<ApiResponse<WrappedExecutionResponse>> {
    return apiClient.post<WrappedExecutionResponse>('/compiler/execute', request);
  }

  // Get available runtimes
  async getRuntimes(): Promise<ApiResponse<Runtime[]>> {
    return apiClient.get<Runtime[]>('/compiler/runtimes');
  }

  // Get supported languages
  async getSupportedLanguages(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/compiler/languages');
  }

  // Health check - Fixed: Replaced any with proper type
  async healthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
    return apiClient.get<HealthCheckResponse>('/compiler/health');
  }
}

// Export singleton instance
export const compilerService = new CompilerService();