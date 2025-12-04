// src/having/adminSolutions/components/SolutionEditor.tsx

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
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import kotlin from 'highlight.js/lib/languages/kotlin';
import swift from 'highlight.js/lib/languages/swift';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import './styles/SolutionEditorHighlighting.css';

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
lowlight.register('csharp', csharp);
lowlight.register('cs', csharp);
lowlight.register('php', php);
lowlight.register('ruby', ruby);
lowlight.register('rb', ruby);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('rs', rust);
lowlight.register('kotlin', kotlin);
lowlight.register('kt', kotlin);
lowlight.register('swift', swift);
lowlight.register('sql', sql);
lowlight.register('html', xml);
lowlight.register('xml', xml);
lowlight.register('css', css);
lowlight.register('json', json);
lowlight.register('bash', bash);
lowlight.register('shell', bash);
lowlight.register('yaml', yaml);
lowlight.register('yml', yaml);
lowlight.register('markdown', markdown);
lowlight.register('md', markdown);

interface SolutionEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  onEditorReady?: (editor: Editor) => void;
}

export function SolutionEditor({ 
  content, 
  onChange, 
  placeholder = 'Write your solution explanation here...',
  editable = true,
  onEditorReady
}: SolutionEditorProps) {
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
    content: '',
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

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (isMounted && editor && content !== editor.getHTML()) {
      const timer = setTimeout(() => {
        editor.commands.setContent(content, { emitUpdate: false });
      }, 50);
      return () => clearTimeout(timer);
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