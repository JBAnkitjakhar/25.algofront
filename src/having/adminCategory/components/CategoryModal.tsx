// src/having/adminCategory/components/CategoryModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CreateCategoryRequest, CategoryResponse } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
  category?: CategoryResponse | null;
  isSubmitting: boolean;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  isSubmitting
}: CategoryModalProps) {
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    displayOrder: 1
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        displayOrder: category.displayOrder
      });
    } else {
      setFormData({
        name: '',
        displayOrder: 1
      });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({ name: '', displayOrder: 1 });
    onClose();
  };

  const handleDisplayOrderChange = (value: string) => {
    const parsed = parseInt(value);
    // If empty string or NaN, default to 0, otherwise use parsed value (minimum 0)
    const displayOrder = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setFormData({ ...formData, displayOrder });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white">
            {category ? 'Edit Category' : 'Create Category'}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Category Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              placeholder="e.g., Arrays, Graphs"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Display Order
            </label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => handleDisplayOrderChange(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              min="0"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-700 px-4 py-3 font-medium text-gray-300 hover:bg-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}