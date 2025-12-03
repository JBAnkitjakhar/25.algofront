// src/having/adminSolutions/components/SolutionCard.tsx
// Card component for solutions list page

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  PhotoIcon,
  PlayIcon,
  FolderOpenIcon,
  CubeTransparentIcon,
  CodeBracketIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { dateUtils } from "@/lib/utils/common";
import { QUESTION_LEVEL_LABELS, QUESTION_LEVEL_COLORS, ADMIN_ROUTES } from "@/constants";
import type { SolutionWithQuestion } from "../types";
import { DeleteSolutionModal } from "./DeleteSolutionModal";

interface SolutionCardProps {
  solution: SolutionWithQuestion;
}

export function SolutionCard({ solution }: SolutionCardProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isAdmin } = useAuth();

  const levelColors = QUESTION_LEVEL_COLORS[solution.questionLevel];

  const handleEdit = () => {
    router.push(`${ADMIN_ROUTES.SOLUTIONS}/${solution.id}/edit`);
  };

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
              <div className="mt-2 flex items-center space-x-2 flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors.bg} ${levelColors.text}`}
                >
                  {QUESTION_LEVEL_LABELS[solution.questionLevel]}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
                  {solution.questionId.substring(0, 8)}...
                </div>
              </div>
            </div>

            {isAdmin() && (
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={handleEdit}
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

          {/* Media and Assets indicators */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {solution.codeLanguage && (
                <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                  <CodeBracketIcon className="h-3 w-3 mr-1" />
                  {solution.codeLanguage}
                </div>
              )}

              {solution.imageCount > 0 && (
                <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs">
                  <PhotoIcon className="h-3 w-3 mr-1" />
                  {solution.imageCount} image{solution.imageCount !== 1 ? "s" : ""}
                </div>
              )}

              {solution.visualizerCount > 0 && (
                <div className="flex items-center text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-xs">
                  <CubeTransparentIcon className="h-3 w-3 mr-1" />
                  {solution.visualizerCount} visualizer{solution.visualizerCount !== 1 ? "s" : ""}
                </div>
              )}

              {solution.hasYoutubeLink && (
                <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs">
                  <PlayIcon className="h-3 w-3 mr-1" />
                  YouTube
                </div>
              )}

              {solution.hasDriveLink && (
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

      {/* Delete Modal */}
      <DeleteSolutionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        solution={solution}
      />
    </>
  );
}