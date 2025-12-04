// src/having/userQuestion/components/QuestionCompilerLayout.tsx  

'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, RotateCcw, Upload, Plus, Minus } from 'lucide-react';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import { useApproachesByQuestion, useCreateApproach } from '@/having/userQuestion/hooks';
import { SUPPORTED_LANGUAGES, type Language } from '@/lib/compiler/languages';
import type { QuestionDetail } from '@/having/userQuestion/types';

interface QuestionCompilerLayoutProps {
  question: QuestionDetail;
}

export function QuestionCompilerLayout({ question }: QuestionCompilerLayoutProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [initialCode, setInitialCode] = useState('');

  const { data: approaches } = useApproachesByQuestion(question.id);
  const executeMutation = useCodeExecution();
  const createApproachMutation = useCreateApproach();

  // Load initial code: priority is user's approach > starter code > template
  useEffect(() => {
    let codeToLoad = '';

    // 1. Try to find user's latest approach for selected language
    if (approaches && approaches.length > 0) {
      const languageApproach = approaches.find(
        (a) => a.codeLanguage.toLowerCase() === selectedLanguage.name.toLowerCase()
      );
      if (languageApproach) {
        // We only have metadata, need to fetch full approach
        // For now, use template and let user click edit to load their code
      }
    }

    // 2. Try to find admin starter code for selected language
    if (!codeToLoad && question.codeSnippets && question.codeSnippets.length > 0) {
      const snippet = question.codeSnippets.find(
        (s) => s.language.toLowerCase() === selectedLanguage.name.toLowerCase()
      );
      if (snippet) {
        codeToLoad = snippet.code;
      }
    }

    // 3. Fall back to default template
    if (!codeToLoad) {
      codeToLoad = selectedLanguage.defaultCode;
    }

    setCode(codeToLoad);
    setInitialCode(codeToLoad);
  }, [selectedLanguage, question.codeSnippets, approaches]);

  const handleRun = () => {
    executeMutation.mutate({
      language: selectedLanguage.pistonName,
      version: selectedLanguage.version,
      code,
      input,
    });
  };

  const handleReset = () => {
    setCode(initialCode);
  };

  const handleSubmit = () => {
    createApproachMutation.mutate({
      questionId: question.id,
      data: {
        textContent: '', // Empty description for quick submit
        codeContent: code,
        codeLanguage: selectedLanguage.name,
      },
    });
  };

  // Helper to get output from response
  const getOutput = () => {
    if (!executeMutation.data?.success || !executeMutation.data.data) {
      return 'No output';
    }

    const result = executeMutation.data.data;
    
    // Check if there's a run object
    if (result.run) {
      return result.run.stdout || result.run.stderr || 'No output';
    }

    // Fallback
    return 'No output';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <select
            value={selectedLanguage.name}
            onChange={(e) => {
              const lang = SUPPORTED_LANGUAGES.find(l => l.name === e.target.value);
              if (lang) setSelectedLanguage(lang);
            }}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.name} value={lang.name}>
                {lang.name}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFontSize((prev) => Math.max(10, prev - 2))}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Decrease font size"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-center">
              {fontSize}
            </span>
            <button
              onClick={() => setFontSize((prev) => Math.min(24, prev + 2))}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Increase font size"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={createApproachMutation.isPending}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {createApproachMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>Submit</span>
          </button>

          <button
            onClick={handleRun}
            disabled={executeMutation.isPending}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {executeMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="60%"
          language={selectedLanguage.monacoLanguage}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />

        {/* Input/Output */}
        <div className="h-[40%] border-t border-gray-200 dark:border-gray-700 flex">
          <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Input
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none"
              placeholder="Enter input here..."
            />
          </div>

          <div className="flex-1 flex flex-col">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Output
              </span>
            </div>
            <div className="flex-1 p-3 bg-white dark:bg-gray-800 overflow-auto">
              {executeMutation.isPending ? (
                <div className="text-gray-500 dark:text-gray-400">Running...</div>
              ) : executeMutation.data ? (
                <pre className="font-mono text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {getOutput()}
                </pre>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  Output will appear here...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}