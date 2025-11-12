// src/types/courses.ts

export interface Topic {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  iconUrl?: string | null;
  docsCount: number;
  createdByName: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  topicId: string;
  topicName: string;
  content: string | null; // null when fetching list, full HTML when fetching single doc
  imageUrls: string[];
  displayOrder: number;
  totalSize: number;
  createdByName: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicRequest {
  name: string;
  description: string;
  displayOrder: number;
  iconUrl?: string;
}

export interface UpdateTopicRequest {
  name: string;
  description: string;
  displayOrder: number;
  iconUrl?: string;
}

export interface CreateDocumentRequest {
  title: string;
  topicId: string;
  displayOrder: number;
  content: string;
  imageUrls: string[];
}

export interface UpdateDocumentRequest {
  title: string;
  topicId: string;
  displayOrder: number;
  content: string;
  imageUrls: string[];
}

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