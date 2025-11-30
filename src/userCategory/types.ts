// src/userCategory/types.ts

// API Response Types
export interface CategoryResponse {
  id: string;
  name: string;
  displayOrder: number;
  easyQuestionIds: string[];
  mediumQuestionIds: string[];
  hardQuestionIds: string[];
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  totalQuestions: number;
  createdByName: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export type AllCategoriesResponse = Record<string, CategoryResponse>;

// From user stats API (reusing from userstats)
export interface UserStatsResponse {
  totalSolved: number;
  solvedQuestions: Record<string, string>; // questionId -> solvedAt
}

// From questions metadata API (reusing from userstats)
export interface QuestionMetadata {
  id: string;
  title: string;
  level: "EASY" | "MEDIUM" | "HARD";
  categoryId: string;
}

export interface QuestionsMetadataResponse {
  questions: Record<string, QuestionMetadata>;
}

// Processed Data Types
export interface CategoryWithUserProgress {
  id: string;
  name: string;
  displayOrder: number;
  totalQuestions: number;
  questionCounts: {
    easy: number;
    medium: number;
    hard: number;
  };
  userSolved: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
  };
  progressPercentage: number;
  // For specific category page
  questionIds?: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
}

export interface QuestionWithSolvedStatus {
  id: string;
  title: string;
  level: "EASY" | "MEDIUM" | "HARD";
  isSolved: boolean;
  solvedAt?: string;
}

export interface CategoryDetailData {
  category: CategoryWithUserProgress;
  questions: {
    easy: QuestionWithSolvedStatus[];
    medium: QuestionWithSolvedStatus[];
    hard: QuestionWithSolvedStatus[];
  };
}

// Pagination
export interface PaginatedQuestions {
  questions: QuestionWithSolvedStatus[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}