// src/types/admin.ts

import { UserRole } from "./auth";

export interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalSolutions: number;
  totalApproaches: number;
  totalCategories: number;
  totalProgress: number;
  totalSolved: number;
  avgProgressPerUser: number;
  avgSolvedPerUser: number;
  recentUsers: string;
  recentQuestions: string;
  recentSolutions: string;
  systemStatus: string;
  lastUpdated: number;
  // User role breakdown from backend
  userRoles?: {
    totalUsers: number;
    users: number;
    admins: number;
    superAdmins: number;
  };
}

export interface SystemSettings {
  site: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    maintenanceMode: boolean;
  };
  users: {
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    defaultUserRole: string;
    maxUsersPerDay: number;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    allowOAuth: boolean;
    maxLoginAttempts: number;
  };
  api: {
    rateLimitPerHour: number;
    enableApiDocs: boolean;
    apiTimeout: number;
    maxFileSize: number;
  };
  notifications: {
    emailNotifications: boolean;
    systemAlerts: boolean;
    userWelcomeEmail: boolean;
    adminNotifications: boolean;
  };
  lastUpdated: number;
}

export interface SystemHealth {
  database: string;
  userCount?: number;
  databaseError?: string;
  timestamp: number;
  uptime?: string;
}

export interface ApplicationMetrics {
  database: {
    totalUsers: number;
    totalQuestions: number;
    totalSolutions: number;
    totalApproaches: number;
    totalCategories: number;
  };
  performance: {
    avgResponseTime: string;
    requestsPerMinute: string;
    errorRate: string;
  };
  timestamp: number;
}

export interface GlobalProgress {
  totalUsers: number;
  totalQuestions: number;
  solvedQuestions: number;
  progressByLevel: {
    easy: { total: number; solved: number };
    medium: { total: number; solved: number };
    hard: { total: number; solved: number };
  };
  averageCompletion: number;
  activeUsers: number;
  timestamp: number;
}

export interface GlobalProgressStats {
  totalSolvedGlobally: number;
  activeUsers: number;
  averageQuestionsPerUser: number;
}

// User Management Types
export interface UserListItem {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  createdAt: string; // ISO string from LocalDateTime
  updatedAt: string; // ISO string from LocalDateTime
  primarySuperAdmin: boolean; // matches backend field name
}

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

// ==================== USER PROGRESS TYPES ====================

export interface UserProgressDTO {
  id: string;
  userId: string;
  userName: string;
  questionId: string;
  questionTitle: string;
  solved: boolean;
  level: QuestionLevel;
  solvedAt?: string; // ISO string from LocalDateTime
}

export interface UserProgressStats {
  totalQuestions: number;
  recentSolved: number;
  totalSolved: number;
  progressByLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
  totalByLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
  solvedByLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
  progressPercentage: number;
  recentSolvedQuestions: RecentSolvedQuestion[];
}

export interface RecentSolvedQuestion {
  questionId: string;
  title: string;
  category: string;
  level: string;
  solvedAt: string; // ISO date string
}

export interface CategoryProgressStats {
  totalInCategory: number;
  solvedInCategory: number;
  solvedByLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
  categoryProgressPercentage: number;
}

// ==================== APPROACH TYPES - NEW ====================

export interface ApproachDTO {
  id: string;
  questionId: string;
  questionTitle: string;
  userId: string;
  userName: string;
  textContent: string;
  codeContent?: string;
  codeLanguage?: string;
  contentSize: number;
  createdAt: string; // ISO string from LocalDateTime
  updatedAt: string; // ISO string from LocalDateTime
}

export interface CreateApproachRequest {
  textContent: string;
  codeContent?: string;
  codeLanguage?: string;
}

export interface UpdateApproachRequest {
  textContent: string;
  codeContent?: string;
  codeLanguage?: string;
}

export interface ApproachLimitsResponse {
  canAdd: boolean;
  canAddCount: boolean;
  canAddSize: boolean;
  currentCount: number;
  maxCount: number;
  remainingCount: number;
  currentSize: number;
  newSize: number;
  totalSizeAfterUpdate: number;
  maxAllowedSize: number;
  remainingBytes: number;
}

export interface ApproachSizeUsage {
  totalUsed: number;
  totalUsedKB: number;
  remaining: number;
  remainingKB: number;
  maxAllowed: number;
  maxAllowedKB: number;
  usagePercentage: number;
  approachCount: number;
  maxApproaches: number;
}

export interface ApproachStats {
  totalApproaches: number;
  totalContentSize: number;
  totalContentSizeKB: number;
  approachesByQuestion: Record<string, number>;
}

// Category Management Types
export interface Category {
  id: string;
  name: string;
  createdByName: string;
  createdById: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CategoryStats {
  totalQuestions: number;
  questionsByLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
  totalSolutions: number;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

export interface DeleteCategoryResponse {
  success: boolean;
  deletedQuestions: number;
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

export interface Question {
  id: string;
  title: string;
  statement: string;
  imageUrls?: string[];
  imageFolderUrl?: string; // Backward compatibility
  codeSnippets?: CodeSnippet[];
  categoryId: string;
  categoryName: string;
  level: QuestionLevel;
  createdByName: string;
  createdById: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface QuestionDetail {
  question: Question;
  solutions: Solution[];
  solved: boolean;
  solvedAt?: string; // ISO string
}

export interface CreateQuestionRequest {
  title: string;
  statement: string;
  imageUrls?: string[];
  codeSnippets?: CodeSnippet[];
  categoryId: string;
  level: QuestionLevel;
}

export interface UpdateQuestionRequest {
  title: string;
  statement: string;
  imageUrls?: string[];
  codeSnippets?: CodeSnippet[];
  categoryId: string;
  level: QuestionLevel;
}

// Paginated Question Response (matches Spring Boot Page)
export interface QuestionPageResponse {
  content: Question[];
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

export interface QuestionFilters {
  categoryId?: string;
  level?: QuestionLevel;
  search?: string;
}

export interface QuestionStats {
  total: number;
  byLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
  byCategory: Record<
    string,
    {
      name: string;
      count: number;
    }
  >;
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

// Solution interface
export interface Solution {
  id: string;
  questionId: string;
  questionTitle: string;
  content: string;
  driveLink?: string;
  youtubeLink?: string;
  imageUrls?: string[];
  visualizerFileIds?: string[];
  codeSnippet?: CodeSnippet;
  createdByName: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  youtubeEmbedUrl?: string;
  youtubeVideoId?: string;
}

export interface SolutionDetail extends Solution {
  question: Question;
}

export interface CreateSolutionRequest {
  content: string;
  codeSnippet?: CodeSnippet;
  driveLink?: string;
  youtubeLink?: string;
  imageUrls?: string[];
  visualizerFileIds?: string[];
}

export interface UpdateSolutionRequest {
  content: string;
  codeSnippet?: CodeSnippet;
  driveLink?: string;
  youtubeLink?: string;
  imageUrls?: string[];
  visualizerFileIds?: string[];
}

// Paginated Solution Response (matches Spring Boot Page)
export interface SolutionPageResponse {
  content: Solution[];
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

export interface SolutionFilters {
  questionId?: string;
  creatorId?: string;
  hasImages?: boolean;
  hasVisualizers?: boolean;
  hasYoutubeLink?: boolean;
  hasDriveLink?: boolean;
}

export interface SolutionStats {
  totalSolutions: number;
  solutionsWithImages: number;
  solutionsWithVisualizers: number;
  solutionsWithYoutubeVideos: number;
  solutionsWithDriveLinks: number;
  solutionsWithBothLinks: number;
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

// Question Summary types (for optimized questions list)
export interface QuestionSummary {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  level: QuestionLevel;
  createdAt: string; // ISO string
  userProgress: {
    solved: boolean;
    solvedAt: string | null; // ISO string
    approachCount: number;
  };
}

export interface QuestionSummaryPageResponse {
  content: QuestionSummary[];
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

/**
 * NEW: Combined category with stats and user progress for optimized endpoint
 * This eliminates N+1 queries by getting everything in one API call
 */
export interface CategoryWithProgress {
  // Category basic info
  id: string;
  name: string;
  createdByName: string;
  createdById: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string

  // Category statistics (embedded)
  questionStats: {
    total: number;
    byLevel: {
      easy: number;
      medium: number;
      hard: number;
    };
  };

  // User progress for this category (embedded)
  userProgress: {
    solved: number;
    solvedByLevel: {
      easy: number;
      medium: number;
      hard: number;
    };
    progressPercentage: number;
  };
}

// NEW: Question Summary DTO with embedded user progress (eliminates N+1 queries)
export interface QuestionSummaryDTO {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  level: QuestionLevel;
  createdAt: string;
  userProgress: {
    solved: boolean;
    solvedAt: string | null;
    approachCount: number;
  };
}

// NEW: Question Summary Page Response (optimized pagination)
export interface QuestionSummaryPageResponse {
  content: QuestionSummaryDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

// NEW: Category with embedded progress and stats (eliminates N+1 queries)
export interface CategoryWithProgress {
  id: string;
  name: string;
  createdByName: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  questionStats: {
    total: number;
    byLevel: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
  userProgress: {
    solved: number;
    solvedByLevel: {
      easy: number;
      medium: number;
      hard: number;
    };
    progressPercentage: number;
  };
}

export interface CategoryQuestionStats {
  total: number;
  byLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface CategoryUserProgressStats {
  solved: number;
  solvedByLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
  progressPercentage: number;
}
