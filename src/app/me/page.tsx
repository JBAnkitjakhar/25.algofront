// src/app/me/page.tsx

"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgressStats, usePaginatedSolvedQuestions } from "@/having/userstats/hooks";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserLayout from "@/components/layout/UserLayout";
import { roleUtils } from "@/lib/utils/auth";
import { stringUtils, dateUtils } from "@/lib/utils/common";
import { QUESTION_LEVEL_COLORS, QUESTION_LEVEL_LABELS } from "@/constants";
import { BookOpen, Award, TrendingUp, Clock, Target, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

// Loading component for skeleton UI
function LoadingStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="animate-pulse">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Error component
function ErrorState({ error }: { error: Error }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
        Failed to load progress data
      </h3>
      <p className="text-red-600 dark:text-red-400 text-sm">
        {error.message || "Something went wrong while fetching your progress."}
      </p>
    </div>
  );
}

// Pagination component
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    // Show all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show first, last, and current with ellipsis
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push('...');
      pages.push(totalPages);
    }
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ChevronLeft size={20} />
      </button>

      {pages.map((page, idx) => (
        typeof page === 'number' ? (
          <button
            key={idx}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={idx} className="px-2 text-gray-500">
            {page}
          </span>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

function Content() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useUserProgressStats();

  const {
    data: paginatedData,
    isLoading: paginatedLoading,
  } = usePaginatedSolvedQuestions(currentPage);

  if (!user) return null;

  // Type for stat change types
  type ChangeType = "positive" | "negative" | "neutral";

  // Show error state if API call failed
  if (statsError && !statsLoading) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {stringUtils.getInitials(user.name)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    Welcome back, {user.name.split(" ")[0]}!
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Ready to tackle some coding challenges today?
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ErrorState error={statsError as Error} />
          </div>
        </div>
      </UserLayout>
    );
  }

  // Generate stats cards from real API data
  const statsCards = stats
    ? [
        {
          name: "Problems Solved",
          value: stats.totalSolved.toString(),
          change: `${stats.progressPercentage.toFixed(1)}%`,
          changeType: "positive" as ChangeType,
          icon: BookOpen,
          description: `out of ${stats.totalQuestions} total`,
        },
        {
          name: "Recent Activity",
          value: stats.recentSolved.toString(),
          change: "This week",
          changeType: "neutral" as ChangeType,
          icon: TrendingUp,
          description: "problems solved recently",
        },
        {
          name: "Overall Progress",
          value: `${stats.progressPercentage.toFixed(1)}%`,
          change:
            stats.totalSolved > 0
              ? "+" + stats.totalSolved
              : "0",
          changeType: (stats.totalSolved > 0
            ? "positive"
            : "neutral") as ChangeType,
          icon: Target,
          description: "completion rate",
        },
      ]
    : [];

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Left side - Main welcome content */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {stringUtils.getInitials(user.name)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    Welcome back, {user.name.split(" ")[0]}!
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                    Ready to tackle some coding challenges today?
                  </p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                    <Award size={16} className="mr-2" />
                    {roleUtils.formatRole(user.role)}
                  </div>
                </div>
              </div>

              {/* Right side - User info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 md:min-w-[280px]">
                <div className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                      {user.email ? (
                        <>
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          Email
                        </>
                      ) : user.githubUsername ? (
                        <>
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          GitHub
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Identifier
                        </>
                      )}
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white break-words">
                      {user.email ||
                        (user.githubUsername
                          ? `@${user.githubUsername}`
                          : user.name)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Member Since
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {dateUtils.formatDate(user.createdAt)}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading state for stats */}
          {statsLoading && <LoadingStats />}

          {/* Stats Grid - Real data from API */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {statsCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.name}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                          {stat.name}
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center text-sm">
                        <span
                          className={`font-medium ${
                            stat.changeType === "positive"
                              ? "text-green-600 dark:text-green-400"
                              : stat.changeType === "negative"
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {stat.change}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                          {stat.description}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Progress by Level - Real data from API */}
          {!statsLoading && stats && (
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Progress by Difficulty
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["easy", "medium", "hard"] as const).map((level) => {
                    const solved = stats.solvedByLevel[level];
                    const total = stats.totalByLevel[level];
                    const percentage = stats.progressByLevel[level];
                    const levelKey =
                      level.toUpperCase() as keyof typeof QUESTION_LEVEL_COLORS;
                    const colors = QUESTION_LEVEL_COLORS[levelKey];

                    return (
                      <div key={level} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}
                          >
                            {QUESTION_LEVEL_LABELS[levelKey]}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {solved}/{total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              level === "easy"
                                ? "bg-green-500"
                                : level === "medium"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}% complete
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Solved Questions List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Solved Questions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your solved problems sorted by most recent
              </p>
            </div>
            <div className="p-6">
              {statsLoading || paginatedLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-start space-x-4"
                    >
                      <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : paginatedData && paginatedData.questions.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {paginatedData.questions.map((question) => {
                      const levelKey =
                        question.level.toUpperCase() as keyof typeof QUESTION_LEVEL_COLORS;
                      const colors = QUESTION_LEVEL_COLORS[levelKey];

                      return (
                        <div
                          key={question.questionId}
                          className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <Link
                                href={`/questions/${question.questionId}`}
                                className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                              >
                                {question.title}
                              </Link>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                {dateUtils.formatRelativeTime(question.solvedAt)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                {question.categoryName}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}
                              >
                                {QUESTION_LEVEL_LABELS[levelKey]}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={paginatedData.currentPage}
                    totalPages={paginatedData.totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No solved questions yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Start solving problems to see your progress here.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/categories"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Browse Questions
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default function MePage() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}
 
// usePaginatedSolvedQuestions(page) → Uses cached stats → Returns page of questions