// src/types/index.ts 
export * from './auth';
export * from './api';
export * from './admin'; // This now includes user management, category, question, and approach types

// Re-export commonly used types for convenience
export type { User, AuthState, AuthResponse} from './auth';
export type { ApiResponse, ApiSuccess, ApiError } from './api';
export type { 
  UserListItem,
  RoleChangeRequest,
  CodeSnippet,
  ImageUploadResponse,
  FileUploadResponse,
} from './admin';

// Export UserRole and QuestionLevel as both type and value (enum)
export { UserRole } from './auth';
export { QuestionLevel } from './admin';