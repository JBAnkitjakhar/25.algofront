// src/having/userQuestion/components/TipTapViewer.tsx 

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import { useEffect } from 'react';

interface TipTapViewerProps {
  content: string;
  className?: string;
}

export function TipTapViewer({ content, className = '' }: TipTapViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 hover:underline',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 dark:bg-gray-800 rounded-lg p-4 my-4 overflow-x-auto',
        },
      }),
    ],
    content: content,
    editable: false,
    immediatelyRender: false, // FIXED: Prevent SSR hydration mismatch
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none ${className}`,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-viewer">
      <EditorContent editor={editor} />
    </div>
  );
}