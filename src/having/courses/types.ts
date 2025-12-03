// src/courses/types.ts

export interface Topic {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  iconUrl?: string | null;
  isPublic: boolean;
  docsCount: number;
  createdByName: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Document {
  id: string;
  title: string;
  topicId: string;
  content: string | null; 
  imageUrls: string[];
  displayOrder: number;
  totalSize: number;
  createdByName: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// TOPIC REQUEST TYPES - ADD THESE
export interface CreateTopicRequest {
  name: string;
  description?: string;
  displayOrder: number;
  iconUrl?: string;
  isPublic: boolean;
}

export interface UpdateTopicRequest {
  name?: string;
  description?: string;
  displayOrder?: number;
  iconUrl?: string;
  isPublic?: boolean;
}

// DOCUMENT REQUEST TYPES
export interface CreateDocumentRequest {
  title: string;
  topicId: string;
  displayOrder: number;
  content: string;
  imageUrls: string[];
}

export interface UpdateDocumentRequest {
  title?: string;
  topicId?: string;
  displayOrder?: number;
  content?: string;
  imageUrls?: string[];
}

// FORM STATE TYPE (always has required fields)
export interface DocumentFormData {
  title: string;
  topicId: string;
  displayOrder: number;
  content: string;
  imageUrls: string[];
}

// RESPONSE TYPES
export interface CourseImageUploadResponse {
  size: number;
  secure_url: string;
  width: number;
  format: string;
  created_at: string;
  url: string;
  public_id: string;
  height: number;
}

export interface CourseImageConfig {
  allowedTypes: string[];
  allowedExtensions: string[];
  folder: string;
  maxSizeBytes: number;
  maxSize: string;
}

export interface CourseStats {
  totalTopics: number;
  totalDocuments: number;
}

export interface TopicsListResponse {
  data: Topic[];
  success: boolean;
  count: number;
}

export interface DocsByTopicResponse {
  docs: Document[];
  success: boolean;
  count: number;
  topic: Topic;
}

export interface MoveDocumentRequest {
  newTopicId: string;
}