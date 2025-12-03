// src/having/adminCategories/types.ts

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

export interface CreateCategoryRequest {
  name: string;
  displayOrder: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  displayOrder?: number;
}

export interface DeleteCategoryResponse {
  success: boolean;
  deletedQuestions: number;
  message: string;
  categoryName: string;
}