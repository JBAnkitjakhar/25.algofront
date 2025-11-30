// src/app/categories/[id]/page.tsx

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { 
  FolderOpen, 
  Search, 
  CheckCircle2, 
  Circle,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useCategoryDetail, usePaginatedCategoryQuestions } from '@/userCategory/hooks';
import { QUESTION_LEVEL_LABELS, QUESTION_LEVEL_COLORS } from '@/constants';
import { dateUtils } from '@/lib/utils/common';
import type { QuestionWithSolvedStatus } from '@/userCategory/types';

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
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
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
    <div className="flex items-center justify-center space-x-2 mt-8">
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

function CategoryDetailContent() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Fetch category detail (3 API calls on first load)
  const { 
    data: categoryDetail, 
    isLoading: categoryLoading,
    error: categoryError 
  } = useCategoryDetail(categoryId);

  // Get paginated questions (uses cached data)
  const {
    data: paginatedData,
    isLoading: paginatedLoading,
  } = usePaginatedCategoryQuestions(categoryId, page, selectedLevel);

  // Filter questions by search term (client-side)
  const filteredQuestions = paginatedData?.questions.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleQuestionClick = (questionId: string) => {
    router.push(`/questions/${questionId}`);
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading category...</p>
        </div>
      </div>
    );
  }

  if (categoryError || !categoryDetail) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <FolderOpen className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {categoryError ? "Error Loading Category" : "Category Not Found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {categoryError instanceof Error ? categoryError.message : "The category you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => router.push('/categories')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Categories
            </button>
          </div>
        </div>
      </UserLayout>
    );
  }

  const { category } = categoryDetail;

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <button
                onClick={() => router.push('/categories')}
                className="flex items-center hover:text-gray-700 dark:hover:text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Categories
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white font-medium">{category.name}</span>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {category.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Master {category.name.toLowerCase()} problems step by step
              </p>

              {/* Progress Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {category.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Problems</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {category.userSolved.total}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Solved</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(category.progressPercentage)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Difficulty Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Easy */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Easy</h3>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {category.questionCounts.easy}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.userSolved.easy}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">solved</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Perfect for getting started
              </p>
            </div>

            {/* Medium */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medium</h3>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {category.questionCounts.medium}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.userSolved.medium}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">solved</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Intermediate challenges
              </p>
            </div>

            {/* Hard */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hard</h3>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {category.questionCounts.hard}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.userSolved.hard}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">solved</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced problem solving
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search problems by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Difficulty Filter */}
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          {/* Questions List */}
          {paginatedLoading && filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || selectedLevel !== 'all' 
                  ? 'Try adjusting your search criteria or filters.' 
                  : 'No questions available in this category yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question: QuestionWithSolvedStatus, index) => {
                const levelKey = question.level.toUpperCase() as keyof typeof QUESTION_LEVEL_COLORS;
                const colors = QUESTION_LEVEL_COLORS[levelKey];
                
                return (
                  <div
                    key={question.id}
                    onClick={() => handleQuestionClick(question.id)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Status Icon */}
                        <div className="flex-shrink-0 pt-1">
                          {question.isSolved ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>

                        {/* Question Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {(page - 1) * 20 + index + 1}. {question.title}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                              {QUESTION_LEVEL_LABELS[levelKey]}
                            </span>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                            {question.isSolved && question.solvedAt && (
                              <div className="flex items-center space-x-1">
                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-green-600 dark:text-green-400">
                                  Solved {dateUtils.formatRelativeTime(question.solvedAt)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {paginatedData && paginatedData.totalPages > 1 && (
            <Pagination
              currentPage={paginatedData.currentPage}
              totalPages={paginatedData.totalPages}
              onPageChange={setPage}
            />
          )}

          {/* Cache Info */}
          {paginatedData && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredQuestions.length} of {paginatedData.totalItems} questions • Cached for 20 minutes
              </p>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

export default function CategoryDetailPage() {
  return (
    <ProtectedRoute>
      <CategoryDetailContent />
    </ProtectedRoute>
  );
}
// ```

// ---

// ## ✅ Summary

// **Added:**
// - ✅ `useAllCategoriesWithProgress()` - Simple 2 API calls
// - ✅ `useCategoryDetail()` - Simple 3 API calls
// - ✅ `usePaginatedCategoryQuestions()` - Client-side pagination
// - ✅ Proper cache reuse across pages

// ### **Caching Strategy:**
// ```
// /categories page:
// - Calls: categories API, user stats API
// - Cache: ['user-category', 'all']
// - Reuses: user stats from /me if visited before

// /categories/[id] page:
// - Calls: category API, user stats API, questions metadata API
// - Cache: ['user-category', 'detail', categoryId]
// - Reuses: user stats, questions metadata from /me if visited before
// - Pagination cache: ['user-category', 'paginated', categoryId, page, level]