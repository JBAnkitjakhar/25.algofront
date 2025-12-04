// src/having/userQuestion/components/SolutionViewer.tsx

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Play, FolderOpen, ExternalLink, Code, Palette, FileText, Box } from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { TipTapViewer } from '@/having/userQuestion/components/TipTapViewer';
import { EmbeddedVisualizer } from '@/components/common/EmbeddedVisualizer';
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

type ViewMode = 'code' | 'explanation' | 'visualizer';

export function SolutionViewer({ solution, onBack }: SolutionViewerProps) {
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [leftView, setLeftView] = useState<ViewMode>('code');
  const [rightView, setRightView] = useState<ViewMode>('explanation');
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const isResizingRef = useRef(false);

  // const { data: visualizerFiles } = useVisualizerFilesBySolution(solution.id);

  const hasCodeSnippet = solution.codeSnippet && solution.codeSnippet.code.trim();
  // const hasVisualizers = Boolean(visualizerFiles?.data && visualizerFiles.data.length > 0);
  const hasVisualizers = false; // Placeholder until visualizers are implemented

  // Load saved panel width
  useEffect(() => {
    const savedWidth = localStorage.getItem('solution_viewer_panel_width');
    if (savedWidth) setLeftPanelWidth(parseFloat(savedWidth));
  }, []);

  // Save panel width
  useEffect(() => {
    localStorage.setItem('solution_viewer_panel_width', leftPanelWidth.toString());
  }, [leftPanelWidth]);

  // Handle panel resizing
  const handlePanelMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isResizingRef.current = true;
    const startX = e.clientX;
    const startWidth = leftPanelWidth;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const deltaX = e.clientX - startX;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newWidth = Math.min(Math.max(startWidth + deltaPercent, 30), 70);
      setLeftPanelWidth(newWidth);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      isResizingRef.current = false;
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [leftPanelWidth]);

  // Ensure left and right views are different
  const handleLeftViewChange = (view: ViewMode) => {
    if (view === rightView) {
      // Swap views if selecting the same as right
      setRightView(leftView);
    }
    setLeftView(view);
  };

  const handleRightViewChange = (view: ViewMode) => {
    if (view === leftView) {
      // Swap views if selecting the same as left
      setLeftView(rightView);
    }
    setRightView(view);
  };

  // Render view content
  const renderViewContent = (view: ViewMode) => {
    switch (view) {
      case 'code':
        if (!hasCodeSnippet) {
          return (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No code available for this solution</p>
              </div>
            </div>
          );
        }
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {solution.codeSnippet!.language}
              </span>

              {/* Theme Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="flex items-center space-x-1 px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs"
                  title="Change theme"
                >
                  <Palette className="w-3 h-3" />
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
            <div className="flex-1">
              <Editor
                height="100%"
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
        );

      case 'explanation':
        return (
          <div className="h-full overflow-auto custom-scrollbar p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Solution Explanation
            </h3>
            <TipTapViewer content={solution.content} />
          </div>
        );

      case 'visualizer':
        if (!hasVisualizers) {
          return (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No visualizers available for this solution</p>
              </div>
            </div>
          );
        }
        return (
          <div className="h-full overflow-auto custom-scrollbar p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Box className="w-5 h-5 mr-2" />
              Interactive Visualizations
            </h3>
            <div className="space-y-4">
              {/* {visualizerFiles?.data?.map((file) => (
                <EmbeddedVisualizer
                  key={file.fileId}
                  fileId={file.fileId}
                />
              ))} */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visualizers will be displayed here once implemented
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // View selector component
  const ViewSelector = ({ 
    currentView, 
    onChange, 
    label 
  }: { 
    currentView: ViewMode; 
    onChange: (view: ViewMode) => void; 
    label: string;
  }) => (
    <div className="flex items-center space-x-1">
      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{label}:</span>
      <button
        onClick={() => onChange('code')}
        disabled={!hasCodeSnippet}
        className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
          currentView === 'code'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        } ${!hasCodeSnippet ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Code className="w-3 h-3" />
        <span>Code</span>
      </button>
      <button
        onClick={() => onChange('explanation')}
        className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
          currentView === 'explanation'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        <FileText className="w-3 h-3" />
        <span>Explanation</span>
      </button>
      <button
        onClick={() => onChange('visualizer')}
        disabled={!hasVisualizers}
        className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
          currentView === 'visualizer'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        } ${!hasVisualizers ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Box className="w-3 h-3" />
        <span>Visualizer</span>
      </button>
    </div>
  );

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

      {/* View Controls */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <ViewSelector 
            currentView={leftView} 
            onChange={handleLeftViewChange} 
            label="Left Panel" 
          />
          <ViewSelector 
            currentView={rightView} 
            onChange={handleRightViewChange} 
            label="Right Panel" 
          />
        </div>
      </div>

      {/* Split Panel Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel */}
        <div
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {renderViewContent(leftView)}
        </div>

        {/* Resizer */}
        <div
          className="w-1 bg-gray-300 dark:bg-gray-600 cursor-col-resize hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors relative group"
          onMouseDown={handlePanelMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20"></div>
        </div>

        {/* Right Panel */}
        <div
          className="bg-white dark:bg-gray-800"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {renderViewContent(rightView)}
        </div>
      </div>

      {/* YouTube Embed (Optional - Full Width Bottom) */}
      {solution.youtubeLink && solution.youtubeEmbedUrl && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Play className="w-4 h-4 mr-2" />
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
  );
}