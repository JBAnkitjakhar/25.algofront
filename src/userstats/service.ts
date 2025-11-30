// src/userstats/service.ts

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  UserStatsResponse,
  QuestionsMetadataResponse,
  CategoriesMetadataResponse,
  UserProgressStats,
  SolvedQuestionDetail,
  PaginatedQuestions,
} from "./types";
import { USER_STATS_ENDPOINTS, PAGINATION_CONFIG } from "./constants";

class UserStatsService {
  /**
   * Fetch all required data and process it into UserProgressStats
   */
  async getUserProgressStats(): Promise<ApiResponse<UserProgressStats>> {
    try {
      // Fetch all 3 APIs in parallel
      const [userStatsRes, questionsRes, categoriesRes] = await Promise.all([
        apiClient.get<UserStatsResponse>(USER_STATS_ENDPOINTS.USER_STATS),
        apiClient.get<QuestionsMetadataResponse>(USER_STATS_ENDPOINTS.QUESTIONS_METADATA),
        apiClient.get<CategoriesMetadataResponse>(USER_STATS_ENDPOINTS.CATEGORIES_METADATA),
      ]);

      // Check if all API calls succeeded
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
          error: "Failed to fetch questions metadata",
          message: questionsRes.message || "Unable to load questions data",
        };
      }

      if (!categoriesRes.success || !categoriesRes.data) {
        return {
          success: false,
          error: "Failed to fetch categories metadata",
          message: categoriesRes.message || "Unable to load categories data",
        };
      }

      // Process the data
      const stats = this.processUserStats(
        userStatsRes.data,
        questionsRes.data,
        categoriesRes.data
      );

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching user progress stats:", error);
      return {
        success: false,
        error: "Unexpected error",
        message: "Failed to load your progress data",
      };
    }
  }

  /**
   * Process raw API data into structured UserProgressStats
   */
  private processUserStats(
    userStats: UserStatsResponse,
    questionsMetadata: QuestionsMetadataResponse,
    categoriesMetadata: CategoriesMetadataResponse
  ): UserProgressStats {
    // Step 1: Create categoryId -> name map (O(n))
    const categoryMap = new Map<string, string>();
    categoriesMetadata.forEach((cat) => {
      categoryMap.set(cat.id, cat.name);
    });

    // Step 2: Calculate total questions by level
    const totalByLevel = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    categoriesMetadata.forEach((cat) => {
      totalByLevel.easy += cat.easyCount;
      totalByLevel.medium += cat.mediumCount;
      totalByLevel.hard += cat.hardCount;
    });

    const totalQuestions = totalByLevel.easy + totalByLevel.medium + totalByLevel.hard;

    // Step 3: Process solved questions into array (O(n))
    const solvedQuestionsList: SolvedQuestionDetail[] = [];
    const solvedByLevel = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    Object.entries(userStats.solvedQuestions).forEach(([questionId, solvedAt]) => {
      const questionMeta = questionsMetadata.questions[questionId];
      
      if (questionMeta) {
        const categoryName = categoryMap.get(questionMeta.categoryId) || "Unknown";
        
        solvedQuestionsList.push({
          questionId,
          title: questionMeta.title,
          level: questionMeta.level,
          categoryName,
          solvedAt,
        });

        // Count by level
        const levelKey = questionMeta.level.toLowerCase() as 'easy' | 'medium' | 'hard';
        solvedByLevel[levelKey]++;
      }
    });

    // Step 4: Sort by latest first (O(n log n))
    solvedQuestionsList.sort((a, b) => 
      new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime()
    );

    // Step 5: Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - PAGINATION_CONFIG.MAX_RECENT_DAYS);

    const recentSolvedQuestions = solvedQuestionsList.filter((q) => 
      new Date(q.solvedAt) >= sevenDaysAgo
    );

    // Step 6: Calculate percentages
    const progressPercentage = totalQuestions > 0 
      ? (userStats.totalSolved / totalQuestions) * 100 
      : 0;

    const progressByLevel = {
      easy: totalByLevel.easy > 0 
        ? (solvedByLevel.easy / totalByLevel.easy) * 100 
        : 0,
      medium: totalByLevel.medium > 0 
        ? (solvedByLevel.medium / totalByLevel.medium) * 100 
        : 0,
      hard: totalByLevel.hard > 0 
        ? (solvedByLevel.hard / totalByLevel.hard) * 100 
        : 0,
    };

    return {
      totalSolved: userStats.totalSolved,
      totalQuestions,
      progressPercentage,
      solvedByLevel,
      totalByLevel,
      progressByLevel,
      recentSolved: recentSolvedQuestions.length,
      recentSolvedQuestions,
      allSolvedQuestions: solvedQuestionsList,
    };
  }

  /**
   * Get paginated questions from cached stats
   */
  getPaginatedQuestions(
    allQuestions: SolvedQuestionDetail[],
    page: number
  ): PaginatedQuestions {
    const pageSize = PAGINATION_CONFIG.PAGE_SIZE;
    const totalItems = allQuestions.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    // Ensure page is within bounds
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

export const userStatsService = new UserStatsService();