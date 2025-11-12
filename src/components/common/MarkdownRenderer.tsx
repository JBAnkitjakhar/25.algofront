// src/components/common/MarkdownRenderer.tsx  

'use client';

import Image from 'next/image';
import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface MarkdownElement {
  type: 'text' | 'image' | 'code';
  content: string;
  language?: string;
  alt?: string;
  url?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const parsedContent = useMemo(() => {
    if (!content) return [];

    const elements: MarkdownElement[] = [];
    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Handle code blocks
      if (line.startsWith('```')) {
        const language = line.slice(3).trim() || 'text';
        let codeContent = '';
        i++; // Move past opening ```
        
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeContent += lines[i] + '\n';
          i++;
        }
        
        elements.push({
          type: 'code',
          content: codeContent.trim(),
          language
        });
        i++; // Move past closing ```
        continue;
      }

      // Handle images
      const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (imageMatch) {
        const [, alt, url] = imageMatch;
        const beforeImage = line.substring(0, imageMatch.index);
        const afterImage = line.substring(imageMatch.index! + imageMatch[0].length);

        // Add text before image if any
        if (beforeImage) {
          elements.push({
            type: 'text',
            content: beforeImage
          });
        }

        // Add image
        elements.push({
          type: 'image',
          content: '',
          alt: alt || 'Question Image',
          url
        });

        // Add text after image if any
        if (afterImage) {
          elements.push({
            type: 'text',
            content: afterImage
          });
        }

        i++;
        continue;
      }

      // Handle regular text
      elements.push({
        type: 'text',
        content: line
      });
      i++;
    }

    // Merge consecutive text elements but preserve exact newlines
    const mergedElements: MarkdownElement[] = [];
    for (const element of elements) {
      const lastElement = mergedElements[mergedElements.length - 1];
      
      if (element.type === 'text' && lastElement?.type === 'text') {
        lastElement.content += '\n' + element.content;
      } else {
        mergedElements.push(element);
      }
    }

    return mergedElements;
  }, [content]);

  // FIXED: New function to preserve exact spacing and formatting
  const renderPreformattedText = (text: string) => {
    return (
      <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed break-words">
        {text}
      </pre>
    );
  };

  const renderCodeBlock = (code: string, language: string) => {
    return (
      <div className="my-4 bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden">
        <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 text-xs text-gray-300 dark:text-gray-400 font-medium">
          {language.charAt(0).toUpperCase() + language.slice(1)}
        </div>
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm text-gray-100 dark:text-gray-200 font-mono whitespace-pre">
            {code}
          </code>
        </pre>
      </div>
    );
  };

  // FIXED: Use Next.js Image without forced dimensions to preserve Cloudinary's actual size
  const renderImage = (url: string, alt: string) => {
    return (
      <div className="my-6 flex justify-center">
        <div className="max-w-full">
          <Image
            src={url}
            alt={alt}
            width={0}
            height={0}
            sizes="100vw"
            className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm max-w-full h-auto w-auto"
            style={{ 
              objectFit: 'contain',
              maxWidth: '100%',
              height: 'auto',
              width: 'auto'
            }}
            unoptimized
            priority={false}
          />
          {alt && alt !== 'Question Image' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2 italic">
              {alt}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-none ${className}`}>
      {parsedContent.map((element, index) => {
        switch (element.type) {
          case 'text':
            return (
              <div key={index}>
                {renderPreformattedText(element.content)}
              </div>
            );
          
          case 'image':
            return (
              <div key={index}>
                {renderImage(element.url!, element.alt!)}
              </div>
            );
          
          case 'code':
            return (
              <div key={index}>
                {renderCodeBlock(element.content, element.language!)}
              </div>
            );
          
          default:
            return null;
        }
      })}
    </div>
  );
}

// Example usage component for question display
export function QuestionDisplay({ question }: { question: { title: string; statement: string; level: string } }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{question.title}</h1>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          question.level === 'EASY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          question.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {question.level}
        </span>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <MarkdownRenderer content={question.statement} />
      </div>
    </div>
  );
}