// src/hooks/useCoursesManagement.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApiService } from '@/lib/api/coursesService';
// import { QUERY_KEYS } from '@/constants';
import toast from 'react-hot-toast';
import type {
  CreateTopicRequest,
  UpdateTopicRequest,
  CreateDocumentRequest,
  UpdateDocumentRequest,
} from '@/types/courses';
import { QUERY_KEYS } from '@/constants';

// ==================== TOPICS HOOKS ====================

/**
 * Hook to get all topics
 */
export function useTopics() {
  return useQuery({
    queryKey: QUERY_KEYS.COURSES.TOPICS_LIST,
    queryFn: async () => {
      const response = await coursesApiService.getAllTopics();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch topics');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get single topic by ID
 */
export function useTopic(topicId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.COURSES.TOPIC_DETAIL(topicId),
    queryFn: async () => {
      const response = await coursesApiService.getTopicById(topicId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch topic');
    },
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new topic
 */
export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTopicRequest) => {
      const response = await coursesApiService.createTopic(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create topic');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.TOPICS_LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.STATS });
      toast.success('Topic created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create topic');
    },
  });
}

/**
 * Hook to update a topic
 */
export function useUpdateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ topicId, data }: { topicId: string; data: UpdateTopicRequest }) => {
      const response = await coursesApiService.updateTopic(topicId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update topic');
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.TOPICS_LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.TOPIC_DETAIL(variables.topicId) });
      toast.success('Topic updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update topic');
    },
  });
}

/**
 * Hook to delete a topic
 */
export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicId: string) => {
      const response = await coursesApiService.deleteTopic(topicId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to delete topic');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.TOPICS_LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.STATS });
      toast.success('Topic deleted successfully (all documents and images removed)');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete topic');
    },
  });
}

// ==================== DOCUMENTS HOOKS ====================

/**
 * Hook to get documents by topic (without content)
 */
export function useDocumentsByTopic(topicId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.COURSES.DOCS_BY_TOPIC(topicId),
    queryFn: async () => {
      const response = await coursesApiService.getDocsByTopic(topicId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch documents');
    },
    enabled: !!topicId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to get single document with full content
 */
export function useDocument(docId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.COURSES.DOC_DETAIL(docId),
    queryFn: async () => {
      const response = await coursesApiService.getDocumentById(docId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch document');
    },
    enabled: !!docId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to create a new document
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDocumentRequest) => {
      const response = await coursesApiService.createDocument(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create document');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.DOCS_BY_TOPIC(data.topicId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.TOPICS_LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.STATS });
      toast.success('Document created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create document');
    },
  });
}

/**
 * Hook to update a document
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ docId, data }: { docId: string; data: UpdateDocumentRequest }) => {
      const response = await coursesApiService.updateDocument(docId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update document');
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.DOC_DETAIL(variables.docId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.DOCS_BY_TOPIC(data.topicId) });
      toast.success('Document updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update document');
    },
  });
}

/**
 * Hook to delete a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ docId, topicId }: { docId: string; topicId: string }) => {
      const response = await coursesApiService.deleteDocument(docId);
      if (response.success) {
        return { ...response.data, topicId };
      }
      throw new Error(response.message || 'Failed to delete document');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.DOCS_BY_TOPIC(data.topicId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.TOPICS_LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.STATS });
      toast.success('Document deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete document');
    },
  });
}

// ==================== IMAGE HOOKS ====================

/**
 * Hook to upload an image
 */
export function useUploadCourseImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await coursesApiService.uploadImage(file);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to upload image');
    },
    onSuccess: () => {
      toast.success('Image uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload image');
    },
  });
}

/**
 * Hook to delete an image
 */
export function useDeleteCourseImage() {
  return useMutation({
    mutationFn: async (imageUrl: string) => {
      const response = await coursesApiService.deleteImage(imageUrl);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to delete image');
    },
    onSuccess: () => {
      toast.success('Image deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete image');
    },
  });
}

/**
 * Hook to get image upload configuration
 */
export function useCourseImageConfig() {
  return useQuery({
    queryKey: QUERY_KEYS.COURSES.IMAGE_CONFIG,
    queryFn: async () => {
      const response = await coursesApiService.getImageConfig();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch image config');
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - config rarely changes
  });
}

/**
 * Hook to get course statistics
 */
export function useCourseStats() {
  return useQuery({
    queryKey: QUERY_KEYS.COURSES.STATS,
    queryFn: async () => {
      const response = await coursesApiService.getCourseStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch stats');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}