// src/components/admin/SolutionRichTextEditor.tsx  

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  PhotoIcon,
  CodeBracketIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  EyeIcon,
  TrashIcon,
  DocumentTextIcon,
  LinkIcon,
  PlayIcon,
  FolderOpenIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";
import { MarkdownRenderer } from "../common/MarkdownRenderer";
import { CodeSyntaxHighlighter } from "../common/CodeSyntaxHighlighter"; // NEW IMPORT
import {
  useUploadSolutionImage,
  useValidateYoutubeLink,
  useValidateDriveLink,
  useUploadVisualizerFile,
  useDeleteVisualizerFile,
  useVisualizerFilesBySolution,
} from "@/hooks/useSolutionManagement";
import { solutionApiService } from "@/lib/api/solutionService";
import toast from "react-hot-toast";
import type { CodeSnippet } from "@/types";
import { cookieManager } from "@/lib/utils/auth";

interface SolutionRichTextEditorProps {
  // Content values
  textContent: string;
  onTextContentChange: (value: string) => void;
  codeSnippet?: CodeSnippet;
  onCodeSnippetChange: (snippet?: CodeSnippet) => void;

  // Links
  youtubeLink?: string;
  onYoutubeLinkChange: (link?: string) => void;
  driveLink?: string;
  onDriveLinkChange: (link?: string) => void;

  // Media - FIXED: Better image management
  uploadedImages?: string[];
  onImagesChange?: (images: string[]) => void;
  visualizerFileIds?: string[];
  onVisualizerFileIdsChange?: (fileIds: string[]) => void;

  // Configuration
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
  disabled?: boolean;
  error?: string;
  solutionId?: string; // Required for visualizer file management
}

// FIXED: Complete language list with proper templates
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
  {
    value: "php",
    label: "PHP",
    template: "<?php\n// Your PHP solution here\n?>",
  },
  {
    value: "ruby",
    label: "Ruby",
    template: "def solution\n  # Your Ruby solution here\nend",
  },
  {
    value: "swift",
    label: "Swift",
    template: "func solution() {\n    // Your Swift solution here\n}",
  },
  {
    value: "kotlin",
    label: "Kotlin",
    template: "fun main() {\n    // Your Kotlin solution here\n}",
  },
  {
    value: "html",
    label: "HTML",
    template:
      "<!DOCTYPE html>\n<html>\n<head>\n    <title>Example</title>\n</head>\n<body>\n    <!-- Your HTML here -->\n</body>\n</html>",
  },
  {
    value: "css",
    label: "CSS",
    template: ".example {\n    /* Your CSS here */\n}",
  },
  {
    value: "sql",
    label: "SQL",
    template: "-- Your SQL query here\nSELECT * FROM table_name;",
  },
];

// FIXED: Embedded visualizer component that works within our website
const EmbeddedVisualizer = ({
  fileId,
  title,
  height = "300px",
  onError,
  onFileNotFound,
}: {
  fileId: string;
  title: string;
  height?: string;
  onError?: (error: Error) => void;
  onFileNotFound?: (fileId: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");

  // FIXED: Memoize callbacks to prevent dependency issues
  const handleError = useCallback((err: Error) => {
    onError?.(err);
  }, [onError]);

  const handleFileNotFound = useCallback((id: string) => {
    onFileNotFound?.(id);
  }, [onFileNotFound]);

  // FIXED: Enhanced fetch with proper error handling for deleted files
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    const fetchVisualizerContent = async () => {
      // Don't fetch if already has error indicating deletion
      if (error === "File has been deleted") {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const token = cookieManager.getToken();
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
        const url = `${apiBaseUrl}/files/visualizers/${fileId}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "text/html",
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          credentials: "include",
        });

        // Only update state if component is still mounted
        if (!isMounted) return;

        if (!response.ok) {
          // FIXED: Handle 404 gracefully for deleted files
          if (response.status === 404) {
            // Notify parent component that file was not found (likely deleted)
            handleFileNotFound(fileId);
            setError("File has been deleted");
            return; // Don't call onError for expected 404s
          }

          if (response.status === 401) {
            throw new Error("Authentication expired. Please refresh the page and try again.");
          }
          throw new Error(`Failed to load visualizer: ${response.status}`);
        }

        const htmlText = await response.text();

        if (!htmlText || htmlText.trim().length === 0) {
          throw new Error("Empty response received from server");
        }

        if (isMounted) {
          setHtmlContent(htmlText);
        }
      } catch (err) {
        if (!isMounted) return;
        
        const errorMessage = err instanceof Error ? err.message : "Failed to load visualizer";
        setError(errorMessage);
        // FIXED: Only call onError for unexpected errors, not 404s
        if (!(err instanceof Error && err.message.includes("404"))) {
          handleError(new Error(errorMessage));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (fileId) {
      fetchVisualizerContent();
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [fileId, error, handleError, handleFileNotFound]); // FIXED: Complete dependency array

  // Create blob URL for secure HTML rendering
  const createBlobUrl = useCallback((content: string) => {
    const blob = new Blob([content], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, []);

  // FIXED: Professional error display for deleted files
  if (error) {
    if (error === "File has been deleted") {
      return (
        <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
          <div className="flex items-center text-amber-800">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <div>
              <div className="font-medium">Visualizer Removed</div>
              <div className="text-sm text-amber-700 mt-1">
                This visualizer has been deleted and is no longer available.
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="flex items-center text-red-800">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
          <div>
            <div className="font-medium">Unable to load visualizer</div>
            <div className="text-sm text-red-600 mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50" style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading visualizer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden" style={{ height }}>
      {htmlContent && (
        <iframe
          src={createBlobUrl(htmlContent)}
          title={title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          style={{ minHeight: height }}
        />
      )}
    </div>
  );
};

// FIXED: Enhanced file management with professional notifications
export function SolutionRichTextEditor({
  textContent,
  onTextContentChange,
  codeSnippet,
  onCodeSnippetChange,
  youtubeLink,
  onYoutubeLinkChange,
  driveLink,
  onDriveLinkChange,
  uploadedImages = [],
  onImagesChange,
  visualizerFileIds = [],
  onVisualizerFileIdsChange,
  placeholder = "Write your solution explanation here...",
  maxLength = 10000,
  showCharCount = true,
  disabled = false,
  error,
  solutionId,
}: SolutionRichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "text" | "code" | "links" | "visualizers"
  >("text");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const htmlFileInputRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = useUploadSolutionImage();
  const validateYoutubeMutation = useValidateYoutubeLink();
  const validateDriveMutation = useValidateDriveLink();
  const uploadVisualizerMutation = useUploadVisualizerFile();
  const deleteVisualizerMutation = useDeleteVisualizerFile();
  const { data: visualizerFiles, refetch: refetchVisualizers } =
    useVisualizerFilesBySolution(solutionId || "");

  // FIXED: Better image upload handling that preserves all images
  const handleImageUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const imageFiles = fileArray.filter((file) =>
        file.type.startsWith("image/")
      );

      if (imageFiles.length === 0) {
        toast.error("Please select valid image files");
        return;
      }

      // FIXED: Properly count existing valid images
      const currentValidImages = uploadedImages.filter(
        (url) => url && url.trim() !== ""
      );
      const maxImages = 10; // As per your backend validation

      if (currentValidImages.length + imageFiles.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed per solution`);
        return;
      }

      setIsUploading(true);
      const newImageUrls: string[] = [];

      try {
        for (const file of imageFiles) {
          const result = await uploadImageMutation.mutateAsync(file);
          if (result.secure_url) {
            newImageUrls.push(result.secure_url);
          }
        }

        // FIXED: Preserve ALL existing images and add new ones
        const allExistingImages = [...uploadedImages]; // Keep all existing images
        const allImages = [...allExistingImages, ...newImageUrls];
        onImagesChange?.(allImages);

        // Show image preview automatically
        setShowImagePreview(true);

        toast.success(
          `${newImageUrls.length} image(s) uploaded successfully. Click on them to insert into text.`
        );
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload images");
      } finally {
        setIsUploading(false);
      }
    },
    [uploadedImages, onImagesChange, uploadImageMutation]
  );

  // Handle HTML visualizer file upload
  const handleVisualizerUpload = useCallback(
    async (files: FileList | File[]) => {
      if (!solutionId) {
        toast.error("Solution must be saved before uploading visualizers");
        return;
      }

      const fileArray = Array.from(files);
      const htmlFiles = fileArray.filter((file) =>
        file.name.toLowerCase().endsWith(".html")
      );

      if (htmlFiles.length === 0) {
        toast.error("Please select valid HTML files");
        return;
      }

      const currentVisualizerCount = visualizerFileIds.length;
      const maxVisualizers = 2;

      if (currentVisualizerCount + htmlFiles.length > maxVisualizers) {
        toast.error(
          `Maximum ${maxVisualizers} HTML visualizers allowed per solution`
        );
        return;
      }

      try {
        const newFileIds: string[] = [];
        // Process files sequentially - individual success toasts handled by hook
        for (const file of htmlFiles) {
          const result = await uploadVisualizerMutation.mutateAsync({
            solutionId,
            file,
          });
          if (result.fileId) {
            newFileIds.push(result.fileId);
          }
        }

        const updatedFileIds = [...visualizerFileIds, ...newFileIds];
        onVisualizerFileIdsChange?.(updatedFileIds);
        refetchVisualizers();

        // REMOVED: Duplicate toast - individual success messages are shown in hook
        // console.log(`Successfully uploaded ${newFileIds.length} visualizer(s)`);
      } catch (error) {
        console.error("Visualizer upload failed:", error);
        // Error toast is handled in the mutation hook
      }
    },
    [
      solutionId,
      visualizerFileIds,
      onVisualizerFileIdsChange,
      uploadVisualizerMutation,
      refetchVisualizers,
    ]
  );

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        if (activeTab === "visualizers") {
          handleVisualizerUpload(e.dataTransfer.files);
        } else {
          handleImageUpload(e.dataTransfer.files);
        }
      }
    },
    [activeTab, handleImageUpload, handleVisualizerUpload]
  );

  // Insert image URL into text at cursor position
  const insertImageAtCursor = useCallback(
    (imageUrl: string, altText?: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursorPosition = textarea.selectionStart;
      const textBefore = textContent.substring(0, cursorPosition);
      const textAfter = textContent.substring(cursorPosition);

      const alt = altText || "Solution Image";
      const imageMarkdown = `\n\n![${alt}](${imageUrl})\n\n`;
      const newValue = textBefore + imageMarkdown + textAfter;

      onTextContentChange(newValue);

      setTimeout(() => {
        const newCursorPosition = cursorPosition + imageMarkdown.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      }, 0);

      toast.success("Image inserted at cursor position");
    },
    [textContent, onTextContentChange]
  );

  // Insert code block at cursor position
  const insertCodeBlock = useCallback(
    (language: string = "javascript") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursorPosition = textarea.selectionStart;
      const textBefore = textContent.substring(0, cursorPosition);
      const textAfter = textContent.substring(cursorPosition);

      const codeBlock = `\n\n\`\`\`${language}\n// Your ${language} code here\nfunction example() {\n  return "Hello World";\n}\n\`\`\`\n\n`;
      const newValue = textBefore + codeBlock + textAfter;

      onTextContentChange(newValue);

      setTimeout(() => {
        const newCursorPosition =
          cursorPosition +
          `\n\n\`\`\`${language}\n// Your ${language} code here\n`.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      }, 0);

      setShowLanguageDropdown(false);
    },
    [textContent, onTextContentChange]
  );

  // FIXED: Better image removal that preserves other images
  const removeImage = useCallback(
    (imageUrl: string) => {
      // Remove from uploaded images array
      const updatedImages = uploadedImages.filter((url) => url !== imageUrl);
      onImagesChange?.(updatedImages);

      // Remove from text content with proper regex escaping
      const escapedUrl = imageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const imageMarkdownPattern = new RegExp(
        `!\\[.*?\\]\\(${escapedUrl}\\)`,
        "g"
      );
      const newValue = textContent.replace(imageMarkdownPattern, "");
      const cleanedValue = newValue.replace(/\n{3,}/g, "\n\n");
      onTextContentChange(cleanedValue);

      toast.success("Image removed from solution");
    },
    [uploadedImages, onImagesChange, textContent, onTextContentChange]
  );

  // FIXED: Better check for image usage in content
  const isImageUsedInContent = useCallback(
    (imageUrl: string): boolean => {
      if (!imageUrl || !textContent) return false;
      const escapedUrl = imageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const imageRegex = new RegExp(`!\\[.*?\\]\\(${escapedUrl}\\)`, "g");
      return imageRegex.test(textContent);
    },
    [textContent]
  );

  // YouTube link validation
  const handleYoutubeLinkValidation = useCallback(
    async (link: string) => {
      if (!link.trim()) {
        onYoutubeLinkChange?.(undefined);
        return;
      }

      try {
        const result = await validateYoutubeMutation.mutateAsync(link);
        if (result.valid) {
          onYoutubeLinkChange?.(link);
          toast.success("Valid YouTube link");
        } else {
          toast.error(result.error || "Invalid YouTube link");
        }
      } catch (error) {
        console.error("YouTube validation failed:", error);
      }
    },
    [onYoutubeLinkChange, validateYoutubeMutation]
  );

  // Google Drive link validation
  const handleDriveLinkValidation = useCallback(
    async (link: string) => {
      if (!link.trim()) {
        onDriveLinkChange?.(undefined);
        return;
      }

      try {
        const result = await validateDriveMutation.mutateAsync(link);
        if (result.valid) {
          onDriveLinkChange?.(link);
          toast.success("Valid Google Drive link");
        } else {
          toast.error(result.error || "Invalid Google Drive link");
        }
      } catch (error) {
        console.error("Drive link validation failed:", error);
      }
    },
    [onDriveLinkChange, validateDriveMutation]
  );

  // FIXED: Better code snippet management with dynamic language selection
  const updateCodeSnippet = useCallback(
    (field: keyof CodeSnippet, value: string) => {
      const currentSnippet = codeSnippet || {
        language: "javascript",
        code: "",
        description: "",
      };
      const updatedSnippet = { ...currentSnippet, [field]: value };
      onCodeSnippetChange?.(updatedSnippet);
    },
    [codeSnippet, onCodeSnippetChange]
  );

  const removeCodeSnippet = useCallback(() => {
    onCodeSnippetChange?.(undefined);
  }, [onCodeSnippetChange]);

  const addCodeSnippet = useCallback(() => {
    const defaultLanguage = PROGRAMMING_LANGUAGES[0];
    onCodeSnippetChange?.({
      language: defaultLanguage.value,
      code: defaultLanguage.template,
      description: `${defaultLanguage.label} solution code`,
    });
  }, [onCodeSnippetChange]);

  // FIXED: Dynamic language change with proper template updates
  const handleLanguageChange = useCallback(
    (language: string) => {
      const selectedLanguage = PROGRAMMING_LANGUAGES.find(
        (lang) => lang.value === language
      );
      if (selectedLanguage && codeSnippet) {
        // Update all fields together to ensure consistency
        const updatedSnippet = {
          ...codeSnippet,
          language: language,
          code: selectedLanguage.template,
          description: `${selectedLanguage.label} solution code`,
        };
        onCodeSnippetChange?.(updatedSnippet);
      }
    },
    [codeSnippet, onCodeSnippetChange]
  );

  // Remove visualizer file
  const handleRemoveVisualizerFile = useCallback(
    async (fileId: string) => {
      try {
        // First update the UI immediately to prevent fetching
        const updatedFileIds = visualizerFileIds.filter((id) => id !== fileId);
        onVisualizerFileIdsChange?.(updatedFileIds);
        
        // Then delete from server
        await deleteVisualizerMutation.mutateAsync(fileId);
        
        // Finally refetch to get fresh data
        refetchVisualizers();
        // console.log(`Successfully removed visualizer: ${fileName}`);
      } catch (error) {
        console.error("Failed to remove visualizer:", error);
        // Revert the UI change if deletion failed
        onVisualizerFileIdsChange?.(visualizerFileIds);
      }
    },
    [visualizerFileIds, onVisualizerFileIdsChange, deleteVisualizerMutation, refetchVisualizers]
  );

  const handleVisualizerFileNotFound = useCallback(
    (fileId: string) => {
      // Immediately remove the deleted file ID from the list to prevent future fetches
      const updatedFileIds = visualizerFileIds.filter((id) => id !== fileId);
      if (updatedFileIds.length !== visualizerFileIds.length) {
        onVisualizerFileIdsChange?.(updatedFileIds);
        // console.log(`Removed deleted visualizer file ID from list: ${fileId}`);
      }
    },
    [visualizerFileIds, onVisualizerFileIdsChange] // Removed refetchVisualizers dependency
  );

  // FIXED: Separate unused and used images properly
  const allValidImages = uploadedImages.filter(
    (url) => url && url.trim() !== ""
  );
  const unusedImages = allValidImages.filter(
    (url) => !isImageUsedInContent(url)
  );
  const usedImages = allValidImages.filter((url) => isImageUsedInContent(url));

  const charCount = textContent.length;
  const isOverLimit = charCount > maxLength;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      {/* Tabs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <nav className="flex space-x-8 px-3 py-2" aria-label="Tabs">
          {[
            { id: "text", name: "Text Content", icon: DocumentTextIcon },
            { id: "code", name: "Code Solution", icon: CodeBracketIcon },
            { id: "links", name: "Links", icon: LinkIcon },
            {
              id: "visualizers",
              name: "HTML Visualizers",
              icon: CubeTransparentIcon,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-4 w-4 mr-1" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="relative">
        {/* Text Content Tab */}
        {activeTab === "text" && (
          <div>
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                title="Upload image"
              >
                <PhotoIcon className="h-4 w-4 mr-1" />
                {isUploading ? "Uploading..." : "Upload Image"}
              </button>

              {/* Code Block Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  disabled={disabled}
                  className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  title="Insert code block"
                >
                  <CodeBracketIcon className="h-4 w-4 mr-1" />
                  Code Block
                  <ChevronDownIcon className="h-3 w-3 ml-1" />
                </button>

                {showLanguageDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    {PROGRAMMING_LANGUAGES.map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => insertCodeBlock(lang.value)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* FIXED: Show Images Button - always show if there are any images */}
              {allValidImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowImagePreview(!showImagePreview)}
                  className={`inline-flex items-center px-2 py-1 border rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    showImagePreview
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Toggle image preview"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Images ({allValidImages.length})
                  {unusedImages.length > 0 && (
                    <span className="ml-1 bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5 rounded-full">
                      {unusedImages.length} unused
                    </span>
                  )}
                </button>
              )}

              {/* Preview Toggle */}
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`inline-flex items-center px-2 py-1 border rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  showPreview
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>

              <div className="flex-1" />

              {showCharCount && (
                <span
                  className={`text-xs ${
                    isOverLimit ? "text-red-600 font-medium" : "text-gray-500"
                  }`}
                >
                  {charCount.toLocaleString()}/{maxLength.toLocaleString()}
                </span>
              )}
            </div>

            <div
              className={`grid ${
                showPreview ? "grid-cols-2 gap-4 p-4" : "grid-cols-1"
              }`}
            >
              {/* Text Editor */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={textContent}
                  onChange={(e) => onTextContentChange(e.target.value)}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={`w-full min-h-[400px] p-3 resize-none border-0 focus:ring-0 focus:outline-none font-mono text-sm ${
                    error ? "bg-red-50" : ""
                  } ${dragActive ? "bg-blue-50" : ""}`}
                  maxLength={maxLength}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                />

                {/* Drag overlay */}
                {dragActive && (
                  <div className="absolute inset-0 bg-blue-100 bg-opacity-75 border-2 border-dashed border-blue-400 flex items-center justify-center">
                    <div className="text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-blue-600" />
                      <p className="mt-2 text-sm font-medium text-blue-600">
                        Drop images here
                      </p>
                    </div>
                  </div>
                )}

                {/* Upload progress overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                      <p className="mt-2 text-sm text-gray-600">
                        Uploading images...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="border-l border-gray-200 pl-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Preview
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                    {textContent ? (
                      <MarkdownRenderer content={textContent} />
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        Preview will appear here as you type...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* FIXED: Images Section - Always show all images, both used and unused */}
            {showImagePreview && allValidImages.length > 0 && (
              <div className="bg-gray-50 border-t border-gray-200 p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <PhotoIcon className="h-4 w-4 mr-1" />
                  All Uploaded Images ({allValidImages.length}/10)
                  <span className="ml-2 text-xs text-gray-500">
                    (Click to insert at cursor position)
                  </span>
                </h4>

                {/* Show unused images first */}
                {unusedImages.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-orange-600 font-medium mb-2 flex items-center">
                      <span className="bg-orange-100 px-2 py-1 rounded">
                        {unusedImages.length} Unused Images - Click to insert
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {unusedImages.map((imageUrl, index) => (
                        <div
                          key={`unused-${imageUrl}`}
                          className="relative group"
                        >
                          <Image
                            src={imageUrl}
                            alt={`Unused ${index + 1}`}
                            width={100}
                            height={80}
                            className="w-full h-20 object-cover rounded border-2 border-orange-200 cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => insertImageAtCursor(imageUrl)}
                            title="Click to insert into text at cursor position"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(imageUrl)}
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 right-1 bg-orange-600 bg-opacity-90 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-center">
                            Click to insert
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show used images */}
                {usedImages.length > 0 && (
                  <div>
                    <div className="text-xs text-green-600 font-medium mb-2 flex items-center">
                      <span className="bg-green-100 px-2 py-1 rounded">
                        {usedImages.length} Used Images - Already in text
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {usedImages.map((imageUrl, index) => (
                        <div
                          key={`used-${imageUrl}`}
                          className="relative group"
                        >
                          <Image
                            src={imageUrl}
                            alt={`Used ${index + 1}`}
                            width={100}
                            height={80}
                            className="w-full h-20 object-cover rounded border-2 border-green-200 opacity-75"
                            title="This image is already used in the text"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(imageUrl)}
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image and clear from text"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 right-1 bg-green-600 bg-opacity-90 text-white text-xs px-1 rounded text-center">
                            Used in text
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FIXED: Code Content Tab with proper language selection and syntax highlighting */}
        {activeTab === "code" && (
          <div className="p-4">
            {!codeSnippet ? (
              <div className="text-center py-12">
                <CodeBracketIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No code snippet added
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add a code snippet to show the implementation.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={addCodeSnippet}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <CodeBracketIcon className="h-4 w-4 mr-2" />
                    Add Code Snippet
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700">
                    Code Solution
                  </h4>
                  <button
                    type="button"
                    onClick={removeCodeSnippet}
                    className="text-red-600 hover:text-red-800 text-sm"
                    title="Remove code snippet"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Language
                    </label>
                    <select
                      value={codeSnippet.language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
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
                      value={codeSnippet.description}
                      onChange={(e) =>
                        updateCodeSnippet("description", e.target.value)
                      }
                      className="w-full text-sm rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Brief description of this code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Code Solution
                  </label>
                  {/* FIXED: Enhanced code editor with syntax highlighting colors */}
                  <div className="relative">
                    <textarea
                      ref={codeTextareaRef}
                      value={codeSnippet.code}
                      onChange={(e) =>
                        updateCodeSnippet("code", e.target.value)
                      }
                      className="w-full h-80 text-sm font-mono rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                      placeholder="Enter your solution code here..."
                      style={{
                        backgroundColor: "#0f1419",
                        color: "#e6e1dc",
                        fontFamily:
                          'Monaco, Menlo, "Ubuntu Mono", "SF Mono", Consolas, monospace',
                        fontSize: "13px",
                        lineHeight: "1.6",
                        tabSize: 2,
                        padding: "16px",
                        border: "1px solid #3a4b5c",
                      }}
                    />
                    {/* Language indicator */}
                    <div className="absolute top-2 right-2 bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs font-mono">
                      {
                        PROGRAMMING_LANGUAGES.find(
                          (lang) => lang.value === codeSnippet.language
                        )?.label
                      }
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    This code will be syntax highlighted when displayed. Use
                    proper indentation for best results.
                  </div>
                </div>

                {/* UPDATED: Code Preview with CodeSyntaxHighlighter */}
                <div className="mt-4">
                  <h5 className="text-xs font-medium text-gray-600 mb-2">
                    Preview:
                  </h5>
                  <CodeSyntaxHighlighter 
                    codeSnippet={codeSnippet}
                    showHeader={true}
                    className="border-0"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Links Tab */}
        {activeTab === "links" && (
          <div className="p-4 space-y-6">
            {/* YouTube Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PlayIcon className="h-4 w-4 inline mr-1" />
                YouTube Video Link (Optional)
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={youtubeLink || ""}
                  onChange={(e) => onYoutubeLinkChange?.(e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value !== youtubeLink) {
                      handleYoutubeLinkValidation(e.target.value);
                    }
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <div className="text-xs text-gray-500">
                  Add a YouTube video to help explain the solution. The link
                  will be automatically validated.
                </div>
                {youtubeLink && (
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <div className="text-sm text-green-800">
                      ✓ Valid YouTube link detected
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Google Drive Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FolderOpenIcon className="h-4 w-4 inline mr-1" />
                Google Drive Link (Optional)
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={driveLink || ""}
                  onChange={(e) => onDriveLinkChange?.(e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value !== driveLink) {
                      handleDriveLinkValidation(e.target.value);
                    }
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://drive.google.com/file/d/..."
                />
                <div className="text-xs text-gray-500">
                  Link to additional resources, documents, or files on Google
                  Drive.
                </div>
                {driveLink && (
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <div className="text-sm text-green-800">
                      ✓ Valid Google Drive link detected
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FIXED: HTML Visualizers Tab with embedded preview */}
        {activeTab === "visualizers" && (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CubeTransparentIcon className="h-4 w-4 inline mr-1" />
                HTML Visualizers (Max 2 files)
              </label>
              <div className="text-sm text-gray-600 mb-4">
                Upload interactive HTML files to visualize algorithms. Files
                will be embedded and displayed within our website.
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => htmlFileInputRef.current?.click()}
                  disabled={
                    disabled || visualizerFileIds.length >= 2 || !solutionId
                  }
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    !solutionId
                      ? "Save solution first to upload visualizers"
                      : "Upload HTML visualizer"
                  }
                >
                  <CubeTransparentIcon className="h-4 w-4 mr-2" />
                  Upload HTML File
                </button>

                {!solutionId && (
                  <div className="text-sm text-amber-600 px-3 py-2 bg-amber-50 border border-amber-200 rounded">
                    Save solution first to upload visualizers
                  </div>
                )}
              </div>
            </div>

            {/* FIXED: Enhanced Visualizer Files List with professional error handling */}
            {visualizerFiles?.data && visualizerFiles.data.length > 0 && (
              <div className="space-y-6">
                <h4 className="text-sm font-medium text-gray-700">
                  Uploaded Visualizers ({visualizerFiles.data.length}/2)
                </h4>
                {visualizerFiles.data.map((file) => (
                  <div
                    key={file.fileId}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* File Info Header */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <CubeTransparentIcon className="h-6 w-6 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {file.originalFileName || file.filename}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB • Uploaded{" "}
                            {new Date(file.uploadDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={solutionApiService.getVisualizerFileUrl(
                            file.fileId
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                          title="Open visualizer in new tab"
                        >
                          <EyeIcon className="h-3 w-3 mr-1" />
                          New Tab
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveVisualizerFile(
                              file.fileId
                            )
                          }
                          className="inline-flex items-center px-2 py-1 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50"
                          title="Delete visualizer"
                        >
                          <TrashIcon className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* FIXED: Enhanced Embedded Preview with file-not-found handling */}
                    <div className="p-0">
                      <EmbeddedVisualizer
                        fileId={file.fileId}
                        title={file.originalFileName || "Algorithm Visualizer"}
                        height="400px"
                        onError={(error) => {
                          console.error("Visualizer error:", error);
                          // Only log errors, don't show toast notifications
                        }}
                        onFileNotFound={handleVisualizerFileNotFound}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Drag and Drop Zone for HTML files */}
            <div
              className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive && activeTab === "visualizers"
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300"
              } ${visualizerFileIds.length >= 2 ? "opacity-50" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CubeTransparentIcon className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {visualizerFileIds.length >= 2
                  ? "Maximum 2 visualizers reached"
                  : "Drag and drop HTML files here, or click upload button"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                HTML files only • Max 500KB per file
              </p>
            </div>
          </div>
        )}

        {/* Drag overlay for active tab */}
        {dragActive && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-75 border-2 border-dashed border-blue-400 flex items-center justify-center z-10">
            <div className="text-center">
              {activeTab === "visualizers" ? (
                <>
                  <CubeTransparentIcon className="mx-auto h-12 w-12 text-blue-600" />
                  <p className="mt-2 text-sm font-medium text-blue-600">
                    Drop HTML visualizer files here
                  </p>
                </>
              ) : (
                <>
                  <PhotoIcon className="mx-auto h-12 w-12 text-blue-600" />
                  <p className="mt-2 text-sm font-medium text-blue-600">
                    Drop images here
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 p-3 flex items-center">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mr-2" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleImageUpload(e.target.files);
          }
        }}
      />

      <input
        ref={htmlFileInputRef}
        type="file"
        multiple
        accept=".html"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleVisualizerUpload(e.target.files);
          }
        }}
      />

      {/* Help text */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
        <p>
          <strong>Solution Editor:</strong> Use tabs to organize content - Text
          for explanation with images, Code for syntax-highlighted
          implementation, Links for external resources, and Visualizers for
          interactive HTML demos that run securely within our website.
        </p>
      </div>

      {/* Click outside to close dropdown */}
      {showLanguageDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowLanguageDropdown(false)}
        />
      )}
    </div>
  );
}