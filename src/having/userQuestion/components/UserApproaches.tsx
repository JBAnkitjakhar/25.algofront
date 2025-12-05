// src/having/userQuestion/components/UserApproaches.tsx

"use client";

import { useState } from "react";
import { Edit, Trash2, ChevronDown, ChevronUp, Code } from "lucide-react";
import {
  useApproachesByQuestion,
  useDeleteApproach,
  useApproachDetail,
} from "@/having/userQuestion/hooks";
import { dateUtils } from "@/lib/utils/common";
import type { ApproachDetail } from "@/having/userQuestion/types"; // CHANGED

interface UserApproachesProps {
  questionId: string;
  onEditApproach?: (approach: ApproachDetail) => void; // CHANGED from ApproachDTO
}

export function UserApproaches({
  questionId,
  onEditApproach,
}: UserApproachesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: approaches, isLoading } = useApproachesByQuestion(questionId);
  const deleteMutation = useDeleteApproach();

  // Fetch full approach when needed for editing
  const { data: approachDetail } = useApproachDetail(
    questionId,
    expandedId || ""
  );

  const handleDelete = (approachId: string) => {
    if (!confirm("Are you sure you want to delete this approach?")) return;

    setDeletingId(approachId);
    deleteMutation.mutate(
      { questionId, approachId },
      {
        onSettled: () => setDeletingId(null),
      }
    );
  };

  const handleEdit = (approachId: string) => {
    // We need the full approach detail to edit
    if (approachDetail && approachDetail.id === approachId) {
      onEditApproach?.(approachDetail);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading approaches...</div>;
  }

  if (!approaches || approaches.length === 0) {
    return (
      <div className="text-center py-12">
        <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Approaches Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Submit your solution using the compiler to track your approaches
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          My Approaches ({approaches.length})
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total size:{" "}
          {(
            approaches.reduce((sum, a) => sum + a.contentSize, 0) / 1024
          ).toFixed(1)}{" "}
          KB
        </div>
      </div>

      {approaches.map((approach) => (
        <div
          key={approach.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <div className="p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
                  {approach.codeLanguage}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {approach.contentSizeKB} KB
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === approach.id ? null : approach.id
                    )
                  }
                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {expandedId === approach.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => handleEdit(approach.id)}
                  disabled={
                    !approachDetail || approachDetail.id !== approach.id
                  }
                  className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50"
                  title="Edit approach"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(approach.id)}
                  disabled={deletingId === approach.id}
                  className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                  title="Delete approach"
                >
                  {deletingId === approach.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last updated {dateUtils.formatRelativeTime(approach.updatedAt)}
            </p>
          </div>

          {expandedId === approach.id && approachDetail && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description:
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {approachDetail.textContent || "No description provided"}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code Preview:
                </h4>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-xs">
                  {approachDetail.codeContent
                    ? approachDetail.codeContent.substring(0, 500) +
                      (approachDetail.codeContent.length > 500 ? "..." : "")
                    : "No code content"}
                </pre>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
