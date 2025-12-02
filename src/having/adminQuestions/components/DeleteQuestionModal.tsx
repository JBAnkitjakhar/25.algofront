// src/having/adminquestions/components/DeleteQuestionModal.tsx

"use client";

import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { ExclamationTriangleIcon, TagIcon } from "@heroicons/react/24/outline";
import { QUESTION_LEVEL_LABELS, QUESTION_LEVEL_COLORS } from "@/constants";
import type { QuestionWithCategory } from "../types";
import { useDeleteQuestion } from "../hooks";

interface DeleteQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: QuestionWithCategory;
}

export function DeleteQuestionModal({
  isOpen,
  onClose,
  question,
}: DeleteQuestionModalProps) {
  const deleteQuestionMutation = useDeleteQuestion();

  const handleDelete = () => {
    deleteQuestionMutation.mutate(question.id, {
      onSuccess: () => {
        onClose();
      },
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
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Delete Question
                  </DialogTitle>

                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete{" "}
                      <span className="font-medium text-gray-900">
                        {question.title}
                      </span>
                      ?
                    </p>

                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800 font-medium">
                        Warning: This will permanently delete:
                      </p>
                      <ul className="mt-2 text-sm text-red-700 space-y-1">
                        <li>• The question and all its content</li>
                        <li>• All official solutions for this question</li>
                        <li>• All user approaches and submissions</li>
                        <li>• All user progress data for this question</li>
                      </ul>
                      <p className="mt-2 text-xs text-red-600">
                        This action cannot be undone.
                      </p>
                    </div>

                    <div className="mt-3 p-2 bg-gray-50 rounded border">
                      <div className="flex items-center text-sm text-gray-600">
                        <TagIcon className="h-4 w-4 mr-1" />
                        <span className="font-medium">Category:</span>
                        <span className="ml-1">{question.categoryName}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            QUESTION_LEVEL_COLORS[question.level].bg
                          } ${QUESTION_LEVEL_COLORS[question.level].text}`}
                        >
                          {QUESTION_LEVEL_LABELS[question.level]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                    disabled={deleteQuestionMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDelete}
                    disabled={deleteQuestionMutation.isPending}
                  >
                    {deleteQuestionMutation.isPending
                      ? "Deleting..."
                      : "Delete Question"}
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