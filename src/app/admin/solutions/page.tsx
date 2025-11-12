// src/app/admin/solutions/page.tsx - Complete solutions management page with search

"use client";

import { useState, useMemo } from "react";
import {
  LightBulbIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  // EyeIcon,
  CalendarIcon,
  QuestionMarkCircleIcon,
  PhotoIcon,
  PlayIcon,
  FolderOpenIcon,
  CubeTransparentIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuestions } from "@/hooks/useQuestionManagement";
import {
  CreateSolutionModal,
  EditSolutionModal,
  DeleteSolutionModal,
} from "@/components/admin/SolutionModals";
import { useAuth } from "@/hooks/useAuth";
import { dateUtils } from "@/lib/utils/common";
// import { solutionApiService } from "@/lib/api/solutionService";
import type {
  Solution,
  SolutionFilters,
  Question,
} from "@/types";
import { useSolutions, useSolutionStats } from "@/hooks/useSolutionManagement";

function SolutionCard({ solution }: { solution: Solution }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isAdmin } = useAuth();

  // FIXED: Count media assets properly
  const imageCount = solution.imageUrls?.length || 0;
  const visualizerCount = solution.visualizerFileIds?.length || 0; // This should work now
  const hasYoutube = !!solution.youtubeLink;
  const hasDrive = !!solution.driveLink;
  const hasCodeSnippet = !!solution.codeSnippet;

  return (
    <>
      <div className="bg-white shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {solution.questionTitle}
              </h3>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex items-center text-sm text-gray-500">
                  <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
                  Question ID: {solution.questionId}
                </div>
              </div>
            </div>

            {isAdmin() && (
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title="Edit solution"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center p-2 border border-gray-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  title="Delete solution"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Content Preview */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 line-clamp-3">
              {solution.content
                .replace(/!\[.*?\]\(.*?\)/g, "[Image]")
                .replace(/```[\s\S]*?```/g, "[Code Block]")
                .substring(0, 200)}
              {solution.content.length > 200 ? "..." : ""}
            </p>
          </div>

          {/* FIXED: Media and Assets indicators */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {hasCodeSnippet && (
                <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                  <CodeBracketIcon className="h-3 w-3 mr-1" />
                  {solution.codeSnippet?.language}
                </div>
              )}

              {imageCount > 0 && (
                <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs">
                  <PhotoIcon className="h-3 w-3 mr-1" />
                  {imageCount} image{imageCount !== 1 ? "s" : ""}
                </div>
              )}

              {/* FIXED: Visualizer badge - now shows correct count */}
              {visualizerCount > 0 && (
                <div className="flex items-center text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-xs">
                  <CubeTransparentIcon className="h-3 w-3 mr-1" />
                  {visualizerCount} visualizer{visualizerCount !== 1 ? "s" : ""}
                </div>
              )}

              {hasYoutube && (
                <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs">
                  <PlayIcon className="h-3 w-3 mr-1" />
                  YouTube
                </div>
              )}

              {hasDrive && (
                <div className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full text-xs">
                  <FolderOpenIcon className="h-3 w-3 mr-1" />
                  Drive
                </div>
              )}
            </div>
          </div>
 
          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Created {dateUtils.formatRelativeTime(solution.createdAt)}
              </div>
              <div className="text-right">
                <div>By {solution.createdByName}</div>
                {solution.updatedAt !== solution.createdAt && (
                  <div className="text-xs">
                    Updated {dateUtils.formatRelativeTime(solution.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditSolutionModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        solution={solution}
      />
      <DeleteSolutionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        solution={solution}
      />
    </>
  );
}

function SearchAndFilterBar({
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
}: {
  filters: SolutionFilters;
  onFiltersChange: (filters: SolutionFilters) => void;
  questions: Question[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  const clearSearch = () => onSearchChange("");
  
  const hasActiveFilters = searchQuery || filters.questionId || filters.hasImages || 
    filters.hasVisualizers || filters.hasYoutubeLink || filters.hasDriveLink || filters.creatorId;

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-4">
      <div className="flex items-center gap-2">
        <FunnelIcon className="h-5 w-5 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900">Search & Filters</h3>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by question title..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {searchQuery && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              type="button"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-600">
            {searchQuery && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                Search: {searchQuery}
                <button
                  onClick={clearSearch}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <button
            onClick={() => {
              onFiltersChange({});
              onSearchChange("");
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

function SolutionsGrid({
  solutions,
  isLoading,
  error,
}: {
  solutions: Solution[];
  isLoading: boolean;
  error: Error | null;
}) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading solutions
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error.message || "Something went wrong. Please try again."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="mt-2 flex space-x-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className="text-center py-12">
        <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No solutions found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filters, or create your first solution.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {solutions.map((solution) => (
        <SolutionCard key={solution.id} solution={solution} />
      ))}
    </div>
  );
}

export default function AdminSolutionsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<SolutionFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Reset page when search or filters change
  const resetPage = () => setPage(0);

  // Filter solutions based on search query (client-side filtering for question title)
  // const filteredSolutions = useMemo(() => {
  //   // This will be used if your API doesn't support search, otherwise you can pass searchQuery to API
  //   return []; // Will be replaced by API results
  // }, [searchQuery]);

  // Convert filters for API call
  const apiParams = useMemo(
    () => ({
      page,
      size: pageSize,
      questionId: filters.questionId,
      creatorId: filters.creatorId,
      // If your API supports search, add: search: searchQuery
    }),
    [page, filters]
  );

  const {
    data: solutionsData,
    isLoading: solutionsLoading,
    error: solutionsError,
  } = useSolutions(apiParams);
  const { data: questionsData } = useQuestions({ size: 100 }); // Get all questions for filter
  const { data: stats } = useSolutionStats();
  const { isAdmin } = useAuth();

  // Client-side search filtering if API doesn't support it
  const solutions = useMemo(() => {
    const allSolutions = solutionsData?.content || [];
    
    if (!searchQuery.trim()) {
      return allSolutions;
    }
    
    return allSolutions.filter(solution => 
      solution.questionTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [solutionsData?.content, searchQuery]);

  const questions = questionsData?.content || [];
  const totalPages = solutionsData?.totalPages || 0;

  // Handle search change and reset page
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    resetPage();
  };

  // Handle filter change and reset page
  const handleFiltersChange = (newFilters: SolutionFilters) => {
    setFilters(newFilters);
    resetPage();
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              Solutions Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage official solutions with rich content, code snippets, media, and interactive visualizers.
            </p>
          </div>
          {isAdmin() && (
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Solution
              </button>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <LightBulbIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Solutions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalSolutions}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <PhotoIcon className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        With Images
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.solutionsWithImages}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <PlayIcon className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        With Videos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.solutionsWithYoutubeVideos}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CubeTransparentIcon className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        With Visualizers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.solutionsWithVisualizers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mt-8">
          <SearchAndFilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            questions={questions}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
        </div>

        {/* Results Summary */}
        {(searchQuery || Object.keys(filters).some(key => filters[key as keyof SolutionFilters])) && (
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              Showing {solutions.length} result{solutions.length !== 1 ? 's' : ''} 
              {searchQuery && ` for "${searchQuery}"`}
            </div>
          </div>
        )}

        {/* Solutions Grid */}
        <div className="mt-8">
          <SolutionsGrid
            solutions={solutions}
            isLoading={solutionsLoading}
            error={solutionsError}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{page * pageSize + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(
                      (page + 1) * pageSize,
                      solutionsData?.totalElements || 0
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {solutionsData?.totalElements || 0}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum =
                      Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pageNum === page
                            ? "z-10 bg-blue-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        <CreateSolutionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </AdminLayout>
  );
}