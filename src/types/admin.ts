// src/types/admin.ts

import { UserRole } from "./auth";
// User Management Types
export interface UserListItem {
  id: string;
  name: string;
  email?: string; // CHANGED: Email is now optional (can be undefined for GitHub private email users)
  image?: string;
  githubUsername?: string; // NEW: For displaying GitHub username
  role: UserRole;
  createdAt: string; // ISO string from LocalDateTime
  updatedAt: string; // ISO string from LocalDateTime
  primarySuperAdmin: boolean; // matches backend field name
}

// Helper function to get display identifier for UserListItem
export const getUserListDisplayIdentifier = (user: UserListItem): string => {
  if (user.email) {
    return user.email;
  } else if (user.githubUsername) {
    return `@${user.githubUsername}`;
  }
  return user.name || "User";
};

export interface RoleChangeRequest {
  userId: string;
  newRole: UserRole;
  reason?: string;
}

// Paginated response structure matching Spring Boot Page
export interface UserPageResponse {
  content: UserListItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Role update API response from backend
export interface RoleUpdateResponse {
  success: boolean;
  message: string;
  user: UserListItem;
}

// Question Management Types
export enum QuestionLevel {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export interface CodeSnippet {
  language: string;
  code: string;
  description: string;
}

// Image Upload Response (matches CloudinaryService response)
export interface ImageUploadResponse {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
}

export interface FileUploadResponse {
  success: boolean;
  data: ImageUploadResponse;
  message: string;
}
export interface LinkValidationResponse {
  valid: boolean;
  error?: string;
  videoId?: string; // For YouTube links
  embedUrl?: string; // For YouTube links
  originalUrl?: string;
}

// ==================== VISUALIZER FILE TYPES ====================

export interface VisualizerFile {
  fileId: string;
  filename: string;
  originalFileName: string;
  size: number;
  uploadDate: string;
  solutionId: string;
}

export interface VisualizerUploadResponse {
  fileId: string;
  filename: string;
  originalFileName: string;
  size: number;
  solutionId: string;
  uploadedAt: number;
}

export interface VisualizerFilesResponse {
  success: boolean;
  data: VisualizerFile[];
  count: number;
  solutionId: string;
}
