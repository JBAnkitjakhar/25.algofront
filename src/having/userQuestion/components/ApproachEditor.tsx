// src/components/questions/ApproachEditor.tsx - UPDATE Props

'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, RotateCcw } from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { useUpdateApproach } from '@/having/userQuestion/hooks';
import type { ApproachDetail } from '@/having/userQuestion/types'; // CHANGED
import toast from 'react-hot-toast';

interface ApproachEditorProps {
  approach: ApproachDetail; // CHANGED from ApproachDTO
  onBack: () => void;
}

const TEXT_CONTENT_LIMIT = 50000;
const CODE_CONTENT_LIMIT = 50000;

export function ApproachEditor({ approach, onBack }: ApproachEditorProps) {
  const [textContent, setTextContent] = useState(approach.textContent);
  const [codeContent, setCodeContent] = useState(approach.codeContent);
  const [hasChanges, setHasChanges] = useState(false);

  const updateMutation = useUpdateApproach();

  useEffect(() => {
    const changed =
      textContent !== approach.textContent ||
      codeContent !== approach.codeContent;
    setHasChanges(changed);
  }, [textContent, codeContent, approach]);

  const handleSave = async () => {
    if (textContent.length > TEXT_CONTENT_LIMIT) {
      toast.error(`Description exceeds ${TEXT_CONTENT_LIMIT} characters`);
      return;
    }

    if (codeContent.length > CODE_CONTENT_LIMIT) {
      toast.error(`Code exceeds ${CODE_CONTENT_LIMIT} characters`);
      return;
    }

    updateMutation.mutate(
      {
        questionId: approach.questionId,
        approachId: approach.id,
        data: {
          textContent,
          codeContent,
          codeLanguage: approach.codeLanguage,
        },
      },
      {
        onSuccess: () => {
          onBack();
        },
      }
    );
  };

  const handleReset = () => {
    setTextContent(approach.textContent);
    setCodeContent(approach.codeContent);
  };

  const textCharsLeft = TEXT_CONTENT_LIMIT - textContent.length;
  const codeCharsLeft = CODE_CONTENT_LIMIT - codeContent.length;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              disabled={!hasChanges || updateMutation.isPending}
              className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            <button
              onClick={onBack}
              disabled={updateMutation.isPending}
              className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Edit Approach - {approach.codeLanguage}
        </h2>
      </div>

      {/* Editor Split View */}
      <div className="flex-1 flex min-h-0">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Code ({approach.codeLanguage})
            </h3>
            <span
              className={`text-xs ${
                codeCharsLeft < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {codeCharsLeft.toLocaleString()} characters left
            </span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={approach.codeLanguage.toLowerCase()}
              value={codeContent}
              onChange={(value) => setCodeContent(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Description Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Description
            </h3>
            <span
              className={`text-xs ${
                textCharsLeft < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {textCharsLeft.toLocaleString()} characters left
            </span>
          </div>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="flex-1 p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none font-mono text-sm"
            placeholder="Describe your approach, thought process, time/space complexity..."
          />
        </div>
      </div>
    </div>
  );
}