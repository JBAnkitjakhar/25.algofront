// src/userCategory/service.ts

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  AllCategoriesResponse,
  CategoryResponse,
  UserStatsResponse,
  QuestionsMetadataResponse,
  CategoryWithUserProgress,
  CategoryDetailData,
  QuestionWithSolvedStatus,
  PaginatedQuestions,
} from "./types";
import { USER_CATEGORY_ENDPOINTS, PAGINATION_CONFIG } from "./constants";

class UserCategoryService {
  /**
   * Fetch all categories with user progress
   */
  async getAllCategoriesWithProgress(): Promise<ApiResponse<CategoryWithUserProgress[]>> {
    try {
      // Fetch categories and user stats in parallel
      const [categoriesRes, userStatsRes] = await Promise.all([
        apiClient.get<AllCategoriesResponse>(USER_CATEGORY_ENDPOINTS.ALL_CATEGORIES),
        apiClient.get<UserStatsResponse>(USER_CATEGORY_ENDPOINTS.USER_STATS),
      ]);

      if (!categoriesRes.success || !categoriesRes.data) {
        return {
          success: false,
          error: "Failed to fetch categories",
          message: categoriesRes.message || "Unable to load categories",
        };
      }

      if (!userStatsRes.success || !userStatsRes.data) {
        return {
          success: false,
          error: "Failed to fetch user stats",
          message: userStatsRes.message || "Unable to load your progress",
        };
      }

      // Process data
      const categories = this.processCategoriesWithProgress(
        categoriesRes.data,
        userStatsRes.data
      );

      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      console.error("Error fetching categories with progress:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to load categories",
      };
    }
  }

  /**
   * Fetch specific category with questions
   */
  async getCategoryDetail(categoryId: string): Promise<ApiResponse<CategoryDetailData>> {
    try {
      // Fetch category, user stats, and questions metadata in parallel
      const [categoryRes, userStatsRes, questionsRes] = await Promise.all([
        apiClient.get<CategoryResponse>(USER_CATEGORY_ENDPOINTS.CATEGORY_BY_ID(categoryId)),
        apiClient.get<UserStatsResponse>(USER_CATEGORY_ENDPOINTS.USER_STATS),
        apiClient.get<QuestionsMetadataResponse>(USER_CATEGORY_ENDPOINTS.QUESTIONS_METADATA),
      ]);

      if (!categoryRes.success || !categoryRes.data) {
        return {
          success: false,
          error: "Failed to fetch category",
          message: categoryRes.message || "Unable to load category",
        };
      }

      if (!userStatsRes.success || !userStatsRes.data) {
        return {
          success: false,
          error: "Failed to fetch user stats",
          message: userStatsRes.message || "Unable to load your progress",
        };
      }

      if (!questionsRes.success || !questionsRes.data) {
        return {
          success: false,
          error: "Failed to fetch questions",
          message: questionsRes.message || "Unable to load questions",
        };
      }

      // Process data
      const categoryDetail = this.processCategoryDetail(
        categoryRes.data,
        userStatsRes.data,
        questionsRes.data
      );

      return {
        success: true,
        data: categoryDetail,
      };
    } catch (error) {
      console.error("Error fetching category detail:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to load category details",
      };
    }
  }

  /**
   * Process categories with user progress (O(n) where n = total questions)
   */
  private processCategoriesWithProgress(
    categoriesData: AllCategoriesResponse,
    userStats: UserStatsResponse
  ): CategoryWithUserProgress[] {
    const solvedQuestionsSet = new Set(Object.keys(userStats.solvedQuestions));
    const categories: CategoryWithUserProgress[] = [];

    Object.values(categoriesData).forEach((category) => {
      // Count solved questions by level
      const easySolved = category.easyQuestionIds.filter(id => solvedQuestionsSet.has(id)).length;
      const mediumSolved = category.mediumQuestionIds.filter(id => solvedQuestionsSet.has(id)).length;
      const hardSolved = category.hardQuestionIds.filter(id => solvedQuestionsSet.has(id)).length;
      const totalSolved = easySolved + mediumSolved + hardSolved;

      const progressPercentage = category.totalQuestions > 0
        ? (totalSolved / category.totalQuestions) * 100
        : 0;

      categories.push({
        id: category.id,
        name: category.name,
        displayOrder: category.displayOrder,
        totalQuestions: category.totalQuestions,
        questionCounts: {
          easy: category.easyCount,
          medium: category.mediumCount,
          hard: category.hardCount,
        },
        userSolved: {
          total: totalSolved,
          easy: easySolved,
          medium: mediumSolved,
          hard: hardSolved,
        },
        progressPercentage,
      });
    });

    // Sort by display order
    return categories.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /**
   * Process category detail with questions (O(n) where n = questions in category)
   */
  private processCategoryDetail(
    category: CategoryResponse,
    userStats: UserStatsResponse,
    questionsMetadata: QuestionsMetadataResponse
  ): CategoryDetailData {
    const solvedQuestionsMap = userStats.solvedQuestions;

    // Helper to create question with solved status
    const createQuestionWithStatus = (questionId: string): QuestionWithSolvedStatus | null => {
      const metadata = questionsMetadata.questions[questionId];
      if (!metadata) return null;

      const isSolved = questionId in solvedQuestionsMap;
      return {
        id: questionId,
        title: metadata.title,
        level: metadata.level,
        isSolved,
        solvedAt: isSolved ? solvedQuestionsMap[questionId] : undefined,
      };
    };

    // Process questions by level (already sorted in backend)
    const easyQuestions = category.easyQuestionIds
      .map(createQuestionWithStatus)
      .filter((q): q is QuestionWithSolvedStatus => q !== null);

    const mediumQuestions = category.mediumQuestionIds
      .map(createQuestionWithStatus)
      .filter((q): q is QuestionWithSolvedStatus => q !== null);

    const hardQuestions = category.hardQuestionIds
      .map(createQuestionWithStatus)
      .filter((q): q is QuestionWithSolvedStatus => q !== null);

    // Count solved questions
    const easySolved = easyQuestions.filter(q => q.isSolved).length;
    const mediumSolved = mediumQuestions.filter(q => q.isSolved).length;
    const hardSolved = hardQuestions.filter(q => q.isSolved).length;
    const totalSolved = easySolved + mediumSolved + hardSolved;

    const progressPercentage = category.totalQuestions > 0
      ? (totalSolved / category.totalQuestions) * 100
      : 0;

    return {
      category: {
        id: category.id,
        name: category.name,
        displayOrder: category.displayOrder,
        totalQuestions: category.totalQuestions,
        questionCounts: {
          easy: category.easyCount,
          medium: category.mediumCount,
          hard: category.hardCount,
        },
        userSolved: {
          total: totalSolved,
          easy: easySolved,
          medium: mediumSolved,
          hard: hardSolved,
        },
        progressPercentage,
        questionIds: {
          easy: category.easyQuestionIds,
          medium: category.mediumQuestionIds,
          hard: category.hardQuestionIds,
        },
      },
      questions: {
        easy: easyQuestions,
        medium: mediumQuestions,
        hard: hardQuestions,
      },
    };
  }

  /**
   * Get paginated questions from cached category detail
   */
  getPaginatedQuestions(
    categoryDetail: CategoryDetailData,
    page: number,
    levelFilter?: string
  ): PaginatedQuestions {
    const pageSize = PAGINATION_CONFIG.PAGE_SIZE;
    
    // Combine questions based on level filter
    let allQuestions: QuestionWithSolvedStatus[] = [];
    
    if (!levelFilter || levelFilter === 'all') {
      // All levels: Easy → Medium → Hard
      allQuestions = [
        ...categoryDetail.questions.easy,
        ...categoryDetail.questions.medium,
        ...categoryDetail.questions.hard,
      ];
    } else if (levelFilter === 'EASY') {
      allQuestions = categoryDetail.questions.easy;
    } else if (levelFilter === 'MEDIUM') {
      allQuestions = categoryDetail.questions.medium;
    } else if (levelFilter === 'HARD') {
      allQuestions = categoryDetail.questions.hard;
    }

    const totalItems = allQuestions.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages || 1));
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const questions = allQuestions.slice(startIndex, endIndex);

    return {
      questions,
      currentPage,
      totalPages,
      pageSize,
      totalItems,
    };
  }
}

export const userCategoryService = new UserCategoryService();