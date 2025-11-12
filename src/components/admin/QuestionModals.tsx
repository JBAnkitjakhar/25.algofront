// src/components/admin/QuestionModals.tsx - Complete and fixed version

"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TagIcon,
  TrashIcon,
  CodeBracketIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { RichTextEditor } from "./QuestionRichTextEditor";
import { MarkdownRenderer } from "../common/MarkdownRenderer";
import {
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/hooks/useQuestionManagement";
import { useCategories } from "@/hooks/useCategoryManagement";
import {
  QUESTION_VALIDATION,
  QUESTION_LEVEL_LABELS,
  QUESTION_LEVEL_COLORS,
} from "@/constants";
import type {
  Question,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  QuestionLevel,
  CodeSnippet,
} from "@/types";

const PROGRAMMING_LANGUAGES = [
  {
    value: "javascript",
    label: "JavaScript",
    template:
      "function solution() {\n    // Your JavaScript solution here\n    return null;\n}",
  },
  {
    value: "python",
    label: "Python",
    template: "def solution():\n    # Your Python solution here\n    pass",
  },
  {
    value: "java",
    label: "Java",
    template:
      "public class Solution {\n    public void solution() {\n        // Your Java solution here\n    }\n}",
  },
  {
    value: "cpp",
    label: "C++",
    template:
      "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your C++ solution here\n    return 0;\n}",
  },
  {
    value: "c",
    label: "C",
    template:
      "#include <stdio.h>\n\nint main() {\n    // Your C solution here\n    return 0;\n}",
  },
  {
    value: "typescript",
    label: "TypeScript",
    template:
      "function solution(): void {\n    // Your TypeScript solution here\n}",
  },
  {
    value: "go",
    label: "Go",
    template:
      'package main\n\nimport "fmt"\n\nfunc main() {\n    // Your Go solution here\n}',
  },
  {
    value: "rust",
    label: "Rust",
    template: "fn main() {\n    // Your Rust solution here\n}",
  },
];

// // Helper function to extract all image URLs from markdown content
// function extractImageUrlsFromMarkdown(content: string): string[] {
//   const imageRegex = /!\[.*?\]\((.*?)\)/g;
//   const urls: string[] = [];
//   let match;
//   while ((match = imageRegex.exec(content)) !== null) {
//     urls.push(match[1]);
//   }
//   return urls;
// }

interface CodeSnippetsManagerProps {
  codeSnippets: CodeSnippet[];
  onChange: (snippets: CodeSnippet[]) => void;
}

function CodeSnippetsManager({
  codeSnippets,
  onChange,
}: CodeSnippetsManagerProps) {
  const addCodeSnippet = () => {
    // Always start with JavaScript as default, but user can change it
    const defaultLanguage = PROGRAMMING_LANGUAGES[0]; // JavaScript
    
    const newSnippet: CodeSnippet = {
      language: defaultLanguage.value,
      code: defaultLanguage.template,
      description: `${defaultLanguage.label} starter template`,
    };
    onChange([...codeSnippets, newSnippet]);
  };

  const updateCodeSnippet = (
    index: number,
    field: keyof CodeSnippet,
    value: string
  ) => {
    const updated = codeSnippets.map((snippet, i) =>
      i === index ? { ...snippet, [field]: value } : snippet
    );
    onChange(updated);
  };

  const removeCodeSnippet = (index: number) => {
    onChange(codeSnippets.filter((_, i) => i !== index));
  };

  const handleLanguageChange = (index: number, language: string) => {
    const selectedLanguage = PROGRAMMING_LANGUAGES.find((lang) => lang.value === language);
    const template = selectedLanguage?.template || "";
    const description = `${selectedLanguage?.label} starter template`;
    
    // Update language, code template, and description together
    const updated = codeSnippets.map((snippet, i) =>
      i === index 
        ? { 
            ...snippet, 
            language: language,
            code: template,
            description: description
          } 
        : snippet
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {codeSnippets.map((snippet, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Code Template {index + 1}
            </h4>
            <button
              type="button"
              onClick={() => removeCodeSnippet(index)}
              className="text-red-600 hover:text-red-800"
              title="Remove code snippet"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Language
              </label>
              <select
                value={snippet.language}
                onChange={(e) => handleLanguageChange(index, e.target.value)}
                className="w-full text-sm rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {PROGRAMMING_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Description
              </label>
              <input
                type="text"
                value={snippet.description}
                onChange={(e) =>
                  updateCodeSnippet(index, "description", e.target.value)
                }
                className="w-full text-sm rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Brief description of this template"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Code Template
            </label>
            <textarea
              value={snippet.code}
              onChange={(e) => updateCodeSnippet(index, "code", e.target.value)}
              className="w-full h-32 text-sm font-mono rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter starter code template..."
            />
          </div>
        </div>
      ))}

      {codeSnippets.length < 5 && (
        <button
          type="button"
          onClick={addCodeSnippet}
          className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <CodeBracketIcon className="h-4 w-4 mr-2" />
          Add Code Template
        </button>
      )}

      <div className="text-xs text-gray-500">
        Code templates help users get started with their solutions. Maximum 5
        templates per question.
      </div>
    </div>
  );
}

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateQuestionModal({
  isOpen,
  onClose,
}: CreateQuestionModalProps) {
  const [formData, setFormData] = useState<CreateQuestionRequest>({
    title: "",
    statement: "",
    categoryId: "",
    level: "EASY" as QuestionLevel,
    imageUrls: [],
    codeSnippets: [],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { data: categories } = useCategories();
  const createQuestionMutation = useCreateQuestion();

  // Update imageUrls when statement changes (extract from markdown)
  const handleStatementChange = useCallback((value: string) => {
    // const extractedUrls = extractImageUrlsFromMarkdown(value);
    setFormData((prev) => ({
      ...prev,
      statement: value,
      // imageUrls: extractedUrls // Sync with markdown content
    }));
  }, []);

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push("Question title is required");
    } else {
      if (formData.title.trim().length < QUESTION_VALIDATION.TITLE_MIN_LENGTH) {
        errors.push(
          `Title must be at least ${QUESTION_VALIDATION.TITLE_MIN_LENGTH} characters long`
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
      if (
        formData.statement.trim().length <
        QUESTION_VALIDATION.STATEMENT_MIN_LENGTH
      ) {
        errors.push(
          `Statement must be at least ${QUESTION_VALIDATION.STATEMENT_MIN_LENGTH} characters long`
        );
      }
      if (
        formData.statement.trim().length >
        QUESTION_VALIDATION.STATEMENT_MAX_LENGTH
      ) {
        errors.push(
          `Statement must be less than ${QUESTION_VALIDATION.STATEMENT_MAX_LENGTH} characters`
        );
      }
    }

    if (!formData.categoryId) {
      errors.push("Category is required");
    }

    if (!formData.level) {
      errors.push("Difficulty level is required");
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

    // const finalImageUrls = extractImageUrlsFromMarkdown(formData.statement);
    const submissionData = {
      ...formData,
      // imageUrls: finalImageUrls,
    };

    setErrors([]);
    createQuestionMutation.mutate(submissionData, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const handleClose = () => {
    setFormData({
      title: "",
      statement: "",
      categoryId: "",
      level: "EASY" as QuestionLevel,
      imageUrls: [],
      codeSnippets: [],
    });
    setErrors([]);
    setShowPreview(false);
    onClose();
  };

  const updateFormData = <T extends keyof CreateQuestionRequest>(
    field: T,
    value: CreateQuestionRequest[T]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
              <DialogPanel className="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Create New Question
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium ${
                        showPreview
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {showPreview ? "Hide Preview" : "Show Preview"}
                    </button>
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-600"
                      onClick={handleClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div
                  className={`grid ${
                    showPreview ? "grid-cols-2 gap-6" : "grid-cols-1"
                  }`}
                >
                  <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Question Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={formData.title}
                          onChange={(e) =>
                            updateFormData("title", e.target.value)
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter question title..."
                          maxLength={QUESTION_VALIDATION.TITLE_MAX_LENGTH}
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          {formData.title.length}/
                          {QUESTION_VALIDATION.TITLE_MAX_LENGTH} characters
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="category"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Category
                          </label>
                          <select
                            id="category"
                            value={formData.categoryId}
                            onChange={(e) =>
                              updateFormData("categoryId", e.target.value)
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Difficulty Level
                          </label>
                          <select
                            id="level"
                            value={formData.level}
                            onChange={(e) =>
                              updateFormData(
                                "level",
                                e.target.value as QuestionLevel
                              )
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
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Statement
                        </label>
                        <RichTextEditor
                          value={formData.statement}
                          onChange={handleStatementChange}
                          placeholder="Write your question statement here. Upload images and click on them to insert at cursor position..."
                          maxLength={QUESTION_VALIDATION.STATEMENT_MAX_LENGTH}
                          uploadedImages={formData.imageUrls || []}
                          onImagesChange={(images) => {
                            // console.log("Images changed:", images); // Add this debug
                            updateFormData("imageUrls", images);
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Starter Code Templates (Optional)
                        </label>
                        <CodeSnippetsManager
                          codeSnippets={formData.codeSnippets || []}
                          onChange={(snippets) =>
                            updateFormData("codeSnippets", snippets)
                          }
                        />
                      </div>

                      {errors.length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                          <ul className="text-sm text-red-600 space-y-1">
                            {errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-3 justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={handleClose}
                          disabled={createQuestionMutation.isPending}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={createQuestionMutation.isPending}
                        >
                          {createQuestionMutation.isPending
                            ? "Creating..."
                            : "Create Question"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {showPreview && (
                    <div className="border-l border-gray-200 pl-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Preview
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                        {formData.title && (
                          <div className="mb-4">
                            <h1 className="text-xl font-bold text-gray-900 mb-2">
                              {formData.title}
                            </h1>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                QUESTION_LEVEL_COLORS[formData.level]?.bg
                              } ${QUESTION_LEVEL_COLORS[formData.level]?.text}`}
                            >
                              {QUESTION_LEVEL_LABELS[formData.level]}
                            </span>
                          </div>
                        )}

                        {formData.statement && (
                          <div className="border-t border-gray-200 pt-4">
                            <MarkdownRenderer content={formData.statement} />
                          </div>
                        )}

                        {!formData.title && !formData.statement && (
                          <p className="text-gray-500 text-sm italic">
                            Preview will appear here as you type...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
}

export function EditQuestionModal({
  isOpen,
  onClose,
  question,
}: EditQuestionModalProps) {
  const [formData, setFormData] = useState<UpdateQuestionRequest>({
    title: question.title,
    statement: question.statement,
    categoryId: question.categoryId,
    level: question.level,
    imageUrls: question.imageUrls || [],
    codeSnippets: question.codeSnippets || [],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { data: categories } = useCategories();
  const updateQuestionMutation = useUpdateQuestion();

  useEffect(() => {
    setFormData({
      title: question.title,
      statement: question.statement,
      categoryId: question.categoryId,
      level: question.level,
      imageUrls: question.imageUrls || [],
      codeSnippets: question.codeSnippets || [],
    });
  }, [question]);

  const handleStatementChange = useCallback((value: string) => {
    // const extractedUrls = extractImageUrlsFromMarkdown(value);
    setFormData((prev) => ({
      ...prev,
      statement: value,
      // imageUrls: extractedUrls
    }));
  }, []);

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push("Question title is required");
    } else {
      if (formData.title.trim().length < QUESTION_VALIDATION.TITLE_MIN_LENGTH) {
        errors.push(
          `Title must be at least ${QUESTION_VALIDATION.TITLE_MIN_LENGTH} characters long`
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
      if (
        formData.statement.trim().length <
        QUESTION_VALIDATION.STATEMENT_MIN_LENGTH
      ) {
        errors.push(
          `Statement must be at least ${QUESTION_VALIDATION.STATEMENT_MIN_LENGTH} characters long`
        );
      }
      if (
        formData.statement.trim().length >
        QUESTION_VALIDATION.STATEMENT_MAX_LENGTH
      ) {
        errors.push(
          `Statement must be less than ${QUESTION_VALIDATION.STATEMENT_MAX_LENGTH} characters`
        );
      }
    }

    if (!formData.categoryId) {
      errors.push("Category is required");
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

    const hasChanges =
      formData.title !== question.title ||
      formData.statement !== question.statement ||
      formData.categoryId !== question.categoryId ||
      formData.level !== question.level ||
      JSON.stringify(formData.codeSnippets) !==
        JSON.stringify(question.codeSnippets);

    if (!hasChanges) {
      setErrors(["No changes detected"]);
      return;
    }

    // const finalImageUrls = extractImageUrlsFromMarkdown(formData.statement);
    const submissionData = {
      ...formData,
      // imageUrls: finalImageUrls,
    };

    setErrors([]);
    updateQuestionMutation.mutate(
      { id: question.id, request: submissionData },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setFormData({
      title: question.title,
      statement: question.statement,
      categoryId: question.categoryId,
      level: question.level,
      imageUrls: question.imageUrls || [],
      codeSnippets: question.codeSnippets || [],
    });
    setErrors([]);
    setShowPreview(false);
    onClose();
  };

  const updateFormData = <T extends keyof UpdateQuestionRequest>(
    field: T,
    value: UpdateQuestionRequest[T]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
              <DialogPanel className="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                  >
                    <PencilIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Edit Question
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium ${
                        showPreview
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {showPreview ? "Hide Preview" : "Show Preview"}
                    </button>
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-600"
                      onClick={handleClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div
                  className={`grid ${
                    showPreview ? "grid-cols-2 gap-6" : "grid-cols-1"
                  }`}
                >
                  <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label
                          htmlFor="editTitle"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Question Title
                        </label>
                        <input
                          type="text"
                          id="editTitle"
                          value={formData.title}
                          onChange={(e) =>
                            updateFormData("title", e.target.value)
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter question title..."
                          maxLength={QUESTION_VALIDATION.TITLE_MAX_LENGTH}
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          {formData.title.length}/
                          {QUESTION_VALIDATION.TITLE_MAX_LENGTH} characters
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="editCategory"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Category
                          </label>
                          <select
                            id="editCategory"
                            value={formData.categoryId}
                            onChange={(e) =>
                              updateFormData("categoryId", e.target.value)
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                            htmlFor="editLevel"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Difficulty Level
                          </label>
                          <select
                            id="editLevel"
                            value={formData.level}
                            onChange={(e) =>
                              updateFormData(
                                "level",
                                e.target.value as QuestionLevel
                              )
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
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Statement
                        </label>
                        <RichTextEditor
                          value={formData.statement}
                          onChange={handleStatementChange}
                          placeholder="Write your question statement here. Upload images and click on them to insert at cursor position..."
                          maxLength={QUESTION_VALIDATION.STATEMENT_MAX_LENGTH}
                          uploadedImages={formData.imageUrls || []}
                          onImagesChange={(images) => {
                            // console.log("Images changed:", images); // Add this debug
                            updateFormData("imageUrls", images);
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Starter Code Templates (Optional)
                        </label>
                        <CodeSnippetsManager
                          codeSnippets={formData.codeSnippets || []}
                          onChange={(snippets) =>
                            updateFormData("codeSnippets", snippets)
                          }
                        />
                      </div>

                      {errors.length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                          <ul className="text-sm text-red-600 space-y-1">
                            {errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-3 justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={handleClose}
                          disabled={updateQuestionMutation.isPending}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={updateQuestionMutation.isPending}
                        >
                          {updateQuestionMutation.isPending
                            ? "Updating..."
                            : "Update Question"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {showPreview && (
                    <div className="border-l border-gray-200 pl-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Preview
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                        {formData.title && (
                          <div className="mb-4">
                            <h1 className="text-xl font-bold text-gray-900 mb-2">
                              {formData.title}
                            </h1>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                QUESTION_LEVEL_COLORS[formData.level]?.bg
                              } ${QUESTION_LEVEL_COLORS[formData.level]?.text}`}
                            >
                              {QUESTION_LEVEL_LABELS[formData.level]}
                            </span>
                          </div>
                        )}

                        {formData.statement && (
                          <div className="border-t border-gray-200 pt-4">
                            <MarkdownRenderer content={formData.statement} />
                          </div>
                        )}

                        {!formData.title && !formData.statement && (
                          <p className="text-gray-500 text-sm italic">
                            Preview will appear here as you type...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

interface DeleteQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
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
