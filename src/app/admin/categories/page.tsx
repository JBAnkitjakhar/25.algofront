// // src/app/admin/categories/page.tsx - Categories management placeholder
// 'use client';

// import AdminLayout from '@/components/admin/AdminLayout';
// import { TagIcon } from '@heroicons/react/24/outline';

// export default function AdminCategoriesPage() {
//   return (
//     <AdminLayout>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="text-center">
//           <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
//           <h2 className="mt-4 text-xl font-semibold text-gray-900">Categories Management</h2>
//           <p className="mt-2 text-gray-600">
//             This section will be implemented in Phase 3.
//           </p>
//           <p className="mt-1 text-sm text-gray-500">
//             Youll be able to create and manage question categories here.
//           </p>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// }

// src/app/admin/categories/page.tsx - Categories management page

'use client';

import { useState } from 'react';
import { 
  TagIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChartBarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/admin/AdminLayout';
import { useCategories, useCategoryStats } from '@/hooks/useCategoryManagement';
import { CreateCategoryModal, EditCategoryModal, DeleteCategoryModal } from '@/components/admin/CategoryModals';
import { useAuth } from '@/hooks/useAuth';
import { dateUtils } from '@/lib/utils/common';
import type { Category } from '@/types';

function CategoryCard({ category }: { category: Category }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatsExpanded, setShowStatsExpanded] = useState(false);

  const { data: stats, isLoading: statsLoading } = useCategoryStats(category.id);
  const { isAdmin } = useAuth();

  return (
    <>
      <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TagIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">
                  Created by {category.createdByName}
                </p>
              </div>
            </div>
            
            {isAdmin() && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title="Edit category"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center p-2 border border-gray-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  title="Delete category"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</div>
                  <div className="text-xs text-gray-500">Questions</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalSolutions}</div>
                  <div className="text-xs text-gray-500">Solutions</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Unable to load stats</div>
            )}

            {/* Difficulty Breakdown */}
            {stats && stats.totalQuestions > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowStatsExpanded(!showStatsExpanded)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  {showStatsExpanded ? 'Hide' : 'Show'} difficulty breakdown
                </button>
                
                {showStatsExpanded && (
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-green-50 p-2 rounded text-center">
                      <div className="font-medium text-green-800">{stats.questionsByLevel.easy}</div>
                      <div className="text-green-600">Easy</div>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded text-center">
                      <div className="font-medium text-yellow-800">{stats.questionsByLevel.medium}</div>
                      <div className="text-yellow-600">Medium</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded text-center">
                      <div className="font-medium text-red-800">{stats.questionsByLevel.hard}</div>
                      <div className="text-red-600">Hard</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {dateUtils.formatRelativeTime(category.createdAt)}
              </div>
              {category.updatedAt !== category.createdAt && (
                <div className="flex items-center">
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Updated {dateUtils.formatRelativeTime(category.updatedAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        category={category}
      />
      <DeleteCategoryModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        category={category}
      />
    </>
  );
}

function CategoriesGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { data: categories, isLoading, error } = useCategories();
  const { isAdmin } = useAuth();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              Categories Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage question categories for organizing your content.
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
                Add Category
              </button>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {categories && categories.length > 0 && (
          <div className="mt-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Overview</h3>
                    <p className="text-sm text-gray-500">
                      {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} total
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mt-8">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading categories</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error.message || 'Something went wrong. Please try again.'}
                  </div>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white shadow rounded-lg p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="ml-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-12 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CategoriesGrid categories={categories || []} />
          )}
        </div>

        {/* Create Modal */}
        <CreateCategoryModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </AdminLayout>
  );
}