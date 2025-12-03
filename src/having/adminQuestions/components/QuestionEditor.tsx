// src/having/adminquestions/components/QuestionEditor.tsx

"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import c from 'highlight.js/lib/languages/c';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import '@/components/admin/styles/CourseEditorHighlighting.css';

const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('js', javascript);
lowlight.register('typescript', typescript);
lowlight.register('ts', typescript);
lowlight.register('python', python);
lowlight.register('py', python);
lowlight.register('java', java);
lowlight.register('cpp', cpp);
lowlight.register('c++', cpp);
lowlight.register('c', c);

interface QuestionEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  onEditorReady?: (editor: Editor) => void;
}

export function QuestionEditor({ 
  content, 
  onChange, 
  placeholder = 'Write your question statement here...',
  editable = true,
  onEditorReady
}: QuestionEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      TextStyle,
      Color,
      Highlight.configure({ 
        multicolor: true 
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'hljs',
          spellcheck: 'false',
        },
        defaultLanguage: 'javascript',
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
    immediatelyRender: false,
  });

  // ✅ CRITICAL: Call onEditorReady as soon as editor is created
  useEffect(() => {
    if (editor && onEditorReady) {
      console.log('✅ Editor ready, calling onEditorReady');
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // ✅ Only set content on initial mount
  useEffect(() => {
    if (isMounted && editor && content && !editor.getHTML()) {
      console.log('📄 Setting initial content');
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [isMounted, editor, content]);

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 min-h-[400px] flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <EditorContent editor={editor} />
    </div>
  );
}