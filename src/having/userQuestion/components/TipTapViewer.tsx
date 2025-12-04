// src/having/userQuestion/components/TipTapViewer.tsx

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
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
import { useEffect, useState } from 'react';
import './styles/TipTapViewerHighlighting.css';

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

interface TipTapViewerProps {
  content: string;
  className?: string;
}

export function TipTapViewer({ content, className = '' }: TipTapViewerProps) {
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
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'hljs',
          spellcheck: 'false',
        },
        defaultLanguage: 'javascript',
      }),
    ],
    content: '',
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none ${className}`,
      },
    },
  });

  useEffect(() => {
    if (isMounted && editor && content !== editor.getHTML()) {
      const timer = setTimeout(() => {
        editor.commands.setContent(content, { emitUpdate: false });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isMounted, editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-viewer">
      <EditorContent editor={editor} />
    </div>
  );
}