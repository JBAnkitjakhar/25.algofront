// src/courses/hooks.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesService } from "./service";
import { COURSES_QUERY_KEYS } from "./constants";
import toast from "react-hot-toast";
import {
  CreateDocumentRequest,
  CreateTopicRequest,
  UpdateDocumentRequest,
  UpdateTopicRequest,
} from "./types";

// ==================== ADMIN HOOKS ====================
// Admin hooks keep SHORT stale times for real-time updates

export function useAdminTopics() {
  return useQuery({
    queryKey: COURSES_QUERY_KEYS.ADMIN_TOPICS_LIST,
    queryFn: async () => {
      const response = await coursesService.getAllTopicsAdmin();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch topics");
    },
    staleTime: 2 * 60 * 1000, // 2 mins - short for admin
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTopicRequest) => {
      const response = await coursesService.createTopic(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to create topic");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.ADMIN_TOPICS_LIST,
      });
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.PUBLIC_TOPICS_LIST,
      });
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEYS.STATS });
      toast.success("Topic created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      topicId,
      data,
    }: {
      topicId: string;
      data: UpdateTopicRequest;
    }) => {
      const response = await coursesService.updateTopic(topicId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to update topic");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.ADMIN_TOPICS_LIST,
      });
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.PUBLIC_TOPICS_LIST,
      });
      // Also invalidate docs that might display topic name
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "courses" && query.queryKey[1] === "docs",
      });
      toast.success("Topic updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useToggleTopicVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicId: string) => {
      const response = await coursesService.toggleTopicVisibility(topicId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to toggle visibility");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.ADMIN_TOPICS_LIST,
      });
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.PUBLIC_TOPICS_LIST,
      });
      toast.success(`Topic is now ${data.isPublic ? "public" : "private"}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicId: string) => {
      const response = await coursesService.deleteTopic(topicId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to delete topic");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.ADMIN_TOPICS_LIST,
      });
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.PUBLIC_TOPICS_LIST,
      });
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEYS.STATS });
      toast.success("Topic deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDocumentRequest) => {
      const response = await coursesService.createDocument(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to create document");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.DOCS_BY_TOPIC(data.topicId),
      });
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.ADMIN_TOPICS_LIST,
      });
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEYS.STATS });
      toast.success("Document created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      docId,
      data,
    }: {
      docId: string;
      data: UpdateDocumentRequest;
    }) => {
      const response = await coursesService.updateDocument(docId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to update document");
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.DOC_DETAIL(variables.docId),
      });
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.DOCS_BY_TOPIC(data.topicId),
      });
      // If topic changed, invalidate old topic's docs too
      if (variables.data.topicId && variables.data.topicId !== data.topicId) {
        queryClient.invalidateQueries({
          queryKey: COURSES_QUERY_KEYS.DOCS_BY_TOPIC(variables.data.topicId),
        });
      }
      toast.success("Document updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      docId,
      topicId,
    }: {
      docId: string;
      topicId: string;
    }) => {
      const response = await coursesService.deleteDocument(docId);
      if (response.success) {
        return { ...response.data, topicId };
      }
      throw new Error(response.message || "Failed to delete document");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.DOCS_BY_TOPIC(data.topicId),
      });
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.ADMIN_TOPICS_LIST,
      });
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEYS.STATS });
      toast.success("Document deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUploadCourseImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await coursesService.uploadImage(file);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to upload image");
    },
    onSuccess: () => {
      toast.success("Image uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCourseImage() {
  return useMutation({
    mutationFn: async (imageUrl: string) => {
      const response = await coursesService.deleteImage(imageUrl);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to delete image");
    },
    onSuccess: () => {
      toast.success("Image deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCourseImageConfig() {
  return useQuery({
    queryKey: COURSES_QUERY_KEYS.IMAGE_CONFIG,
    queryFn: async () => {
      const response = await coursesService.getImageConfig();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch image config");
    },
    staleTime: 30 * 60 * 1000, // 30 mins - rarely changes
  });
}

export function useCourseStats() {
  return useQuery({
    queryKey: COURSES_QUERY_KEYS.STATS,
    queryFn: async () => {
      const response = await coursesService.getCourseStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch stats");
    },
    staleTime: 5 * 60 * 1000, // 5 mins - admin needs fresher data
  });
}

// ==================== USER HOOKS ====================
// User hooks use LONG stale times for better performance

export function usePublicTopics() {
  return useQuery({
    queryKey: COURSES_QUERY_KEYS.PUBLIC_TOPICS_LIST,
    queryFn: async () => {
      const response = await coursesService.getPublicTopics();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch topics");
    },
    // ✅ Long stale time - topics list doesn't change often
    staleTime: 20 * 60 * 1000, // 20 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 mins

    // ✅ Refetch on page refresh (component mount)
    refetchOnMount: true,

    // ❌ Don't refetch on tab switch
    refetchOnWindowFocus: false,

    // ❌ Don't refetch on network reconnect
    refetchOnReconnect: false,

    // ❌ No background polling
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}

export function useDocumentsByTopic(topicId: string) {
  return useQuery({
    queryKey: COURSES_QUERY_KEYS.DOCS_BY_TOPIC(topicId),
    queryFn: async () => {
      const response = await coursesService.getDocsByTopic(topicId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch documents");
    },
    enabled: !!topicId,

    // ✅ Long stale time - docs list doesn't change often
    staleTime: 20 * 60 * 1000, // 20 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 mins

    // ✅ Refetch on page refresh
    refetchOnMount: true,

    // ❌ Don't refetch on tab switch
    refetchOnWindowFocus: false,

    // ❌ Don't refetch on network reconnect
    refetchOnReconnect: false,

    // ❌ No background polling
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}

export function useDocument(docId: string) {
  return useQuery({
    queryKey: COURSES_QUERY_KEYS.DOC_DETAIL(docId),
    queryFn: async () => {
      const response = await coursesService.getDocumentById(docId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch document");
    },
    enabled: !!docId,

    // ✅ Longest stale time - full document content rarely changes
    staleTime: 20 * 60 * 1000, // 20 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 mins

    // ✅ Refetch on page refresh
    refetchOnMount: true,

    // ❌ Don't refetch on tab switch
    refetchOnWindowFocus: false,

    // ❌ Don't refetch on network reconnect
    refetchOnReconnect: false,

    // ❌ No background polling
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}

export function useMoveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      docId,
      newTopicId,
      oldTopicId,
    }: {
      docId: string;
      newTopicId: string;
      oldTopicId: string; // Need this to invalidate old topic's cache
    }) => {
      const response = await coursesService.moveDocument(docId, { newTopicId });
      if (response.success && response.data) {
        return { ...response.data, oldTopicId }; // Include oldTopicId in response
      }
      throw new Error(response.message || "Failed to move document");
    },
    onSuccess: (data, variables) => {
      // ✅ Invalidate BOTH old and new topic's document lists
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.DOCS_BY_TOPIC(variables.oldTopicId),
      });
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.DOCS_BY_TOPIC(variables.newTopicId),
      });

      // ✅ Invalidate the document detail cache
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.DOC_DETAIL(variables.docId),
      });

      // ✅ Invalidate admin topics list (to update doc counts)
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.ADMIN_TOPICS_LIST,
      });

      // ✅ Invalidate public topics list
      queryClient.invalidateQueries({
        queryKey: COURSES_QUERY_KEYS.PUBLIC_TOPICS_LIST,
      });

      toast.success("Document moved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
