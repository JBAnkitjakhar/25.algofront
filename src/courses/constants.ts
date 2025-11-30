// src/courses/constants.ts

export const COURSES_ENDPOINTS = {
  // Admin endpoints
  CREATE_TOPIC: '/courses/topics',
  UPDATE_TOPIC: (topicId: string) => `/courses/topics/${topicId}`,
  DELETE_TOPIC: (topicId: string) => `/courses/topics/${topicId}`,
  TOGGLE_VISIBILITY: (topicId: string) => `/courses/topics/${topicId}/visibility`,  
  ALL_TOPICS_ADMIN: '/courses/topicsnamesall',
  
  CREATE_DOC: '/courses/docs',
  UPDATE_DOC: (docId: string) => `/courses/docs/${docId}`,
  DELETE_DOC: (docId: string) => `/courses/docs/${docId}`,
  
  UPLOAD_IMAGE: '/courses/images',
  DELETE_IMAGE: '/courses/images',
  IMAGE_CONFIG: '/courses/images/config',
  
  // User endpoints
  PUBLIC_TOPICS: '/courses/topicsnames',
  GET_TOPIC: (topicId: string) => `/courses/topics/${topicId}`,
  GET_DOCS_BY_TOPIC: (topicId: string) => `/courses/topics/${topicId}/docs`,
  GET_DOC: (docId: string) => `/courses/docs/${docId}`,
  STATS: '/courses/stats',
} as const;

export const COURSES_QUERY_KEYS = {
  ADMIN_TOPICS_LIST: ['courses', 'admin', 'topics'] as const,
  PUBLIC_TOPICS_LIST: ['courses', 'public', 'topics'] as const,
  TOPIC_DETAIL: (topicId: string) => ['courses', 'topic', topicId] as const,
  DOCS_BY_TOPIC: (topicId: string) => ['courses', 'docs', 'topic', topicId] as const,
  DOC_DETAIL: (docId: string) => ['courses', 'doc', docId] as const,
  IMAGE_CONFIG: ['courses', 'image', 'config'] as const,
  STATS: ['courses', 'stats'] as const,
} as const;

export const COURSES_VALIDATION = {
  TOPIC_NAME_MIN: 3,
  TOPIC_NAME_MAX: 100,
  DOC_TITLE_MIN: 3,
  DOC_TITLE_MAX: 200,
  DOC_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_MAX_SIZE: 2 * 1024 * 1024, // 2MB
} as const;