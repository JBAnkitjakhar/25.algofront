// src/having/adminSolutions/types.ts
// Fix the types to use undefined consistently

export interface SolutionSummary {
  id: string;
  questionId: string;
  imageCount: number;
  visualizerCount: number;
  codeLanguage: string | null;
  hasYoutubeLink: boolean;
  hasDriveLink: boolean;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SolutionsSummaryResponse {
  content: SolutionSummary[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface QuestionMetadata {
  id: string;
  title: string;
  level: "EASY" | "MEDIUM" | "HARD";
  categoryId: string;
}

export interface QuestionsMetadataResponse {
  questions: Record<string, QuestionMetadata>;
}

export interface CodeSnippet {
  language: string;
  code: string;
  description?: string;
}

export interface SolutionDetail {
  id: string;
  questionId: string;
  content: string;
  imageUrls?: string[];
  visualizerFileIds?: string[];
  codeSnippet?: CodeSnippet; // ✅ Optional, not null
  youtubeLink?: string; // ✅ Optional, not null
  driveLink?: string; // ✅ Optional, not null
  createdAt: string;
  updatedAt: string;
  createdByName: string;
  updatedByName: string;
}

export interface CreateSolutionRequest {
  questionId: string; // Required by backend but taken from URL
  content: string;
  driveLink?: string;
  youtubeLink?: string;
  imageUrls?: string[];
  visualizerFileIds?: string[];
  codeSnippet?: CodeSnippet;
}

// ✅ FIXED: Changed all null types to undefined
export interface UpdateSolutionRequest {
  questionId: string; // Required by backend
  content?: string;
  driveLink?: string; // ✅ Changed from string | null
  youtubeLink?: string; // ✅ Changed from string | null
  imageUrls?: string[];
  visualizerFileIds?: string[];
  codeSnippet?: CodeSnippet; // ✅ Changed from CodeSnippet | null
}

export interface SolutionWithQuestion extends SolutionSummary {
  questionTitle: string;
  questionLevel: "EASY" | "MEDIUM" | "HARD";
  categoryId: string;
}

export interface VisualizerFile {
  fileId: string;
  filename: string;
  originalFileName: string;
  size: number;
  uploadDate: string;
}

export interface VisualizerFilesResponse {
  data: VisualizerFile[];
}

export interface SolutionStats {
  totalSolutions: number;
  solutionsWithImages: number;
  solutionsWithYoutubeVideos: number;
  solutionsWithVisualizers: number;
}