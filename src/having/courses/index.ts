// src/courses/index.ts  

export * from './types';
export * from './constants';
export * from './service';
export * from './hooks';

// Re-export commonly used types explicitly for better IDE support
export type {
  Topic,
  Document,
  CreateTopicRequest,
  UpdateTopicRequest,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  MoveDocumentRequest,
  DocumentFormData,
  CourseImageUploadResponse,
  CourseImageConfig,
  CourseStats,
  TopicsListResponse,
  DocsByTopicResponse
} from './types';