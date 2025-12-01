// src/userstats/types.ts

// API Response Types
export interface UserStatsResponse {
  totalSolved: number;
  solvedQuestions: Record<string, string>; // questionId -> solvedAt (ISO date string)
}

export interface QuestionMetadata {
  id: string;
  title: string;
  level: "EASY" | "MEDIUM" | "HARD";
  categoryId: string;
}

export interface QuestionsMetadataResponse {
  questions: Record<string, QuestionMetadata>; // questionId -> metadata
}

export interface CategoryMetadata {
  id: string;
  name: string;
  createdByName: string;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export type CategoriesMetadataResponse = CategoryMetadata[];

// Processed Data Types
export interface SolvedQuestionDetail {
  questionId: string;
  title: string;
  level: "EASY" | "MEDIUM" | "HARD";
  categoryName: string;
  solvedAt: string; // ISO date string
}

export interface UserProgressStats {
  totalSolved: number;
  totalQuestions: number;
  progressPercentage: number;
  
  // Level-wise breakdown
  solvedByLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
  totalByLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
  progressByLevel: {
    easy: number;
    medium: number;
    hard: number;
  };
  
  // Recent activity (last 7 days)
  recentSolved: number;
  recentSolvedQuestions: SolvedQuestionDetail[];
  
  // All solved questions (sorted by latest first)
  allSolvedQuestions: SolvedQuestionDetail[];
}

// Pagination
export interface PaginatedQuestions {
  questions: SolvedQuestionDetail[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}