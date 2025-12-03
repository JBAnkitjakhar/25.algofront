//src/app/admin/questions/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "@tiptap/react";
import { QuestionEditor } from "@/having/adminQuestions/components";
import {
  useCreateQuestion,
  useCategoriesMetadata,
} from "@/having/adminQuestions/hooks";
import { ADMIN_ROUTES, QUESTION_LEVEL_LABELS } from "@/constants";
import { QUESTION_VALIDATION } from "@/having/adminQuestions/constants";
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
  XIcon,
  ImageIcon,
} from "lucide-react";
import { QuestionEditorSidebar } from "@/having/adminQuestions/components/QuestionEditorSidebar";
import { CodeSnippetsManager } from "@/having/adminQuestions/components";
import toast from "react-hot-toast";
import Image from "next/image";
import apiClient from "@/lib/api/client";

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
  const [statementCharCount, setStatementCharCount] = useState(0);
  const [isDeletingImage, setIsDeletingImage] = useState<string | null>(null);

  // useEffect(() => {
  //   console.log("📝 Editor state changed:", {
  //     editorExists: !!editor,
  //     editorIsEditable: editor?.isEditable,
  //     editorIsDestroyed: editor?.isDestroyed,
  //   });
  // }, [editor]);

  const { data: categories, isLoading: categoriesLoading } =
    useCategoriesMetadata();
  const createQuestionMutation = useCreateQuestion();

  // ✅ Extract images from HTML statement
  const extractImagesFromStatement = (htmlContent: string): string[] => {
    if (typeof window === "undefined") return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const images = doc.querySelectorAll("img");
    return Array.from(images).map((img) => img.src);
  };

  // ✅ Handle image upload callback
  const handleImageUpload = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...(prev.imageUrls || []), imageUrl],
    }));
  };

  // ✅ Add extractPublicIdFromUrl helper (same as edit page)
  const extractPublicIdFromUrl = (url: string): string | null => {
    try {
      const match = url.match(/\/upload\/v\d+\/(.+)\.[^.]+$/);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    } catch (error) {
      console.error("Error extracting public_id:", error);
      return null;
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (
      !confirm(
        "Delete this image? It will be removed from Cloudinary immediately."
      )
    ) {
      return;
    }

    setIsDeletingImage(imageUrl);

    try {
      const publicId = extractPublicIdFromUrl(imageUrl);

      if (!publicId) {
        throw new Error("Could not extract public_id from image URL");
      }

      // console.log("🗑️ Deleting image...");
      // console.log("   URL:", imageUrl);
      // console.log("   Extracted public_id:", publicId);
      // console.log(
      //   "   Request URL:",
      //   `/files/images?publicId=${encodeURIComponent(publicId)}`
      // );

      // ✅ CHANGED: Capture the full response
      const response = await apiClient.delete(
        `/files/images?publicId=${encodeURIComponent(publicId)}`
      );

      // console.log("✅ Delete response:", response);

      // Only proceed if actually successful
      if (!response.success) {
        throw new Error(response.message || "Delete failed");
      }

      // Remove from imageUrls array
      setFormData((prev) => ({
        ...prev,
        imageUrls: (prev.imageUrls || []).filter((url) => url !== imageUrl),
      }));

      // Remove from editor HTML
      if (editor) {
        const currentHtml = editor.getHTML();
        const parser = new DOMParser();
        const doc = parser.parseFromString(currentHtml, "text/html");
        const images = doc.querySelectorAll("img");

        images.forEach((img) => {
          if (img.src === imageUrl) {
            img.remove();
          }
        });

        const updatedHtml = doc.body.innerHTML;
        editor.commands.setContent(updatedHtml);
        setFormData((prev) => ({ ...prev, statement: updatedHtml }));
      }

      toast.success("Image deleted successfully from Cloudinary");
    } catch (error: unknown) {
      // ✅ FIXED: unknown instead of any
      console.error("❌ Delete failed:", error);

      // ✅ Type-safe error handling
      let errorMessage = "Failed to delete image";

      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("   Error details:", {
          message: error.message,
          name: error.name,
        });
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const apiError = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        errorMessage = apiError.response?.data?.message || errorMessage;
        console.error("   Error details:", {
          message: apiError.response?.data?.message,
          status: apiError.response?.status,
        });
      }

      toast.error(`Failed to delete: ${errorMessage}`);
    } finally {
      setIsDeletingImage(null);
    }
  };

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
      const charCount = formData.statement.trim().length;
      setStatementCharCount(charCount);

      if (charCount < QUESTION_VALIDATION.STATEMENT_MIN_LENGTH) {
        errors.push(
          `Statement must be at least ${QUESTION_VALIDATION.STATEMENT_MIN_LENGTH} characters`
        );
      }
      if (charCount > QUESTION_VALIDATION.STATEMENT_MAX_LENGTH) {
        errors.push(
          `Statement must be less than ${QUESTION_VALIDATION.STATEMENT_MAX_LENGTH} characters`
        );
      }
    }

    if (!formData.categoryId) {
      errors.push("Category is required");
    }

    if (!formData.displayOrder || formData.displayOrder < 1) {
      errors.push("Display order must be at least 1");
    }

    if (formData.codeSnippets && formData.codeSnippets.length > 0) {
      formData.codeSnippets.forEach((snippet, index) => {
        if (snippet.code.length > QUESTION_VALIDATION.CODE_SNIPPET_MAX_LENGTH) {
          errors.push(
            `Code template ${index + 1} exceeds ${
              QUESTION_VALIDATION.CODE_SNIPPET_MAX_LENGTH
            } characters`
          );
        }
      });
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Extract images from HTML BEFORE validation
    const imagesInStatement = extractImagesFromStatement(formData.statement);

    // ✅ Update formData with extracted images
    const updatedFormData = {
      ...formData,
      imageUrls: imagesInStatement,
    };

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    // ✅ Log for debugging
    // console.log("Submitting with imageUrls:", updatedFormData.imageUrls);

    createQuestionMutation.mutate(updatedFormData, {
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

  const isOverLimit =
    statementCharCount > QUESTION_VALIDATION.STATEMENT_MAX_LENGTH;
  const isWarning =
    statementCharCount > QUESTION_VALIDATION.STATEMENT_MAX_LENGTH * 0.8;

  // ✅ Get current images from statement
  const currentImages = extractImagesFromStatement(formData.statement);

  return (
    <div className="min-h-screen bg-white flex">
      <QuestionEditorSidebar
        editor={editor}
        onImageUpload={handleImageUpload}
      />

      <div className="flex-1 max-w-5xl mx-auto px-6 py-8 overflow-y-auto">
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
                setStatementCharCount(content.trim().length);
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

          {/* ✅ Uploaded Images Section */}
          {currentImages.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Uploaded Images ({currentImages.length}/
                  {QUESTION_VALIDATION.MAX_IMAGES_PER_QUESTION})
                </label>
                <span className="text-xs text-gray-500">
                  Click X to delete from Cloudinary
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative group border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={imageUrl}
                      alt={`Uploaded ${index + 1}`}
                      width={300} // Standard width for grid
                      height={200} // Standard height (3:2 aspect ratio)
                      className="w-full h-32 object-cover"
                      unoptimized // Required for external Cloudinary URLs
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(imageUrl)}
                      disabled={isDeletingImage === imageUrl}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                      title="Delete from Cloudinary"
                    >
                      {isDeletingImage === imageUrl ? (
                        <Loader2Icon className="w-4 h-4 animate-spin" />
                      ) : (
                        <XIcon className="w-4 h-4" />
                      )}
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span className="truncate">Image {index + 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {currentImages.length >=
                QUESTION_VALIDATION.MAX_IMAGES_PER_QUESTION && (
                <p className="text-xs text-orange-600 mt-2">
                  Maximum image limit reached
                </p>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 border-l border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="sticky top-0 p-4 space-y-4 max-h-screen overflow-y-auto">
          <div className="space-y-2">
            <button
              onClick={handleSubmit}
              disabled={createQuestionMutation.isPending || isOverLimit}
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

          {/* Statement Character Count */}
          <div
            className={`p-4 rounded-lg border-2 transition-all ${
              isOverLimit
                ? "bg-red-50 border-red-500"
                : isWarning
                ? "bg-yellow-50 border-yellow-400"
                : "bg-blue-50 border-blue-300"
            }`}
          >
            <div className="flex items-start space-x-2 mb-2">
              {isOverLimit && (
                <AlertTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3
                  className={`font-semibold text-sm mb-1 ${
                    isOverLimit
                      ? "text-red-900"
                      : isWarning
                      ? "text-yellow-900"
                      : "text-blue-900"
                  }`}
                >
                  📊 Statement Length
                </h3>
                <div
                  className={`space-y-1 text-xs ${
                    isOverLimit
                      ? "text-red-700"
                      : isWarning
                      ? "text-yellow-700"
                      : "text-blue-700"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>Characters:</span>
                    <span className="font-semibold">
                      {statementCharCount.toLocaleString()} /{" "}
                      {QUESTION_VALIDATION.STATEMENT_MAX_LENGTH.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isOverLimit
                          ? "bg-red-600"
                          : isWarning
                          ? "bg-yellow-500"
                          : "bg-blue-600"
                      }`}
                      style={{
                        width: `${Math.min(
                          (statementCharCount /
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
                <li>• Max 2MB per image</li>
                <li>• Max 5 images per question</li>
                <li>• Delete removes from Cloudinary</li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">
                💻 Code Templates
              </h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Max 2k chars per template</li>
                <li>• Multiple languages supported</li>
                <li>• Max 10 templates total</li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">📊 Limits</h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Title: Max 200 characters</li>
                <li>• Statement: Max 15k characters</li>
                <li>• Images: 5 max, 2MB each</li>
                <li>• Code: Max 10 templates, 2k each</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
