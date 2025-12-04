// src/having/userQuestion/types.ts - CORRECTED

export interface QuestionDetail {
  id: string;
  version: number;
  title: string;
  statement: string;
  imageUrls: string[];
  imageFolderUrl: string | null;
  codeSnippets: CodeSnippet[];
  categoryId: string;
  // NO categoryName - fetch separately if needed
  level: 'EASY' | 'MEDIUM' | 'HARD';
  displayOrder: number;
  createdByName: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
  description?: string;
}

export interface UserQuestionProgress {
  solved: boolean;
  solvedAt: string | null;
}

export interface SolutionSummary {
  id: string;
  questionId: string;
  // NO questionTitle - we already know the question context
  content: string;
  driveLink: string | null;
  youtubeLink: string | null;
  imageUrls: string[];
  visualizerFileIds: string[];
  codeSnippet: CodeSnippet | null;
  createdByName: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  youtubeVideoId: string | null;
  youtubeEmbedUrl: string | null;
}

export interface ApproachMetadata {
  id: string;
  questionId: string;
  // NO questionTitle - we already know the question context
  userId: string;
  userName: string;
  codeLanguage: string;
  contentSize: number;
  contentSizeKB: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApproachDetail extends ApproachMetadata {
  textContent: string;
  codeContent: string;
}

export interface CreateApproachRequest {
  textContent: string;
  codeContent: string;
  codeLanguage: string;
}

export interface UpdateApproachRequest {
  textContent: string;
  codeContent: string;
  codeLanguage: string;
}

export interface QuestionPageData {
  question: QuestionDetail | null;
  progress: UserQuestionProgress | null;
  solutions: SolutionSummary[];
  approaches: ApproachMetadata[];
}