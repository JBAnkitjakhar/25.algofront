// src/app/categories/page.tsx  

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserLayout from "@/components/layout/UserLayout";
import { FolderOpen, Search } from "lucide-react";
import { useCategoriesWithProgress } from "@/hooks/useOptimizedCategories";
import type { CategoryWithProgress } from "@/types";

function CategoryCard({ category, onClick }: { 
  category: CategoryWithProgress;
  onClick: () => void;
}) {
  // Data is directly available from the single optimized API call
  const totalQuestions = category.questionStats.total;
  const { easy, medium, hard } = category.questionStats.byLevel;
  const completedProblems = category.userProgress.solved;
  const progressPercentage = category.userProgress.progressPercentage;

  const colorSchemes = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500',
    'bg-indigo-500', 'bg-pink-500', 'bg-teal-500', 'bg-cyan-500', 'bg-emerald-500',
  ];
  const colorIndex = Math.abs(category.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colorSchemes.length;
  const bgColor = colorSchemes[colorIndex];

  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('array')) return '📊';
    if (lowerName.includes('string')) return '🔤';
    if (lowerName.includes('tree') || lowerName.includes('graph')) return '🌳';
    if (lowerName.includes('dynamic') || lowerName.includes('dp')) return '🧠';
    if (lowerName.includes('sort') || lowerName.includes('search')) return '🔍';
    if (lowerName.includes('math') || lowerName.includes('logic')) return '🧮';
    if (lowerName.includes('linked') || lowerName.includes('list')) return '🔗';
    if (lowerName.includes('stack') || lowerName.includes('queue')) return '📚';
    if (lowerName.includes('hash') || lowerName.includes('map')) return '🗺️';
    if (lowerName.includes('bit') || lowerName.includes('manipulation')) return '⚙️';
    return '📁';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group relative"
    >
      {/* Icon positioned on top */}
      <div className="absolute top-3 right-3 z-20 w-16 h-16 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
        <span className="text-2xl">{getIcon(category.name)}</span>
      </div>

      {/* Category Header */}
      <div className={`${bgColor} p-6 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-8 translate-x-8 bg-white"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full translate-y-4 -translate-x-4 bg-white"></div>
        </div>
        
        <h3 className="text-xl font-bold mb-2 relative z-10 pr-20">{category.name}</h3>
        <p className="text-sm opacity-90 relative z-10 pr-20">
          Explore {totalQuestions} problem{totalQuestions !== 1 ? 's' : ''} in this category
        </p>
      </div>

      {/* Category Content */}
      <div className="p-6">
        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalQuestions > 0 ? totalQuestions : '—'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Problems</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {completedProblems}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Solved</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Progress</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            {totalQuestions === 0 ? (
              <span className="text-xs italic">No problems yet</span>
            ) : (
              <>
                {easy > 0 && (
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{easy}</span>
                  </span>
                )}
                {medium > 0 && (
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>{medium}</span>
                  </span>
                )}
                {hard > 0 && (
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{hard}</span>
                  </span>
                )}
              </>
            )}
          </div>
          
          {/* Progress Bar */}
          {totalQuestions > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium">
                {completedProblems}/{totalQuestions}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
function CategoriesContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // SINGLE OPTIMIZED API CALL - Gets categories with embedded stats and user progress
  // Features:
  // - Fresh data on page refresh (staleTime: 0)
  // - Auto-refresh after 30 minutes
  // - Smart caching between navigations
  // - Immediate refetch on window focus
  const { data: categoriesWithProgress = [], isLoading } = useCategoriesWithProgress();

  // Filter categories based on search
  const filteredCategories = categoriesWithProgress.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/categories/${categoryId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
        </div>
      </div>
    );
  }
 
  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Problem Categories
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Explore different categories of coding problems. Progress is tracked in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          {categoriesWithProgress.length > 6 && (
            <div className="mb-8">
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Real-time Update Status */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400">
                ✓ Real-time updates enabled
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                ⚡ Auto-refresh every 30 minutes
              </span>
              <span className="text-purple-600 dark:text-purple-400">
                🔄 Fresh data on page refresh
              </span>
            </div>
          </div>

          {/* Categories Grid */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? "No categories found" : "No categories available"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Categories will appear here once they are created by administrators."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={() => handleCategoryClick(category.id)}
                  />
                ))}
              </div>
              
              {/* Performance Notice */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loaded {categoriesWithProgress.length} categories with real-time progress in a single optimized request
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

export default function CategoriesPage() {
  return (
    <ProtectedRoute>
      <CategoriesContent />
    </ProtectedRoute>
  );
}