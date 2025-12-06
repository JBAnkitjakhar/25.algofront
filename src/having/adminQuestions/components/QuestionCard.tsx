// src/having/adminquestions/components/QuestionCard.tsx (UPDATED)

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  TagIcon,
  EyeIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { dateUtils } from "@/lib/utils/common";
import { QUESTION_LEVEL_LABELS, QUESTION_LEVEL_COLORS, ADMIN_ROUTES } from "@/constants";
import type { QuestionWithCategory } from "../types";
import { DeleteQuestionModal } from "./DeleteQuestionModal";

interface QuestionCardProps {
  question: QuestionWithCategory;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isAdmin } = useAuth();

  const levelColors = QUESTION_LEVEL_COLORS[question.level];

  const handleEdit = () => {
    router.push(`${ADMIN_ROUTES.QUESTIONS}/${question.id}/edit`);
  };

  const handleTitleClick = () => {
    router.push(`/questions/${question.id}`);
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 
                onClick={handleTitleClick}
                className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                title="View question"
              >
                {question.title}
              </h3>
              <div className="mt-2 flex items-center space-x-2 flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors.bg} ${levelColors.text}`}
                >
                  {QUESTION_LEVEL_LABELS[question.level]}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <TagIcon className="h-4 w-4 mr-1" />
                  {question.categoryName}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Order:</span>
                  <span className="ml-1">{question.displayOrder}</span>
                </div>
              </div>
            </div>

            {isAdmin() && (
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title="Edit question"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center p-2 border border-gray-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  title="Delete question"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            {question.imageCount > 0 && (
              <div className="flex items-center text-blue-600">
                <EyeIcon className="h-4 w-4 mr-1" />
                {question.imageCount} image{question.imageCount !== 1 ? "s" : ""}
              </div>
            )}

            {question.hasCodeSnippets && (
              <div className="flex items-center text-green-600">
                <CodeBracketIcon className="h-4 w-4 mr-1" />
                Code templates
              </div>
            )}

            {question.solutionCount > 0 && (
              <div className="flex items-center text-purple-600">
                {question.solutionCount} solution{question.solutionCount !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Updated {dateUtils.formatRelativeTime(question.updatedAt)}
              </div>
              <div className="text-right">
                <div>By {question.createdByName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteQuestionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        question={question}
      />
    </>
  );
}