// src/components/admin/SolutionModals.tsx

"use client";

import { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  LightBulbIcon,
  EyeIcon,
  PlayIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { SolutionRichTextEditor } from "./SolutionRichTextEditor";
import { MarkdownRenderer } from "../common/MarkdownRenderer";
import { CodeSyntaxHighlighter } from "../common/CodeSyntaxHighlighter";
import {
  useCreateSolution,
  useUpdateSolution,
  useDeleteSolution,
} from "@/hooks/useSolutionManagement";
import { useQuestions } from "@/hooks/useQuestionManagement";
import { SOLUTION_VALIDATION } from "@/constants";
import type {
  Solution,
  CreateSolutionRequest,
  UpdateSolutionRequest,
  Question,
} from "@/types";

// Searchable Question Selector Component
interface QuestionSelectorProps {
  selectedQuestionId: string;
  onQuestionSelect: (questionId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function QuestionSelector({
  selectedQuestionId,
  onQuestionSelect,
  disabled = false,
  placeholder = "Search and select a question...",
}: QuestionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 50;

  // Fetch questions with search
  const { data: questionsData, isLoading } = useQuestions({
    page,
    size: pageSize,
    search: searchQuery.trim() || undefined,
  });

  // Fix: Wrap questions in useMemo to prevent unnecessary re-renders
  const questions = useMemo(() => questionsData?.content || [], [questionsData?.content]);
  
  const hasMore = questionsData ? page < questionsData.totalPages - 1 : false;

  // Find selected question
  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  // Reset page when search changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleQuestionSelect = (question: Question) => {
    onQuestionSelect(question.id);
    setIsOpen(false);
    setSearchQuery("");
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  // Group questions by category for better organization
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, Question[]> = {};
    questions.forEach(question => {
      const category = question.categoryName || "Uncategorized";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(question);
    });
    return groups;
  }, [questions]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Question *
      </label>
      
      {/* Selected Question Display / Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"
        }`}
      >
        <span className="flex items-center">
          {selectedQuestion ? (
            <>
              <span className="ml-3 block truncate font-medium">
                {selectedQuestion.title}
              </span>
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {selectedQuestion.categoryName} • {selectedQuestion.level}
              </span>
            </>
          ) : (
            <span className="ml-3 block truncate text-gray-400">
              {placeholder}
            </span>
          )}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {/* Search Input */}
            <div className="sticky top-0 z-10 bg-white px-3 py-2 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Questions List */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading && page === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  Searching questions...
                </div>
              ) : questions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  {searchQuery ? `No questions found for "${searchQuery}"` : "No questions available"}
                </div>
              ) : (
                <>
                  {/* Group by category */}
                  {Object.entries(groupedQuestions).map(([categoryName, categoryQuestions]) => (
                    <div key={categoryName}>
                      {/* Category Header */}
                      <div className="sticky top-0 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 uppercase tracking-wide border-b border-gray-200">
                        {categoryName} ({categoryQuestions.length})
                      </div>
                      
                      {/* Questions in this category */}
                      {categoryQuestions.map((question) => (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => handleQuestionSelect(question)}
                          className={`relative w-full cursor-pointer select-none py-2 pl-3 pr-9 text-left hover:bg-blue-50 ${
                            question.id === selectedQuestionId ? "bg-blue-100 text-blue-900" : "text-gray-900"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <span className={`block truncate font-medium ${
                                question.id === selectedQuestionId ? "font-semibold" : ""
                              }`}>
                                {question.title}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  question.level === "EASY" ? "bg-green-100 text-green-800" :
                                  question.level === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                }`}>
                                  {question.level}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {question.categoryName}
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
                      ))}
                    </div>
                  ))}
                  
                  {/* Load More Button */}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={isLoading}
                      className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed border-t border-gray-200"
                    >
                      {isLoading ? "Loading more..." : `Load more questions...`}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </Transition>
      )}

      {/* Selected Question Info */}
      {selectedQuestion && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-blue-900">
                {selectedQuestion.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  selectedQuestion.level === "EASY" ? "bg-green-100 text-green-800" :
                  selectedQuestion.level === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {selectedQuestion.level}
                </span>
                <span className="text-sm text-blue-700">
                  {selectedQuestion.categoryName}
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

interface CreateSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId?: string;
}

export function CreateSolutionModal({
  isOpen,
  onClose,
  questionId,
}: CreateSolutionModalProps) {
  const [formData, setFormData] = useState<CreateSolutionRequest>({
    content: "",
    codeSnippet: undefined,
    driveLink: undefined,
    youtubeLink: undefined,
    imageUrls: [],
    visualizerFileIds: [],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(questionId || "");

  const createSolutionMutation = useCreateSolution();

  // Find selected question for preview
  const { data: questionsData } = useQuestions({ 
    size: 1,
    search: selectedQuestionId ? undefined : "",
  });
  
  // If we have a specific questionId, fetch that question
  const selectedQuestion = selectedQuestionId 
    ? questionsData?.content?.find(q => q.id === selectedQuestionId)
    : null;

  const handleContentChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }));
  }, []);

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!selectedQuestionId.trim()) {
      errors.push("Please select a question");
    }

    if (!formData.content.trim()) {
      errors.push("Solution content is required");
    } else {
      if (formData.content.trim().length < SOLUTION_VALIDATION.CONTENT_MIN_LENGTH) {
        errors.push(
          `Content must be at least ${SOLUTION_VALIDATION.CONTENT_MIN_LENGTH} characters long`
        );
      }
      if (formData.content.trim().length > SOLUTION_VALIDATION.CONTENT_MAX_LENGTH) {
        errors.push(
          `Content must be less than ${SOLUTION_VALIDATION.CONTENT_MAX_LENGTH} characters`
        );
      }
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

    const submissionData = {
      ...formData,
    };

    setErrors([]);
    createSolutionMutation.mutate(
      { questionId: selectedQuestionId, request: submissionData },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    setFormData({
      content: "",
      codeSnippet: undefined,
      driveLink: undefined,
      youtubeLink: undefined,
      imageUrls: [],
      visualizerFileIds: [],
    });
    setErrors([]);
    setShowPreview(false);
    setSelectedQuestionId(questionId || "");
    onClose();
  };

  const updateFormData = <T extends keyof CreateSolutionRequest>(
    field: T,
    value: CreateSolutionRequest[T]
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
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
              <DialogPanel className="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Create Solution
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium transition-colors ${
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
                      className="rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={handleClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className={`grid ${showPreview ? "grid-cols-2 gap-6" : "grid-cols-1"}`}>
                  <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Enhanced Question Selection */}
                      <QuestionSelector
                        selectedQuestionId={selectedQuestionId}
                        onQuestionSelect={setSelectedQuestionId}
                        disabled={!!questionId} // Disable if questionId was provided
                      />

                      {/* Solution Rich Text Editor */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Solution Content *
                        </label>
                        <SolutionRichTextEditor
                          textContent={formData.content}
                          onTextContentChange={handleContentChange}
                          codeSnippet={formData.codeSnippet}
                          onCodeSnippetChange={(snippet) => updateFormData("codeSnippet", snippet)}
                          youtubeLink={formData.youtubeLink}
                          onYoutubeLinkChange={(link) => updateFormData("youtubeLink", link)}
                          driveLink={formData.driveLink}
                          onDriveLinkChange={(link) => updateFormData("driveLink", link)}
                          uploadedImages={formData.imageUrls || []}
                          onImagesChange={(images) => updateFormData("imageUrls", images)}
                          visualizerFileIds={formData.visualizerFileIds || []}
                          onVisualizerFileIdsChange={(fileIds) => updateFormData("visualizerFileIds", fileIds)}
                          placeholder="Explain your solution approach, algorithm, and implementation details..."
                          maxLength={SOLUTION_VALIDATION.CONTENT_MAX_LENGTH}
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

                      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          onClick={handleClose}
                          disabled={createSolutionMutation.isPending}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={createSolutionMutation.isPending}
                        >
                          {createSolutionMutation.isPending
                            ? "Creating..."
                            : "Create Solution"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {showPreview && (
                    <div className="border-l border-gray-200 pl-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Live Preview
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                        {selectedQuestion && (
                          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <h2 className="font-semibold text-blue-900">
                              Solution for: {selectedQuestion.title}
                            </h2>
                            <p className="text-sm text-blue-700">
                              {selectedQuestion.categoryName} • {selectedQuestion.level}
                            </p>
                          </div>
                        )}

                        {formData.content ? (
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-700 mb-2">Explanation</h3>
                              <MarkdownRenderer content={formData.content} />
                            </div>

                            {formData.codeSnippet && (
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Code Solution</h3>
                                <CodeSyntaxHighlighter 
                                  codeSnippet={formData.codeSnippet}
                                  showHeader={true}
                                />
                              </div>
                            )}

                            {(formData.youtubeLink || formData.driveLink) && (
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Resources</h3>
                                <div className="space-y-2">
                                  {formData.youtubeLink && (
                                    <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded">
                                      <PlayIcon className="h-4 w-4 text-red-600 mr-2" />
                                      <span className="text-sm text-red-800">YouTube Video</span>
                                    </div>
                                  )}
                                  {formData.driveLink && (
                                    <div className="flex items-center p-2 bg-blue-50 border border-blue-200 rounded">
                                      <FolderOpenIcon className="h-4 w-4 text-blue-600 mr-2" />
                                      <span className="text-sm text-blue-800">Google Drive Resource</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <LightBulbIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm italic">
                              Preview will appear here as you add content...
                            </p>
                          </div>
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

interface EditSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: Solution;
}

export function EditSolutionModal({
  isOpen,
  onClose,
  solution,
}: EditSolutionModalProps) {
  const [formData, setFormData] = useState<UpdateSolutionRequest>({
    content: solution.content,
    codeSnippet: solution.codeSnippet,
    driveLink: solution.driveLink,
    youtubeLink: solution.youtubeLink,
    imageUrls: solution.imageUrls || [],
    visualizerFileIds: solution.visualizerFileIds || [],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const updateSolutionMutation = useUpdateSolution();

  useEffect(() => {
    setFormData({
      content: solution.content,
      codeSnippet: solution.codeSnippet,
      driveLink: solution.driveLink,
      youtubeLink: solution.youtubeLink,
      imageUrls: solution.imageUrls || [],
      visualizerFileIds: solution.visualizerFileIds || [],
    });
  }, [solution]);

  const handleContentChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }));
  }, []);

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.content.trim()) {
      errors.push("Solution content is required");
    } else {
      if (formData.content.trim().length < SOLUTION_VALIDATION.CONTENT_MIN_LENGTH) {
        errors.push(
          `Content must be at least ${SOLUTION_VALIDATION.CONTENT_MIN_LENGTH} characters long`
        );
      }
      if (formData.content.trim().length > SOLUTION_VALIDATION.CONTENT_MAX_LENGTH) {
        errors.push(
          `Content must be less than ${SOLUTION_VALIDATION.CONTENT_MAX_LENGTH} characters`
        );
      }
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
      formData.content !== solution.content ||
      JSON.stringify(formData.codeSnippet) !== JSON.stringify(solution.codeSnippet) ||
      formData.driveLink !== solution.driveLink ||
      formData.youtubeLink !== solution.youtubeLink ||
      JSON.stringify(formData.visualizerFileIds) !== JSON.stringify(solution.visualizerFileIds);

    if (!hasChanges) {
      setErrors(["No changes detected"]);
      return;
    }

    const submissionData = {
      ...formData,
    };

    setErrors([]);
    updateSolutionMutation.mutate(
      { id: solution.id, request: submissionData },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setFormData({
      content: solution.content,
      codeSnippet: solution.codeSnippet,
      driveLink: solution.driveLink,
      youtubeLink: solution.youtubeLink,
      imageUrls: solution.imageUrls || [],
      visualizerFileIds: solution.visualizerFileIds || [],
    });
    setErrors([]);
    setShowPreview(false);
    onClose();
  };

  const updateFormData = <T extends keyof UpdateSolutionRequest>(
    field: T,
    value: UpdateSolutionRequest[T]
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
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
              <DialogPanel className="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                  >
                    <PencilIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Edit Solution
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium transition-colors ${
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
                      className="rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={handleClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className={`grid ${showPreview ? "grid-cols-2 gap-6" : "grid-cols-1"}`}>
                  <div className="space-y-6">
                    {/* Question Info */}
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                      <div className="text-sm font-medium text-gray-900">
                        Question: {solution.questionTitle}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Created {new Date(solution.createdAt).toLocaleDateString()} by {solution.createdByName}
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Solution Rich Text Editor */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Solution Content *
                        </label>
                        <SolutionRichTextEditor
                          textContent={formData.content}
                          onTextContentChange={handleContentChange}
                          codeSnippet={formData.codeSnippet}
                          onCodeSnippetChange={(snippet) => updateFormData("codeSnippet", snippet)}
                          youtubeLink={formData.youtubeLink}
                          onYoutubeLinkChange={(link) => updateFormData("youtubeLink", link)}
                          driveLink={formData.driveLink}
                          onDriveLinkChange={(link) => updateFormData("driveLink", link)}
                          uploadedImages={formData.imageUrls || []}
                          onImagesChange={(images) => updateFormData("imageUrls", images)}
                          visualizerFileIds={formData.visualizerFileIds || []}
                          onVisualizerFileIdsChange={(fileIds) => updateFormData("visualizerFileIds", fileIds)}
                          solutionId={solution.id}
                          placeholder="Explain your solution approach, algorithm, and implementation details..."
                          maxLength={SOLUTION_VALIDATION.CONTENT_MAX_LENGTH}
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

                      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          onClick={handleClose}
                          disabled={updateSolutionMutation.isPending}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={updateSolutionMutation.isPending}
                        >
                          {updateSolutionMutation.isPending
                            ? "Updating..."
                            : "Update Solution"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {showPreview && (
                    <div className="border-l border-gray-200 pl-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Live Preview
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <h2 className="font-semibold text-blue-900">
                            Solution for: {solution.questionTitle}
                          </h2>
                        </div>

                        {formData.content ? (
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-700 mb-2">Explanation</h3>
                              <MarkdownRenderer content={formData.content} />
                            </div>

                            {formData.codeSnippet && (
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Code Solution</h3>
                                <CodeSyntaxHighlighter 
                                  codeSnippet={formData.codeSnippet}
                                  showHeader={true}
                                />
                              </div>
                            )}

                            {(formData.youtubeLink || formData.driveLink) && (
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Resources</h3>
                                <div className="space-y-2">
                                  {formData.youtubeLink && (
                                    <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded">
                                      <PlayIcon className="h-4 w-4 text-red-600 mr-2" />
                                      <span className="text-sm text-red-800">YouTube Video</span>
                                    </div>
                                  )}
                                  {formData.driveLink && (
                                    <div className="flex items-center p-2 bg-blue-50 border border-blue-200 rounded">
                                      <FolderOpenIcon className="h-4 w-4 text-blue-600 mr-2" />
                                      <span className="text-sm text-blue-800">Google Drive Resource</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <LightBulbIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm italic">
                              Preview will appear here as you add content...
                            </p>
                          </div>
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

interface DeleteSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: Solution;
}

export function DeleteSolutionModal({
  isOpen,
  onClose,
  solution,
}: DeleteSolutionModalProps) {
  const deleteSolutionMutation = useDeleteSolution();

  const handleDelete = () => {
    deleteSolutionMutation.mutate(solution.id, {
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
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
                    Delete Solution
                  </DialogTitle>

                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this solution for{" "}
                      <span className="font-medium text-gray-900">
                        {solution.questionTitle}
                      </span>
                      ?
                    </p>

                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800 font-medium">
                        Warning: This will permanently delete:
                      </p>
                      <ul className="mt-2 text-sm text-red-700 space-y-1">
                        <li>• The solution content and explanation</li>
                        <li>• All attached images and code snippets</li>
                        {solution.visualizerFileIds && solution.visualizerFileIds.length > 0 && (
                          <li>• {solution.visualizerFileIds.length} HTML visualizer file{solution.visualizerFileIds.length !== 1 ? 's' : ''}</li>
                        )}
                        {solution.youtubeLink && <li>• YouTube video link</li>}
                        {solution.driveLink && <li>• Google Drive link</li>}
                      </ul>
                      <p className="mt-2 text-xs text-red-600">
                        This action cannot be undone.
                      </p>
                    </div>

                    <div className="mt-3 p-2 bg-gray-50 rounded border">
                      <div className="flex items-center text-sm text-gray-600">
                        <LightBulbIcon className="h-4 w-4 mr-1" />
                        <span className="font-medium">Created:</span>
                        <span className="ml-1">{new Date(solution.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <span className="font-medium">By:</span>
                        <span className="ml-1">{solution.createdByName}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <span className="font-medium">Content:</span>
                        <span className="ml-1">{solution.content.length} characters</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    onClick={onClose}
                    disabled={deleteSolutionMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handleDelete}
                    disabled={deleteSolutionMutation.isPending}
                  >
                    {deleteSolutionMutation.isPending
                      ? "Deleting..."
                      : "Delete Solution"}
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