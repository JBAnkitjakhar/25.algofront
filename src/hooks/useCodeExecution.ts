// src/hooks/useCodeExecution.ts 
 
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  compilerService, 
  ExecutionRequest, 
  WrappedExecutionResponse, 
} from '@/lib/api/compilerService';
import { ApiResponse } from '@/types';
import { QUERY_KEYS } from '@/constants';
import toast from 'react-hot-toast';

// Hook for code execution
export function useCodeExecution() {
  return useMutation({
    mutationFn: async (request: ExecutionRequest): Promise<ApiResponse<WrappedExecutionResponse>> => {
      const result = await compilerService.executeCode(request);
      if (!result.success) {
        throw new Error(result.message || 'Code execution failed');
      }
      return result;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Code execution failed');
    }
  });
}

// Hook for getting runtimes
export function useRuntimes() {
  return useQuery({
    queryKey: QUERY_KEYS.COMPILER.RUNTIMES,
    queryFn: async () => {
      const result = await compilerService.getRuntimes();
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch runtimes');
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook for getting supported languages
export function useSupportedLanguages() {
  return useQuery({
    queryKey: QUERY_KEYS.COMPILER.LANGUAGES,
    queryFn: async () => {
      const result = await compilerService.getSupportedLanguages();
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch languages');
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook for compiler health check
export function useCompilerHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.COMPILER.HEALTH,
    queryFn: async () => {
      const result = await compilerService.healthCheck();
      if (!result.success) {
        throw new Error(result.message || 'Health check failed');
      }
      return result.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}