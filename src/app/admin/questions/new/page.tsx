// src/app/admin/questions/new/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "@tiptap/react";
import { QuestionEditor } from "@/having/adminQuestions/components";
import {
  useCreateQuestion,
  useCategoriesMetadata,
} from "@/having/adminQuestions/hooks";
import {
  QUESTION_VALIDATION,
  ADMIN_ROUTES,
  QUESTION_LEVEL_LABELS,
} from "@/constants";
import type {
  CreateQuestionRequest,
  QuestionLevel,
} from "@/having/adminQuestions/types";
import {
  ArrowLeftIcon,
  SaveIcon,
  Loader2Icon,
  HelpCircleIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { QuestionEditorSidebar } from "@/having/adminQuestions/components/QuestionEditorSidebar";
import { CodeSnippetsManager } from "@/having/adminQuestions/components";

export default function CreateQuestionPage() {
  const router = useRouter();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [formData, setFormData] = useState<CreateQuestionRequest>({
    title: "",
    statement: "",
    categoryId: "",
    level: "EASY",
    displayOrder: 1,
    imageUrls: [],
    codeSnippets: [],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [statementSize, setStatementSize] = useState(0);

  const { data: categories, isLoading: categoriesLoading } =
    useCategoriesMetadata();
  const createQuestionMutation = useCreateQuestion();

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push("Question title is required");
    } else {
      if (formData.title.trim().length < QUESTION_VALIDATION.TITLE_MIN_LENGTH) {
        errors.push(
          `Title must be at least ${QUESTION_VALIDATION.TITLE_MIN_LENGTH} characters`
        );
      }
      if (formData.title.trim().length > QUESTION_VALIDATION.TITLE_MAX_LENGTH) {
        errors.push(
          `Title must be less than ${QUESTION_VALIDATION.TITLE_MAX_LENGTH} characters`
        );
      }
    }

    if (!formData.statement.trim()) {
      errors.push("Question statement is required");
    } else {
      const size = new Blob([formData.statement]).size;
      setStatementSize(size);

      if (
        formData.statement.trim().length <
        QUESTION_VALIDATION.STATEMENT_MIN_LENGTH
      ) {
        errors.push(
          `Statement must be at least ${QUESTION_VALIDATION.STATEMENT_MIN_LENGTH} characters`
        );
      }
      if (size > QUESTION_VALIDATION.STATEMENT_MAX_LENGTH) {
        errors.push(`Statement size exceeds maximum allowed`);
      }
    }

    if (!formData.categoryId) {
      errors.push("Category is required");
    }

    if (!formData.displayOrder || formData.displayOrder < 1) {
      errors.push("Display order must be at least 1");
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    createQuestionMutation.mutate(formData, {
      onSuccess: () => {
        router.push(ADMIN_ROUTES.QUESTIONS);
      },
    });
  };

  const updateFormData = <T extends keyof CreateQuestionRequest>(
    field: T,
    value: CreateQuestionRequest[T]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isOverSize = statementSize > QUESTION_VALIDATION.STATEMENT_MAX_LENGTH;
  const isWarningSize =
    statementSize > QUESTION_VALIDATION.STATEMENT_MAX_LENGTH * 0.8;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar - Editor Tools */}
      <QuestionEditorSidebar editor={editor} />

      {/* Main Content Area */}
      <div className="flex-1 max-w-5xl mx-auto px-6 py-8 overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push(ADMIN_ROUTES.QUESTIONS)}
          className="flex items-center text-gray-700 hover:text-gray-900 font-medium transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Questions
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Question
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new coding question with rich text editor and code templates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Question Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter question title..."
              maxLength={QUESTION_VALIDATION.TITLE_MAX_LENGTH}
            />
            <div className="mt-1 text-xs text-gray-500">
              {formData.title.length}/{QUESTION_VALIDATION.TITLE_MAX_LENGTH}{" "}
              characters
            </div>
          </div>

          {/* Category, Level, Display Order */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) => updateFormData("categoryId", e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={categoriesLoading}
                >
                  <option value="">Select a category</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Difficulty Level *
                </label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) =>
                    updateFormData("level", e.target.value as QuestionLevel)
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.entries(QUESTION_LEVEL_LABELS).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="displayOrder"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Display Order *
                </label>
                <input
                  type="number"
                  id="displayOrder"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    updateFormData(
                      "displayOrder",
                      parseInt(e.target.value) || 1
                    )
                  }
                  min="1"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Question Statement Editor */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Statement *
            </label>
            <QuestionEditor
              content={formData.statement}
              onChange={(content) => {
                updateFormData("statement", content);
                setStatementSize(new Blob([content]).size);
              }}
              onEditorReady={setEditor}
            />
          </div>

          {/* Code Snippets */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Starter Code Templates (Optional)
            </label>
            <CodeSnippetsManager
              codeSnippets={formData.codeSnippets || []}
              onChange={(snippets) => updateFormData("codeSnippets", snippets)}
            />
          </div>
        </form>
      </div>

      {/* Right Sidebar - Actions & Info */}
      <div className="w-72 border-l border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="sticky top-0 p-4 space-y-4 max-h-screen overflow-y-auto">
          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleSubmit}
              disabled={createQuestionMutation.isPending || isOverSize}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {createQuestionMutation.isPending ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4" />
                  Create Question
                </>
              )}
            </button>
            <button
              onClick={() => router.push(ADMIN_ROUTES.QUESTIONS)}
              className="w-full px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>

          {/* Statement Size */}
          <div
            className={`p-4 rounded-lg border-2 transition-all ${
              isOverSize
                ? "bg-red-50 border-red-500"
                : isWarningSize
                ? "bg-yellow-50 border-yellow-400"
                : "bg-blue-50 border-blue-300"
            }`}
          >
            <div className="flex items-start space-x-2 mb-2">
              {isOverSize && (
                <AlertTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3
                  className={`font-semibold text-sm mb-1 ${
                    isOverSize
                      ? "text-red-900"
                      : isWarningSize
                      ? "text-yellow-900"
                      : "text-blue-900"
                  }`}
                >
                  📊 Statement Size
                </h3>
                <div
                  className={`space-y-1 text-xs ${
                    isOverSize
                      ? "text-red-700"
                      : isWarningSize
                      ? "text-yellow-700"
                      : "text-blue-700"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>Current:</span>
                    <span className="font-semibold">
                      {formatSize(statementSize)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isOverSize
                          ? "bg-red-600"
                          : isWarningSize
                          ? "bg-yellow-500"
                          : "bg-blue-600"
                      }`}
                      style={{
                        width: `${Math.min(
                          (statementSize /
                            QUESTION_VALIDATION.STATEMENT_MAX_LENGTH) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-red-900 mb-2">
                Validation Errors
              </h3>
              <ul className="text-xs text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Help */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2 text-gray-700 font-medium">
              <HelpCircleIcon className="w-5 h-5" />
              <span>Quick Help</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">
                📝 Formatting
              </h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Use left toolbar for styles</li>
                <li>• Select custom colors</li>
                <li>• Bold, italic, inline code</li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">🖼️ Images</h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>
                  • <strong>Max 2MB per image</strong>
                </li>
                <li>
                  • <strong>Max 5 images per question</strong>
                </li>
                <li>• Auto-centered display</li>
                <li>• Use left sidebar button</li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">
                💻 Code Templates
              </h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Add starter code for users</li>
                <li>• Multiple languages supported</li>
                <li>• Max 10 templates per question</li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">📊 Limits</h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Title: Max 200 characters</li>
                <li>• Statement: Max 10MB</li>
                <li>• Images: 5 max, 2MB each</li>
                <li>• Code snippets: Max 10</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
