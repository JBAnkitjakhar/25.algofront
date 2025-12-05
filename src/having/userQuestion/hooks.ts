// src/having/userQuestion/hooks.ts - UPDATED

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userQuestionService } from "./service";
import { USER_QUESTION_QUERY_KEYS } from "./constants";
import toast from "react-hot-toast";
import type { CreateApproachRequest, UpdateApproachRequest } from "./types";

export function useQuestionById(id: string) {
  return useQuery({
    queryKey: USER_QUESTION_QUERY_KEYS.DETAIL(id),
    queryFn: async () => {
      const response = await userQuestionService.getQuestionById(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch question");
      }
      return response.data!;
    },
    staleTime: 20 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!id,
  });
}

export function useQuestionProgress(questionId: string) {
  return useQuery({
    queryKey: USER_QUESTION_QUERY_KEYS.PROGRESS(questionId),
    queryFn: async () => {
      const response = await userQuestionService.getQuestionProgress(
        questionId
      );
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch progress");
      }
      return response.data!;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    enabled: !!questionId,
  });
}

export function useMarkQuestionSolved() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) => {
      const response = await userQuestionService.markQuestionSolved(questionId);
      if (!response.success) {
        throw new Error(
          response.error || response.message || "Failed to mark as solved"
        );
      }
    },

    onSuccess: (_, questionId) => {
      queryClient.invalidateQueries({
        queryKey: USER_QUESTION_QUERY_KEYS.PROGRESS(questionId),
      });
      queryClient.invalidateQueries({
        queryKey: ["userProgress", "currentStats"],
      });
      toast.success("Question marked as solved ✓");
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUnmarkQuestionSolved() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) => {
      const response = await userQuestionService.unmarkQuestionSolved(
        questionId
      );
      if (!response.success) {
        throw new Error(
          response.error || response.message || "Failed to unmark"
        );
      }
    },

    onSuccess: (_, questionId) => {
      queryClient.invalidateQueries({
        queryKey: USER_QUESTION_QUERY_KEYS.PROGRESS(questionId),
      });
      queryClient.invalidateQueries({
        queryKey: ["userProgress", "currentStats"],
      });
      toast.success("Question unmarked");
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSolutionsByQuestion(questionId: string) {
  return useQuery({
    queryKey: USER_QUESTION_QUERY_KEYS.SOLUTIONS(questionId),
    queryFn: async () => {
      const response = await userQuestionService.getSolutionsByQuestion(
        questionId
      );
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch solutions");
      }
      return response.data || [];
    },
    staleTime: 20 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!questionId,
  });
}

export function useApproachesByQuestion(questionId: string) {
  return useQuery({
    queryKey: USER_QUESTION_QUERY_KEYS.APPROACHES(questionId),
    queryFn: async () => {
      const response = await userQuestionService.getApproachesByQuestion(
        questionId
      );
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch approaches");
      }
      return response.data || [];
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    enabled: !!questionId,
  });
}

export function useApproachDetail(questionId: string, approachId: string) {
  return useQuery({
    queryKey: USER_QUESTION_QUERY_KEYS.APPROACH_DETAIL(questionId, approachId),
    queryFn: async () => {
      const response = await userQuestionService.getApproachDetail(
        questionId,
        approachId
      );
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch approach detail");
      }
      return response.data!;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    enabled: !!questionId && !!approachId,
  });
}

export function useCreateApproach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      data,
    }: {
      questionId: string;
      data: CreateApproachRequest;
    }) => {
      const response = await userQuestionService.createApproach(
        questionId,
        data
      );
      if (!response.success) {
        // ✅ Throw the actual backend error message
        throw new Error(
          response.error || response.message || "Failed to create approach"
        );
      }
      return response.data!;
    },

    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({
        queryKey: USER_QUESTION_QUERY_KEYS.APPROACHES(questionId),
      });
      toast.success("Approach submitted successfully!");
    },

    onError: (error: Error) => {
      // ✅ Display backend error directly
      toast.error(error.message);
    },
  });
}

export function useUpdateApproach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      approachId,
      data,
    }: {
      questionId: string;
      approachId: string;
      data: UpdateApproachRequest;
    }) => {
      const response = await userQuestionService.updateApproach(
        questionId,
        approachId,
        data
      );
      if (!response.success) {
        throw new Error(
          response.error || response.message || "Failed to update approach"
        );
      }
      return response.data!;
    },

    onSuccess: (newData, { questionId, approachId }) => {
      queryClient.setQueryData(
        USER_QUESTION_QUERY_KEYS.APPROACH_DETAIL(questionId, approachId),
        newData
      );
      queryClient.invalidateQueries({
        queryKey: USER_QUESTION_QUERY_KEYS.APPROACHES(questionId),
      });
      toast.success("Approach updated successfully!");
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteApproach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      approachId,
    }: {
      questionId: string;
      approachId: string;
    }) => {
      const response = await userQuestionService.deleteApproach(
        questionId,
        approachId
      );
      if (!response.success) {
        throw new Error(
          response.error || response.message || "Failed to delete approach"
        );
      }
    },

    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({
        queryKey: USER_QUESTION_QUERY_KEYS.APPROACHES(questionId),
      });
      toast.success("Approach deleted successfully");
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useQuestionPageData(questionId: string) {
  const question = useQuestionById(questionId);
  const progress = useQuestionProgress(questionId);
  const solutions = useSolutionsByQuestion(questionId);
  const approaches = useApproachesByQuestion(questionId);

  return {
    question: question.data,
    progress: progress.data,
    solutions: solutions.data || [],
    approaches: approaches.data || [],
    isLoading: question.isLoading,
    isError:
      question.isError ||
      progress.isError ||
      solutions.isError ||
      approaches.isError,
  };
}

// ✅ SIMPLIFIED: Only fetch visualizer HTML content (no metadata)
export function useVisualizerContent(fileId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: USER_QUESTION_QUERY_KEYS.VISUALIZER_CONTENT(fileId),
    queryFn: async (): Promise<string> => {
      // console.log(`📥 [User] Fetching visualizer content: ${fileId}`);

      const token = document.cookie.split("token=")[1]?.split(";")[0];

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        userQuestionService.getVisualizerContentUrl(fileId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch visualizer: ${response.statusText}`);
      }

      const htmlContent = await response.text();
      // console.log(
      //   `✅ [User] Visualizer loaded (${(htmlContent.length / 1024).toFixed(
      //     1
      //   )} KB)`
      // );

      return htmlContent;
    },
    enabled: !!fileId && enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  });
}
