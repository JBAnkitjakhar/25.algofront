// src/components/admin/QuestionRichTextEditor.tsx  

"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  PhotoIcon,
  CodeBracketIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  useUploadQuestionImage,
  useFileConfig,
} from "@/hooks/useQuestionManagement";
import toast from "react-hot-toast";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
  uploadedImages?: string[];
  onImagesChange?: (images: string[]) => void;
  disabled?: boolean;
  error?: string;
}

const PROGRAMMING_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  maxLength = 10000,
  showCharCount = true,
  uploadedImages = [],
  onImagesChange,
  disabled = false,
  error,
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: fileConfig } = useFileConfig();
  const uploadImageMutation = useUploadQuestionImage();

  // Handle file upload
  const handleFileUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const imageFiles = fileArray.filter((file) =>
        file.type.startsWith("image/")
      );

      if (imageFiles.length === 0) {
        toast.error("Please select valid image files");
        return;
      }

      // Check if adding these images would exceed the limit
      const currentImageCount = uploadedImages.filter(
        (url) => url && url.trim() !== ""
      ).length;
      const maxImages = fileConfig?.images?.maxPerQuestion || 5;

      if (currentImageCount + imageFiles.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed per question`);
        return;
      }

      setIsUploading(true);
      const newImageUrls: string[] = [];

      try {
        for (const file of imageFiles) {
          const result = await uploadImageMutation.mutateAsync(file);
          // console.log("Upload result:", result); // Add this line
          // console.log("Secure URL:", result.secure_url); // Add this line
          if (result.secure_url) {
            newImageUrls.push(result.secure_url);
          } else {
            console.error("No secure_url in result:", result);
          }
        }

        // Update images list, filtering out empty URLs
        const filteredExistingImages = uploadedImages.filter(
          (url) => url && url.trim() !== ""
        );
        const updatedImages = [...filteredExistingImages, ...newImageUrls];
        onImagesChange?.(updatedImages);

        // Automatically show image preview after upload
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
    [uploadedImages, onImagesChange, fileConfig, uploadImageMutation]
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
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload]
  );

  // Insert image URL into text at cursor position
  const insertImageAtCursor = useCallback(
    (imageUrl: string, altText?: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursorPosition = textarea.selectionStart;
      const textBefore = value.substring(0, cursorPosition);
      const textAfter = value.substring(cursorPosition);

      // Create meaningful alt text
      const alt = altText || "Question Image";
      const imageMarkdown = `\n\n![${alt}](${imageUrl})\n\n`;
      const newValue = textBefore + imageMarkdown + textAfter;

      onChange(newValue);

      // Set cursor position after inserted image
      setTimeout(() => {
        const newCursorPosition = cursorPosition + imageMarkdown.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      }, 0);

      toast.success("Image inserted at cursor position");
    },
    [value, onChange]
  );

  // Insert code block at cursor position with language selection
  const insertCodeBlock = useCallback(
    (language: string = "javascript") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursorPosition = textarea.selectionStart;
      const textBefore = value.substring(0, cursorPosition);
      const textAfter = value.substring(cursorPosition);

      const codeBlock = `\n\n\`\`\`${language}\n// Your ${language} code here\nfunction example() {\n  return "Hello World";\n}\n\`\`\`\n\n`;
      const newValue = textBefore + codeBlock + textAfter;

      onChange(newValue);

      // Set cursor position inside code block
      setTimeout(() => {
        const newCursorPosition =
          cursorPosition +
          `\n\n\`\`\`${language}\n// Your ${language} code here\n`.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      }, 0);

      setShowLanguageDropdown(false);
    },
    [value, onChange]
  );

  // Remove image from list and from text content
  const removeImage = useCallback(
    (imageUrl: string) => {
      // Remove from images array
      const updatedImages = uploadedImages.filter((url) => url !== imageUrl);
      onImagesChange?.(updatedImages);

      // Remove all instances of this image from markdown content
      const imageMarkdownPattern = new RegExp(
        `!\\[.*?\\]\\(${imageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`,
        "g"
      );
      const newValue = value.replace(imageMarkdownPattern, "");

      // Clean up extra newlines
      const cleanedValue = newValue.replace(/\n{3,}/g, "\n\n");
      onChange(cleanedValue);

      toast.success("Image removed from question");
    },
    [uploadedImages, onImagesChange, value, onChange]
  );

  // FIXED: More precise check if image is used in content
  const isImageUsedInContent = useCallback(
    (imageUrl: string): boolean => {
      if (!imageUrl || !value) return false;

      // Create regex to match markdown image syntax with this specific URL
      const escapedUrl = imageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const imageRegex = new RegExp(`!\\[.*?\\]\\(${escapedUrl}\\)`, "g");
      return imageRegex.test(value);
    },
    [value]
  );

  // Get unused images (images that haven't been inserted into text yet)
  const unusedImages = uploadedImages.filter(
    (url) => url && url.trim() !== "" && !isImageUsedInContent(url)
  );

  // Get all valid uploaded images (for display purposes)
  const allValidImages = uploadedImages.filter(
    (url) => url && url.trim() !== ""
  );

  // DEBUG: Console logging for debugging
  // console.log("RichTextEditor Debug:", {
  //   uploadedImages: allValidImages,
  //   value: value.substring(0, 200) + (value.length > 200 ? "..." : ""),
  //   unusedImages,
  //   allValidImagesCount: allValidImages.length,
  //   unusedImagesCount: unusedImages.length,
  //   isImageUsedCheck: allValidImages.map((url) => ({
  //     url: url.substring(url.lastIndexOf("/") + 1),
  //     isUsed: isImageUsedInContent(url),
  //     foundInText: value.includes(url),
  //   })),
  // });

  // Character count
  const charCount = value.length;
  const isOverLimit = charCount > maxLength;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
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

        {/* Show Images Button - ALWAYS show if there are any uploaded images */}
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

      {/* Text Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full min-h-[300px] p-3 resize-none border-0 focus:ring-0 focus:outline-none font-mono text-sm ${
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
              <p className="mt-2 text-sm text-gray-600">Uploading images...</p>
            </div>
          </div>
        )}
      </div>

      {/* FIXED: Show images section when preview is enabled */}
      {showImagePreview && allValidImages.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <PhotoIcon className="h-4 w-4 mr-1" />
            Uploaded Images
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
                  <div key={`unused-${index}`} className="relative group">
                    <Image
                      src={imageUrl}
                      alt={`Unused ${index + 1}`}
                      width={100}
                      height={80}
                      className="w-full h-20 object-cover rounded border-2 border-orange-200 cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() =>
                        insertImageAtCursor(imageUrl)
                      }
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
          {allValidImages.length > unusedImages.length && (
            <div>
              <div className="text-xs text-green-600 font-medium mb-2 flex items-center">
                <span className="bg-green-100 px-2 py-1 rounded">
                  {allValidImages.length - unusedImages.length} Used Images -
                  Already in text
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {allValidImages
                  .filter((url) => isImageUsedInContent(url))
                  .map((imageUrl, index) => (
                    <div key={`used-${index}`} className="relative group">
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

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 p-3 flex items-center">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mr-2" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFileUpload(e.target.files);
          }
        }}
      />

      {/* Help text */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
        <p>
          <strong>Tips:</strong> Upload images, then click Images button to show
          them. Click on any image to insert at cursor position. Use markdown
          syntax for formatting. Images will appear exactly where you place them
          in the text.
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
