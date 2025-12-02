// src/app/admin/courses/[topicId]/[docId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Editor } from "@tiptap/react";
import {
  useDocument,
  useCreateDocument,
  useUpdateDocument,
  useDeleteCourseImage,
  useUploadCourseImage,
  useAdminTopics,
} from "@/having/courses/hooks";
import CourseEditor from "@/components/admin/CourseEditor";
import { ArrowLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
// import { CreateDocumentRequest, UpdateDocumentRequest } from '@/courses/types';
import Image from "next/image";
import {
  Loader2Icon,
  SaveIcon,
  AlertTriangleIcon,
  HelpCircleIcon,
  Bold,
  Italic,
  Code,
  Undo,
  Redo,
  ImageIcon,
  Highlighter,
  Palette,
  Terminal,
} from "lucide-react";
import type {
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentFormData,
} from "@/having/courses";

// Color palettes
const COLORS = [
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#FFC0CB",
  "#808080",
  "#8B4513",
  "#000080",
  "#008000",
  "#FF6347",
];

const HIGHLIGHT_COLORS = [
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#4CAF50",
  "#00BCD4",
  "#03A9F4",
  "#2196F3",
  "#9C27B0",
  "#E91E63",
];

const CODE_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "kotlin", label: "Kotlin" },
  { value: "swift", label: "Swift" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash/Shell" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
];

export default function AdminDocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  const docId = params.docId as string;
  const isNew = docId === "new";

  const { data: allTopicsData } = useAdminTopics();
  const topic = allTopicsData?.data?.find((t) => t.id === topicId);
  const { data: documentData, isLoading: isLoadingDoc } = useDocument(
    isNew ? "" : docId
  );
  const createDocumentMutation = useCreateDocument();
  const updateDocumentMutation = useUpdateDocument();
  const deleteImageMutation = useDeleteCourseImage();
  const uploadImageMutation = useUploadCourseImage();

  const [formData, setFormData] = useState<DocumentFormData>({
    title: "",
    topicId: topicId,
    displayOrder: 1,
    content: "",
    imageUrls: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [documentSize, setDocumentSize] = useState(0);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [selectedTextColor, setSelectedTextColor] = useState("#000000");
  const [selectedHighlightColor, setSelectedHighlightColor] =
    useState("#FFEB3B");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightColorPicker, setShowHighlightColorPicker] =
    useState(false);

  // Calculate document size in real-time
  useEffect(() => {
    if (formData.content) {
      const sizeInBytes = new Blob([formData.content]).size;
      setDocumentSize(sizeInBytes);
    } else {
      setDocumentSize(0);
    }
  }, [formData.content]);

  // Extract uploaded images from content for deletion UI
  useEffect(() => {
    if (formData.content) {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(formData.content, "text/html");
      const images = doc.querySelectorAll("img");
      const imageUrls = Array.from(images)
        .map((img) => img.src)
        .filter((src) => src.startsWith("https://res.cloudinary.com"));
      setUploadedImages(imageUrls);
    } else {
      setUploadedImages([]);
    }
  }, [formData.content]);

  // Handle click outside to close color pickers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if click is outside color picker elements
      if (!target.closest(".color-picker-container")) {
        setShowTextColorPicker(false);
        setShowHighlightColorPicker(false);
      }
    };

    if (showTextColorPicker || showHighlightColorPicker) {
      window.document.addEventListener("mousedown", handleClickOutside);
      return () => {
        window.document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showTextColorPicker, showHighlightColorPicker]);

  // Initialize form data when document loads
  useEffect(() => {
    if (isNew && !isInitialized) {
      setFormData({
        title: "",
        topicId: topicId,
        displayOrder: 1,
        content: "",
        imageUrls: [],
      });
      setIsInitialized(true);
    } else if (documentData && !isInitialized) {
      const timer = setTimeout(() => {
        setFormData({
          title: documentData.title,
          topicId: documentData.topicId,
          displayOrder: documentData.displayOrder || 1,
          content: documentData.content || "",
          imageUrls: documentData.imageUrls || [],
        });
        setIsInitialized(true);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [documentData, isNew, topicId, isInitialized]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Document title is required");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Document content is required");
      return;
    }

    // Block save if size exceeds 5MB
    if (documentSize > 5 * 1024 * 1024) {
      toast.error(
        "Document size exceeds 5MB limit. Please reduce content size."
      );
      return;
    }

    setIsSaving(true);

    try {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(formData.content, "text/html");
      const images = doc.querySelectorAll("img");
      const imageUrls = Array.from(images)
        .map((img) => img.src)
        .filter((src) => src.startsWith("https://res.cloudinary.com"));

      const dataToSave = {
        ...formData,
        imageUrls,
      };

      if (isNew) {
        await createDocumentMutation.mutateAsync(
          dataToSave as CreateDocumentRequest
        );
        toast.success("Document created successfully");
        router.push(`/admin/courses/${topicId}`);
      } else {
        await updateDocumentMutation.mutateAsync({
          docId,
          data: dataToSave as UpdateDocumentRequest,
        });
        toast.success("Document updated successfully");
      }
    } catch (error) {
      console.error("Failed to save document:", error);
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (window.confirm("Remove this image from the document?")) {
      const newContent = formData.content.replace(
        new RegExp(`<img[^>]*src="${imageUrl}"[^>]*>`, "g"),
        ""
      );
      setFormData({ ...formData, content: newContent });

      try {
        await deleteImageMutation.mutateAsync(imageUrl);
        toast.success("Image removed");
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }
  };

  const handleImageUpload = () => {
    const input = window.document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }

      setIsUploadingImage(true);

      try {
        // Upload image to Cloudinary via mutation
        const result = await uploadImageMutation.mutateAsync(file);

        if (result && editorInstance) {
          // Insert image at current cursor position in editor
          editorInstance
            .chain()
            .focus()
            .setImage({ src: result.secure_url })
            .run();
          toast.success("Image inserted successfully");
        }
      } catch (error) {
        console.error("Failed to upload image:", error);
        toast.error("Failed to upload image");
      } finally {
        setIsUploadingImage(false);
      }
    };

    input.click();
  };

  const insertCodeBlock = () => {
    if (editorInstance) {
      editorInstance
        .chain()
        .focus()
        .setCodeBlock({ language: selectedLanguage })
        .run();
    }
  };

  // Format size for display
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isOverSize = documentSize > 5 * 1024 * 1024;
  const isWarningSize = documentSize > 3 * 1024 * 1024;

  if (!isNew && (isLoadingDoc || !isInitialized)) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <Loader2Icon className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Fixed Left Sidebar - Editor Tools */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="sticky top-0 p-4 space-y-4 max-h-screen overflow-y-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push(`/admin/courses/${topicId}`)}
            className="flex items-center text-gray-700 hover:text-gray-900 font-medium transition-colors w-full"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Topic
          </button>

          {/* Document Info */}
          <div className="pb-4 border-b border-gray-300">
            <h2 className="text-lg font-bold text-gray-900">
              {isNew ? "Create Document" : "Edit Document"}
            </h2>
            {topic && (
              <p className="text-sm text-gray-600 mt-1">Topic: {topic.name}</p>
            )}
          </div>

          {/* Editor Tools */}
          <div className="space-y-4">
            {/* Text Style */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Text Style
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() =>
                    editorInstance?.chain().focus().toggleBold().run()
                  }
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    editorInstance?.isActive("bold")
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                  <span>Bold</span>
                </button>
                <button
                  onClick={() =>
                    editorInstance?.chain().focus().toggleItalic().run()
                  }
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    editorInstance?.isActive("italic")
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                  <span>Italic</span>
                </button>
                <button
                  onClick={() =>
                    editorInstance?.chain().focus().toggleCode().run()
                  }
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    editorInstance?.isActive("code")
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  title="Inline Code"
                >
                  <Code className="w-4 h-4" />
                  <span>Code</span>
                </button>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Colors
              </p>

              {/* Text Color */}
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Text Color</label>
                <div className="relative color-picker-container">
                  <button
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 border border-gray-300 transition-colors"
                  >
                    <Palette className="w-4 h-4" />
                    <span className="flex-1 text-left">Select Color</span>
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: selectedTextColor }}
                    />
                  </button>

                  {showTextColorPicker && (
                    <div className="absolute left-0 top-full mt-1 p-3 bg-white border rounded-lg shadow-lg z-20 w-full">
                      {/* Color Picker Input */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Pick Custom Color
                        </label>
                        <input
                          type="color"
                          value={selectedTextColor}
                          onChange={(e) => {
                            const color = e.target.value;
                            setSelectedTextColor(color);
                            editorInstance
                              ?.chain()
                              .focus()
                              .setColor(color)
                              .run();
                          }}
                          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                        />
                      </div>

                      {/* Preset Colors */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quick Colors
                        </label>
                        <div className="grid grid-cols-5 gap-1">
                          {COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                editorInstance
                                  ?.chain()
                                  .focus()
                                  .setColor(color)
                                  .run();
                                setSelectedTextColor(color);
                                setShowTextColorPicker(false);
                              }}
                              className="w-full h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Highlight Color */}
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Highlight</label>
                <div className="relative color-picker-container">
                  <button
                    onClick={() =>
                      setShowHighlightColorPicker(!showHighlightColorPicker)
                    }
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 border border-gray-300 transition-colors"
                  >
                    <Highlighter className="w-4 h-4" />
                    <span className="flex-1 text-left">Select Color</span>
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: selectedHighlightColor }}
                    />
                  </button>

                  {showHighlightColorPicker && (
                    <div className="absolute left-0 top-full mt-1 p-3 bg-white border rounded-lg shadow-lg z-20 w-full">
                      {/* Color Picker Input */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Pick Custom Color
                        </label>
                        <input
                          type="color"
                          value={selectedHighlightColor}
                          onChange={(e) => {
                            const color = e.target.value;
                            setSelectedHighlightColor(color);
                            editorInstance
                              ?.chain()
                              .focus()
                              .toggleHighlight({ color })
                              .run();
                          }}
                          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                        />
                      </div>

                      {/* Preset Colors */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quick Colors
                        </label>
                        <div className="grid grid-cols-5 gap-1">
                          {HIGHLIGHT_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                editorInstance
                                  ?.chain()
                                  .focus()
                                  .toggleHighlight({ color })
                                  .run();
                                setSelectedHighlightColor(color);
                                setShowHighlightColorPicker(false);
                              }}
                              className="w-full h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Media
              </p>
              <button
                onClick={handleImageUpload}
                disabled={isUploadingImage}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 border border-gray-300 disabled:opacity-50 transition-colors"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    <span>Insert Image</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 px-1">Max 2MB per image</p>
            </div>

            {/* Code Block */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Code Block
              </p>
              <div className="space-y-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {CODE_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={insertCodeBlock}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    editorInstance?.isActive("codeBlock")
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100 text-gray-700 border border-gray-300"
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>Insert Code Block</span>
                </button>
              </div>
            </div>

            {/* History */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                History
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => editorInstance?.chain().focus().undo().run()}
                  disabled={!editorInstance?.can().undo()}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Undo className="w-4 h-4" />
                  <span>Undo</span>
                </button>
                <button
                  onClick={() => editorInstance?.chain().focus().redo().run()}
                  disabled={!editorInstance?.can().redo()}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Redo className="w-4 h-4" />
                  <span>Redo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-5xl mx-auto px-6 py-8 overflow-y-auto">
        <div className="space-y-6">
          {/* Title and Display Order */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter document title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder || 1}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 1 : parseInt(e.target.value, 10);
                  if (!isNaN(value) && value > 0) {
                    setFormData({ ...formData, displayOrder: value });
                  }
                }}
                min="1"
                placeholder="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            {isInitialized && (
              <CourseEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Start writing your document content..."
                onEditorReady={setEditorInstance}
              />
            )}
          </div>

          {/* Image Management - Show in both creation and edit modes */}
          {uploadedImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uploaded Images
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      width={200}
                      height={128}
                    />
                    <button
                      onClick={() => handleRemoveImage(url)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Note: Removing images here will also remove them from the
                document content.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Right Sidebar - Actions & Info */}
      <div className="w-72 border-l border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="sticky top-0 p-4 space-y-4 max-h-screen overflow-y-auto">
          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleSave}
              disabled={isSaving || isOverSize}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSaving ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4" />
                  {isNew ? "Create Document" : "Save Changes"}
                </>
              )}
            </button>
            <button
              onClick={() => router.push(`/admin/courses/${topicId}`)}
              className="w-full px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>

          {/* Document Size - Live Updates */}
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
                  📊 Document Size
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
                      {formatSize(documentSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Limit:</span>
                    <span className="font-semibold">10 MB</span>
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
                          (documentSize / (5 * 1024 * 1024)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                {isOverSize && (
                  <div className="mt-2 pt-2 border-t border-red-300">
                    <p className="text-xs font-semibold text-red-900">
                      ⚠️ Size limit exceeded!
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Please reduce content or compress images before saving.
                    </p>
                  </div>
                )}
                {isWarningSize && !isOverSize && (
                  <div className="mt-2 pt-2 border-t border-yellow-300">
                    <p className="text-xs font-semibold text-yellow-900">
                      ⚠️ Approaching limit
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Consider optimizing content size.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

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
                <li>• Auto-centered display</li>
                <li>• Use left sidebar button</li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">
                💻 Code Blocks
              </h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Select language first</li>
                <li>• Syntax highlighting auto</li>
                <li>• 20+ languages supported</li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">💡 Tips</h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Save frequently</li>
                <li>• Compress large images</li>
                <li>• Preview before publishing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
