// src/app/interview-prep/[topicId]/[docId]/page.tsx

'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { dateUtils } from '@/lib/utils/common';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useRef } from 'react';

// Import highlight.js with common languages
import hljs from 'highlight.js/lib/core';
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

// Import the CSS for syntax highlighting
import '@/components/admin/styles/CourseEditorHighlighting.css';
import { useDocument } from '@/courses';

// Register all languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c++', cpp);
hljs.registerLanguage('c', c);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cs', csharp);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('rb', ruby);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('rs', rust);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('kt', kotlin);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);

function DocumentContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = params.topicId as string;
  const docId = params.docId as string;
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { data: document, isLoading: isLoadingDoc } = useDocument(docId);
  
  // ✅ Get topic name from URL query parameter
  const topicName = searchParams.get('topicName');

  // Apply syntax highlighting after content is rendered
  useEffect(() => {
    if (contentRef.current && document?.content) {
      const codeBlocks = contentRef.current.querySelectorAll('pre code');
      
      codeBlocks.forEach((block) => {
        const codeElement = block as HTMLElement;
        
        let language = 'plaintext';
        const classes = codeElement.className.split(' ');
        for (const cls of classes) {
          if (cls.startsWith('language-')) {
            language = cls.replace('language-', '');
            break;
          }
        }
        
        try {
          if (hljs.getLanguage(language)) {
            const result = hljs.highlight(codeElement.textContent || '', { 
              language: language,
              ignoreIllegals: true 
            });
            codeElement.innerHTML = result.value;
            codeElement.classList.add('hljs');
          } else {
            const result = hljs.highlightAuto(codeElement.textContent || '');
            codeElement.innerHTML = result.value;
            codeElement.classList.add('hljs');
          }
        } catch (error) {
          console.error('Failed to highlight code block:', error);
        }
      });
    }
  }, [document?.content]);

  if (isLoadingDoc) {
    return (
      <UserLayout>
        <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
          <Loader2Icon className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </UserLayout>
    );
  }

  if (!document) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-300">Document not found</p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.push(`/interview-prep/${topicId}`)}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-1" />
                  Back to Documents
                </button>
                
                {/* ✅ Display topic name from query param */}
                {topicName && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{topicName}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <ClockIcon className="h-4 w-4" />
                <span>Updated {dateUtils.formatRelativeTime(document.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Document Title */}
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {document.title}
                </h1>
              </div>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>By {document.createdByName}</span>
                <span>•</span>
                <span>Created {dateUtils.formatDate(document.createdAt)}</span>
              </div>
            </div>

            {/* Document Body */}
            <div className="px-8 py-6">
              <div 
                ref={contentRef}
                className="ProseMirror prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: document.content || '' }}
              />
            </div>
          </article>
        </div>
      </div>
    </UserLayout>
  );
}

export default function DocumentViewPage() {
  return (
    <ProtectedRoute>
      <DocumentContent />
    </ProtectedRoute>
  );
}