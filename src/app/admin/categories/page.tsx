// src/app/admin/categories/page.tsx

'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useCategoryManagement } from '@/having/adminCategory/hooks';
import { CategoryResponse } from '@/having/adminCategory/types';
import CategoryModal from '@/having/adminCategory/components/CategoryModal';
import DeleteCategoryModal from '@/having/adminCategory/components/DeleteCategoryModal';

export default function AdminCategoriesPage() {
  const { 
    categories, 
    isLoading, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting
  } = useCategoryManagement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleModalSubmit = async (data: { name: string; displayOrder: number }) => {
    if (selectedCategory) {
      await updateCategory({ id: selectedCategory.id, request: data });
    } else {
      await createCategory(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedCategory) {
      await deleteCategory(selectedCategory.id);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage question categories and organization
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Category
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Display Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Category Name
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                      Easy
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                      Medium
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                      Hard
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Created By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Updated At
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {categories?.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {category.displayOrder}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                          {category.easyCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                          {category.mediumCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
                          {category.hardCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                          {category.totalQuestions}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {category.createdByName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(category.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Edit category"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Delete category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <CategoryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleModalSubmit}
            category={selectedCategory}
            isSubmitting={isCreating || isUpdating}
          />

          <DeleteCategoryModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            category={selectedCategory}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </AdminLayout>
  );
}