// src/having/userQuestion/components/SolutionViewer.tsx 

'use client';

import { useState } from 'react';
import { ArrowLeft, Play, FolderOpen, ExternalLink, Code, Palette } from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { TipTapViewer } from '@/having/userQuestion/components/TipTapViewer';
import { EmbeddedVisualizer } from '@/components/common/EmbeddedVisualizer';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';
import type { SolutionSummary } from '@/having/userQuestion/types';

interface SolutionViewerProps {
  solution: SolutionSummary;
  onBack: () => void;
}

// Monaco Editor Themes
const MONACO_THEMES = [
  { name: "VS Code Dark", value: "vs-dark" },
  { name: "VS Code Light", value: "light" },
  { name: "High Contrast Dark", value: "hc-black" },
  { name: "High Contrast Light", value: "hc-light" },
];

// Language mapping for Monaco Editor
const getMonacoLanguage = (language: string): string => {
  const languageMap: Record<string, string> = {
    'javascript': 'javascript',
    'typescript': 'typescript',
    'python': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'csharp': 'csharp',
    'c#': 'csharp',
    'php': 'php',
    'ruby': 'ruby',
    'go': 'go',
    'rust': 'rust',
    'kotlin': 'kotlin',
    'swift': 'swift',
  };

  return languageMap[language.toLowerCase()] || 'plaintext';
};

export function SolutionViewer({ solution, onBack }: SolutionViewerProps) {
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // const { data: visualizerFiles } = useVisualizerFilesBySolution(solution.id);

  const hasCodeSnippet = solution.codeSnippet && solution.codeSnippet.code.trim();
  // const hasVisualizers = Boolean(visualizerFiles?.data && visualizerFiles.data.length > 0);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to question</span>
        </button>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Solution by {solution.createdByName}
          </h2>

          {/* External Links */}
          <div className="flex items-center space-x-2">
            {solution.youtubeLink && (
              <a
                href={solution.youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-sm"
                title="Watch video explanation"
              >
                <Play className="w-4 h-4" />
                <span>Video</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {solution.driveLink && (
              <a
                href={solution.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors text-sm"
                title="Open drive resources"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Resources</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        {/* Solution Content */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Explanation
          </h3>
          <TipTapViewer content={solution.content} />
        </div>

        {/* Code Snippet with Monaco Editor */}
        {hasCodeSnippet && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Code Implementation
              </h3>

              {/* Theme Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="flex items-center space-x-1 px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                  title="Change theme"
                >
                  <Palette className="w-4 h-4" />
                  <span>Theme</span>
                </button>

                {showThemeSelector && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowThemeSelector(false)}
                    />
                    <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[180px]">
                      {MONACO_THEMES.map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => {
                            setEditorTheme(theme.value);
                            setShowThemeSelector(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                            editorTheme === theme.value
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {solution.codeSnippet!.language}
                </span>
              </div>
              <Editor
                height="400px"
                language={getMonacoLanguage(solution.codeSnippet!.language)}
                value={solution.codeSnippet!.code}
                theme={editorTheme}
                options={{
                  readOnly: true,
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                }}
              />
            </div>
          </div>
        )}

        {/* Visualizers */}
        {/* {hasVisualizers && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CubeTransparentIcon className="w-5 h-5 mr-2" />
              Interactive Visualizations
            </h3>
            <div className="space-y-4">
              {visualizerFiles?.data?.map((file) => (
                <EmbeddedVisualizer
                  key={file.fileId}
                  fileId={file.fileId}
                />
              ))}
            </div>
          </div>
        )} */}

        {/* YouTube Embed */}
        {solution.youtubeLink && solution.youtubeEmbedUrl && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Video Tutorial
            </h3>
            <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <iframe
                src={solution.youtubeEmbedUrl}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}