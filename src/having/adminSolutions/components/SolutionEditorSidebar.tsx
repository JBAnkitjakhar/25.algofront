// src/having/adminSolutions/components/SolutionEditorSidebar.tsx

"use client";

import { Editor } from "@tiptap/react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  Italic,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Loader2,
  Terminal,
  Undo,
  Redo,
  Palette,
  Highlighter,
  ArrowLeftIcon,
} from "lucide-react";
import { useUploadSolutionImage } from "../hooks";
import toast from "react-hot-toast";
import { PROGRAMMING_LANGUAGES, SOLUTION_VALIDATION } from "../constants";
import { ADMIN_ROUTES } from "@/constants";

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

interface SolutionEditorSidebarProps {
  editor: Editor | null;
  onImageUpload?: (imageUrl: string) => void;
}

export function SolutionEditorSidebar({
  editor,
  onImageUpload,
}: SolutionEditorSidebarProps) {
  const router = useRouter();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightColorPicker, setShowHighlightColorPicker] =
    useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState("#000000");
  const [selectedHighlightColor, setSelectedHighlightColor] =
    useState("#FFEB3B");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadSolutionImage();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > SOLUTION_VALIDATION.MAX_IMAGE_SIZE) {
      toast.error(
        `Image size must be less than ${
          SOLUTION_VALIDATION.MAX_IMAGE_SIZE / (1024 * 1024)
        }MB`
      );
      return;
    }

    if (!editor) {
      toast.error("Editor is not ready. Please try again.");
      return;
    }

    setIsUploadingImage(true);

    try {
      const result = await uploadImageMutation.mutateAsync(file);

      if (result.secure_url) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "image",
            attrs: {
              src: result.secure_url,
              alt: file.name,
            },
          })
          .run();

        editor.chain().focus().insertContent("<p></p>").run();

        if (onImageUpload) {
          onImageUpload(result.secure_url);
        }

        toast.success("Image uploaded and inserted");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const insertCodeBlock = () => {
    if (editor) {
      editor.chain().focus().setCodeBlock({ language: selectedLanguage }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="w-64 border-r border-gray-200 bg-gray-50 flex-shrink-0">
      <div className="sticky top-0 p-4 space-y-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className=" border-b border-gray-300">
           <button
          onClick={() => router.push(ADMIN_ROUTES.SOLUTIONS)}
          className="flex items-center text-gray-700 hover:text-gray-900 font-medium transition-colors mb-2"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Solutions
        </button>
        </div>

        {/* Text Style */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Text Style
          </p>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                editor.isActive("bold")
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Bold className="w-4 h-4" />
              <span>Bold</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                editor.isActive("italic")
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Italic className="w-4 h-4" />
              <span>Italic</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                editor.isActive("code")
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Code</span>
            </button>
          </div>
        </div>

        {/* Text Alignment */}
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Alignment
          </p>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                editor.isActive({ textAlign: "left" })
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <AlignLeft className="w-4 h-4" />
              <span>Align Left</span>
            </button>
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                editor.isActive({ textAlign: "center" })
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <AlignCenter className="w-4 h-4" />
              <span>Align Center</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                editor.isActive({ textAlign: "right" })
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <AlignRight className="w-4 h-4" />
              <span>Align Right</span>
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
            <div className="relative">
              <button
                type="button"
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
                        editor?.chain().focus().setColor(color).run();
                      }}
                      className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quick Colors
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            editor.chain().focus().setColor(color).run();
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
            <div className="relative">
              <button
                type="button"
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
                        editor
                          ?.chain()
                          .focus()
                          .toggleHighlight({ color })
                          .run();
                      }}
                      className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quick Colors
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {HIGHLIGHT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            editor
                              .chain()
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
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 border border-gray-300 disabled:opacity-50 transition-colors"
          >
            {isUploadingImage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                <span>Insert Image</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
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
              {PROGRAMMING_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={insertCodeBlock}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                editor.isActive("codeBlock")
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
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Undo className="w-4 h-4" />
              <span>Undo</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Redo className="w-4 h-4" />
              <span>Redo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}