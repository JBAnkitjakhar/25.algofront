// src/having/adminSolutions/components/QuestionSelector.tsx
// Add explicit export

"use client";

import { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronUpDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import type { QuestionMetadata } from "../types";

interface QuestionSelectorProps {
  selectedQuestionId: string;
  onQuestionSelect: (questionId: string) => void;
  questions: Record<string, QuestionMetadata>;
}

// ✅ FIXED: Added explicit named export
export function QuestionSelector({
  selectedQuestionId,
  onQuestionSelect,
  questions,
}: QuestionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const questionsArray = useMemo(() => Object.values(questions), [questions]);

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questionsArray;

    const query = searchQuery.toLowerCase();
    return questionsArray.filter((q) => q.title.toLowerCase().includes(query));
  }, [questionsArray, searchQuery]);

  const selectedQuestion = questions[selectedQuestionId];

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Select Question *</label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm hover:border-gray-400"
      >
        <span className="flex items-center">
          {selectedQuestion ? (
            <>
              <span className="ml-3 block truncate font-medium">{selectedQuestion.title}</span>
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {selectedQuestion.level}
              </span>
            </>
          ) : (
            <span className="ml-3 block truncate text-gray-400">
              Search and select a question...
            </span>
          )}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {/* Search Input */}
          <div className="sticky top-0 z-10 bg-white px-3 py-2 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Questions List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredQuestions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchQuery
                  ? `No questions found for "${searchQuery}"`
                  : "No questions available"}
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => {
                    onQuestionSelect(question.id);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className={`relative w-full cursor-pointer select-none py-2 pl-3 pr-9 text-left hover:bg-blue-50 ${
                    question.id === selectedQuestionId
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span
                        className={`block truncate font-medium ${
                          question.id === selectedQuestionId ? "font-semibold" : ""
                        }`}
                      >
                        {question.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            question.level === "EASY"
                              ? "bg-green-100 text-green-800"
                              : question.level === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {question.level}
                        </span>
                      </div>
                    </div>

                    {question.id === selectedQuestionId && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected Question Info */}
      {selectedQuestion && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-blue-900">{selectedQuestion.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    selectedQuestion.level === "EASY"
                      ? "bg-green-100 text-green-800"
                      : selectedQuestion.level === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedQuestion.level}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onQuestionSelect("")}
              className="text-blue-400 hover:text-blue-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Also add default export for flexibility
export default QuestionSelector;