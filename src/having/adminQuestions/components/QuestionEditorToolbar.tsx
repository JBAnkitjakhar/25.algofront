// src/having/adminquestions/components/QuestionEditorToolbar.tsx

"use client";

import { Editor } from '@tiptap/react';
import { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Code, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useUploadQuestionImage } from '../hooks';
import toast from 'react-hot-toast';
import { PROGRAMMING_LANGUAGES } from '../constants';

interface QuestionEditorToolbarProps {
  editor: Editor | null;
}

export function QuestionEditorToolbar({ editor }: QuestionEditorToolbarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadQuestionImage();

  if (!editor) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadImageMutation.mutateAsync(file);
      if (result.secure_url) {
        editor.chain().focus().setImage({ src: result.secure_url }).run();
        toast.success('Image uploaded and inserted');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addCodeBlock = (language: string) => {
    editor.chain().focus().setCodeBlock({ language }).run();
    setShowLanguageDropdown(false);
  };

  const ToolbarButton = ({ 
    onClick, 
    active, 
    children, 
    disabled = false,
    title 
  }: { 
    onClick: () => void; 
    active?: boolean; 
    children: React.ReactNode;
    disabled?: boolean;
    title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? 'bg-gray-200 text-blue-600' : 'text-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Image Upload */}
      <ToolbarButton
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        title="Upload Image"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ImageIcon className="w-4 h-4" />
        )}
      </ToolbarButton>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Code Block with Language Selection */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          className="flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium text-gray-700"
          title="Insert Code Block"
        >
          Code Block
          <ChevronDown className="w-3 h-3" />
        </button>

        {showLanguageDropdown && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowLanguageDropdown(false)}
            />
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
              {PROGRAMMING_LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => addCodeBlock(lang.value)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}