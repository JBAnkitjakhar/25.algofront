// src/having/adminCategories/components/DeleteCategoryModal.tsx

'use client';

import { X, AlertTriangle } from 'lucide-react';
import { CategoryResponse } from '../types';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  category: CategoryResponse | null;
  isDeleting: boolean;
}

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  category,
  isDeleting
}: DeleteCategoryModalProps) {
  if (!isOpen || !category) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-500/10 p-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-white">Delete Category</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="mb-4 text-gray-300">
            Are you sure you want to delete <span className="font-semibold text-white">{category.name}</span>?
          </p>
          
          <div className="rounded-lg bg-red-500/10 p-4 mb-6">
            <p className="text-sm text-red-400">
              <strong>Warning:</strong> This will permanently delete:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-red-400">
              <li>• The category</li>
              <li>• {category.totalQuestions} questions in this category</li>
              <li>• All solutions for those questions</li>
              <li>• All user approaches for those questions</li>
              <li>• All user progress for those questions</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 rounded-lg border border-gray-700 px-4 py-3 font-medium text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}