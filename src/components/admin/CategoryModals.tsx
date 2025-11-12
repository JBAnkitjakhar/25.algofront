// src/components/admin/CategoryModals.tsx  

'use client';

import { Fragment, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { 
  XMarkIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory,
  useCategoryStats 
} from '@/hooks/useCategoryManagement';
import { CATEGORY_VALIDATION } from '@/constants';
import type { Category } from '@/types';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCategoryModal({ isOpen, onClose }: CreateCategoryModalProps) {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const createCategoryMutation = useCreateCategory();

  const validateName = (value: string): string[] => {
    const errors: string[] = [];
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      errors.push('Category name is required');
    } else {
      if (trimmedValue.length < CATEGORY_VALIDATION.NAME_MIN_LENGTH) {
        errors.push(`Category name must be at least ${CATEGORY_VALIDATION.NAME_MIN_LENGTH} characters long`);
      }
      if (trimmedValue.length > CATEGORY_VALIDATION.NAME_MAX_LENGTH) {
        errors.push(`Category name must be less than ${CATEGORY_VALIDATION.NAME_MAX_LENGTH} characters`);
      }
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateName(name);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    createCategoryMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName('');
          onClose();
        }
      }
    );
  };

  const handleClose = () => {
    setName('');
    setErrors([]);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Create New Category
                  </DialogTitle>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-600"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                      Category Name
                    </label>
                    <input
                      type="text"
                      id="categoryName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter category name..."
                      maxLength={CATEGORY_VALIDATION.NAME_MAX_LENGTH}
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {name.trim().length}/{CATEGORY_VALIDATION.NAME_MAX_LENGTH} characters
                    </div>
                  </div>

                  {errors.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <ul className="text-sm text-red-600 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3 justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={handleClose}
                      disabled={createCategoryMutation.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={createCategoryMutation.isPending || !name.trim()}
                    >
                      {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
}

export function EditCategoryModal({ isOpen, onClose, category }: EditCategoryModalProps) {
  const [name, setName] = useState(category.name);
  const [errors, setErrors] = useState<string[]>([]);

  const updateCategoryMutation = useUpdateCategory();

  const validateName = (value: string): string[] => {
    const errors: string[] = [];
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      errors.push('Category name is required');
    } else {
      if (trimmedValue.length < CATEGORY_VALIDATION.NAME_MIN_LENGTH) {
        errors.push(`Category name must be at least ${CATEGORY_VALIDATION.NAME_MIN_LENGTH} characters long`);
      }
      if (trimmedValue.length > CATEGORY_VALIDATION.NAME_MAX_LENGTH) {
        errors.push(`Category name must be less than ${CATEGORY_VALIDATION.NAME_MAX_LENGTH} characters`);
      }
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateName(name);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (name.trim() === category.name.trim()) {
      setErrors(['No changes detected']);
      return;
    }

    setErrors([]);
    updateCategoryMutation.mutate(
      { id: category.id, request: { name: name.trim() } },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  const handleClose = () => {
    setName(category.name);
    setErrors([]);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                  >
                    <PencilIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Edit Category
                  </DialogTitle>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-600"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                      Category Name
                    </label>
                    <input
                      type="text"
                      id="categoryName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter category name..."
                      maxLength={CATEGORY_VALIDATION.NAME_MAX_LENGTH}
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {name.trim().length}/{CATEGORY_VALIDATION.NAME_MAX_LENGTH} characters
                    </div>
                  </div>

                  {errors.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <ul className="text-sm text-red-600 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3 justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={handleClose}
                      disabled={updateCategoryMutation.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={updateCategoryMutation.isPending || !name.trim() || name.trim() === category.name.trim()}
                    >
                      {updateCategoryMutation.isPending ? 'Updating...' : 'Update Category'}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
}

export function DeleteCategoryModal({ isOpen, onClose, category }: DeleteCategoryModalProps) {
  const deleteCategoryMutation = useDeleteCategory();
  const { data: categoryStats, isLoading: statsLoading } = useCategoryStats(category.id);

  const handleDelete = () => {
    deleteCategoryMutation.mutate(category.id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Delete Category
                  </DialogTitle>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the category <span className="font-medium text-gray-900">{category.name}</span>?
                    </p>
                    
                    {statsLoading ? (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">Loading category statistics...</p>
                      </div>
                    ) : categoryStats && categoryStats.totalQuestions > 0 ? (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800 font-medium">
                          ⚠️ Warning: This will permanently delete:
                        </p>
                        <ul className="mt-2 text-sm text-red-700 space-y-1">
                          <li>• {categoryStats.totalQuestions} question{categoryStats.totalQuestions !== 1 ? 's' : ''}</li>
                          <li>• {categoryStats.totalSolutions} solution{categoryStats.totalSolutions !== 1 ? 's' : ''}</li>
                          <li>• All related user progress data</li>
                        </ul>
                        <p className="mt-2 text-xs text-red-600">
                          This action cannot be undone.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-600">
                          This category has no questions and can be safely deleted.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                    disabled={deleteCategoryMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDelete}
                    disabled={deleteCategoryMutation.isPending}
                  >
                    {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete Category'}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}