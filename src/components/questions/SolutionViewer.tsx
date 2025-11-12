// src/components/questions/SolutionViewer.tsx  

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Editor } from "@monaco-editor/react";
import { 
  Play, 
  FolderOpen, 
  ExternalLink, 
  Code, 
  ArrowLeft,
  Palette,
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { useVisualizerFilesBySolution } from '@/hooks/useSolutionManagement';
import { cookieManager } from '@/lib/utils/auth';
import type { Solution } from '@/types';
import { CubeIcon, CubeTransparentIcon } from '@heroicons/react/24/outline';
import type { editor } from "monaco-editor";

interface SolutionViewerProps {
  solution: Solution;
  onBack: () => void;
}

type ViewMode = 'code' | 'visualizer';

// Monaco Editor Themes - Same as compiler
const MONACO_THEMES = [
  { name: "VS Code Light", value: "light", preview: "bg-white text-gray-900" },
  { name: "VS Code Dark", value: "vs-dark", preview: "bg-gray-800 text-white" },
  { name: "Monokai", value: "monokai", preview: "bg-gray-900 text-green-400" },
  { name: "Dracula", value: "dracula", preview: "bg-purple-900 text-purple-200" },
  { name: "Cobalt", value: "cobalt", preview: "bg-blue-900 text-blue-200" },
  { name: "One Dark", value: "one-dark", preview: "bg-gray-900 text-orange-400" },
  { name: "Eclipse", value: "eclipse", preview: "bg-gray-100 text-gray-800" },
];

// Custom Monaco Themes - Same as compiler
const customThemes = {
  monokai: {
    base: "vs-dark" as const,
    inherit: true,
    rules: [
      { token: "", foreground: "F8F8F2", background: "272822" },
      { token: "comment", foreground: "75715E" },
      { token: "keyword", foreground: "F92672" },
      { token: "string", foreground: "E6DB74" },
      { token: "number", foreground: "AE81FF" },
      { token: "regexp", foreground: "FD971F" },
      { token: "operator", foreground: "F92672" },
      { token: "namespace", foreground: "F92672" },
      { token: "type", foreground: "66D9EF" },
      { token: "struct", foreground: "A6E22E" },
      { token: "class", foreground: "A6E22E" },
      { token: "interface", foreground: "A6E22E" },
      { token: "parameter", foreground: "FD971F" },
      { token: "variable", foreground: "F8F8F2" },
      { token: "function", foreground: "A6E22E" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#F8F8F2",
      "editorCursor.foreground": "#F8F8F0",
      "editor.lineHighlightBackground": "#3E3D32",
      "editorLineNumber.foreground": "#90908A",
      "editor.selectionBackground": "#49483E",
      "editor.inactiveSelectionBackground": "#49483E",
    },
  },
  dracula: {
    base: "vs-dark" as const,
    inherit: true,
    rules: [
      { token: "", foreground: "F8F8F2", background: "282A36" },
      { token: "comment", foreground: "6272A4" },
      { token: "keyword", foreground: "FF79C6" },
      { token: "string", foreground: "F1FA8C" },
      { token: "number", foreground: "BD93F9" },
      { token: "regexp", foreground: "F1FA8C" },
      { token: "operator", foreground: "FF79C6" },
      { token: "namespace", foreground: "FF79C6" },
      { token: "type", foreground: "8BE9FD" },
      { token: "struct", foreground: "50FA7B" },
      { token: "class", foreground: "50FA7B" },
      { token: "interface", foreground: "50FA7B" },
      { token: "parameter", foreground: "FFB86C" },
      { token: "variable", foreground: "F8F8F2" },
      { token: "function", foreground: "50FA7B" },
    ],
    colors: {
      "editor.background": "#282A36",
      "editor.foreground": "#F8F8F2",
      "editorCursor.foreground": "#F8F8F0",
      "editor.lineHighlightBackground": "#44475A",
      "editorLineNumber.foreground": "#6272A4",
      "editor.selectionBackground": "#44475A",
      "editor.inactiveSelectionBackground": "#44475A",
    },
  },
  cobalt: {
    base: "vs-dark" as const,
    inherit: true,
    rules: [
      { token: "", foreground: "FFFFFF", background: "002240" },
      { token: "comment", foreground: "0088FF" },
      { token: "keyword", foreground: "FF9D00" },
      { token: "string", foreground: "3AD900" },
      { token: "number", foreground: "FF628C" },
      { token: "regexp", foreground: "80FFBB" },
      { token: "operator", foreground: "FF9D00" },
      { token: "namespace", foreground: "FF9D00" },
      { token: "type", foreground: "80FFBB" },
      { token: "struct", foreground: "FFEE80" },
      { token: "class", foreground: "FFEE80" },
      { token: "interface", foreground: "FFEE80" },
      { token: "parameter", foreground: "FFEE80" },
      { token: "variable", foreground: "FFFFFF" },
      { token: "function", foreground: "FFEE80" },
    ],
    colors: {
      "editor.background": "#002240",
      "editor.foreground": "#FFFFFF",
      "editorCursor.foreground": "#FFFFFF",
      "editor.lineHighlightBackground": "#001B33",
      "editorLineNumber.foreground": "#0088FF",
      "editor.selectionBackground": "#004080",
      "editor.inactiveSelectionBackground": "#003366",
    },
  },
  "one-dark": {
    base: "vs-dark" as const,
    inherit: true,
    rules: [
      { token: "", foreground: "ABB2BF", background: "282C34" },
      { token: "comment", foreground: "5C6370" },
      { token: "keyword", foreground: "C678DD" },
      { token: "string", foreground: "98C379" },
      { token: "number", foreground: "D19A66" },
      { token: "regexp", foreground: "56B6C2" },
      { token: "operator", foreground: "56B6C2" },
      { token: "namespace", foreground: "C678DD" },
      { token: "type", foreground: "E06C75" },
      { token: "struct", foreground: "E5C07B" },
      { token: "class", foreground: "E5C07B" },
      { token: "interface", foreground: "E5C07B" },
      { token: "parameter", foreground: "D19A66" },
      { token: "variable", foreground: "ABB2BF" },
      { token: "function", foreground: "61AFEF" },
    ],
    colors: {
      "editor.background": "#282C34",
      "editor.foreground": "#ABB2BF",
      "editorCursor.foreground": "#528BFF",
      "editor.lineHighlightBackground": "#2C313C",
      "editorLineNumber.foreground": "#636D83",
      "editor.selectionBackground": "#3E4451",
      "editor.inactiveSelectionBackground": "#3E4451",
    },
  },
  eclipse: {
    base: "vs" as const,
    inherit: true,
    rules: [
      { token: "", foreground: "000000", background: "FFFFFF" },
      { token: "comment", foreground: "3F7F5F" },
      { token: "keyword", foreground: "7F0055" },
      { token: "string", foreground: "2A00FF" },
      { token: "number", foreground: "000000" },
      { token: "regexp", foreground: "000000" },
      { token: "operator", foreground: "000000" },
      { token: "namespace", foreground: "7F0055" },
      { token: "type", foreground: "000000" },
      { token: "struct", foreground: "000000" },
      { token: "class", foreground: "000000" },
      { token: "interface", foreground: "000000" },
      { token: "parameter", foreground: "000000" },
      { token: "variable", foreground: "000000" },
      { token: "function", foreground: "000000" },
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.foreground": "#000000",
      "editorCursor.foreground": "#000000",
      "editor.lineHighlightBackground": "#F0F0F0",
      "editorLineNumber.foreground": "#999999",
      "editor.selectionBackground": "#C0C0C0",
      "editor.inactiveSelectionBackground": "#E0E0E0",
    },
  },
};

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
    'dart': 'dart',
    'html': 'html',
    'css': 'css',
    'sql': 'sql',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'markdown': 'markdown',
  };

  return languageMap[language.toLowerCase()] || 'plaintext';
};

export function SolutionViewer({ solution, onBack }: SolutionViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [selectedVisualizerId, setSelectedVisualizerId] = useState<string | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isResizing, setIsResizing] = useState(false);
  
  // Theme state for Monaco Editor
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  const isResizingRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Fetch visualizer files data
  const { 
    data: visualizerFiles, 
    isLoading: visualizerFilesLoading,
    error: visualizerFilesError 
  } = useVisualizerFilesBySolution(solution.id);

  const hasCodeSnippet = solution.codeSnippet && solution.codeSnippet.code.trim();
  const hasVisualizers = Boolean(visualizerFiles?.data && visualizerFiles.data.length > 0);
  const hasYouTube = solution.youtubeLink;
  const hasDrive = solution.driveLink;

  // Load and save theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("solution_viewer_theme");
    if (savedTheme) {
      setEditorTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("solution_viewer_theme", editorTheme);
  }, [editorTheme]);

  // Monaco Editor beforeMount with custom themes
  const handleEditorWillMount = (monaco: typeof import("monaco-editor")) => {
    try {
      Object.entries(customThemes).forEach(([name, theme]) => {
        try {
          monaco.editor.defineTheme(name, theme);
        } catch (error) {
          console.warn(`Failed to define theme ${name} (safe to ignore):`, error);
        }
      });
    } catch (error) {
      console.warn("Failed to define custom themes (safe to ignore):", error);
    }
  };

  // Monaco Editor mount handler
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    try {
      editorRef.current = editor;
      setTimeout(() => {
        try {
          editor.layout();
        } catch (error) {
          console.warn("Initial Monaco layout error (safe to ignore):", error);
        }
      }, 100);
    } catch (error) {
      console.warn("Monaco Editor mount error (safe to ignore):", error);
    }
  };

  // Fetch HTML content and create blob URL (same approach as popup)
  const fetchVisualizerContent = useCallback(async (fileId: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = cookieManager.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      const url = `${apiBaseUrl}/files/visualizers/${fileId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to load visualizer: ${response.status}`);
      }

      const htmlText = await response.text();

      // Create blob URL like the popup does
      const blob = new Blob([htmlText], { type: 'text/html' });
      const url_blob = URL.createObjectURL(blob);
      
      setBlobUrl(url_blob);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load visualizer';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleVisualizerSelect = useCallback((fileId: string) => {
    setSelectedVisualizerId(fileId);
    setViewMode('visualizer');
    fetchVisualizerContent(fileId);
  }, [fetchVisualizerContent]);

  const handleBackToCode = useCallback(() => {
    setViewMode('code');
    setSelectedVisualizerId(null);
    setBlobUrl('');
    setError('');
  }, []);

  // Enhanced panel resizing with iframe-safe behavior
  const handlePanelMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      isResizingRef.current = true;
      
      const startX = e.clientX;
      const startWidth = leftPanelWidth;

      // Disable iframe pointer events immediately
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = 'none';
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizingRef.current) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const deltaX = e.clientX - startX;
        const containerWidth = window.innerWidth;
        const deltaPercent = (deltaX / containerWidth) * 100;
        const newWidth = Math.min(Math.max(startWidth + deltaPercent, 25), 75);

        setLeftPanelWidth(newWidth);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIsResizing(false);
        isResizingRef.current = false;
        
        // Re-enable iframe pointer events
        if (iframeRef.current) {
          iframeRef.current.style.pointerEvents = 'auto';
        }
        
        // Trigger Monaco Editor layout
        if (editorRef.current) {
          try {
            editorRef.current.layout();
          } catch (error) {
            console.warn("Monaco Editor layout error (safe to ignore):", error);
          }
        }
        
        // Clean up event listeners
        document.removeEventListener("mousemove", handleMouseMove, true);
        document.removeEventListener("mouseup", handleMouseUp, true);
        
        // Reset document styles
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        document.body.style.pointerEvents = "";
      };

      // Set document styles for smooth resizing
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
      document.body.style.pointerEvents = "none";
      
      // Use capture phase to ensure we get events before iframe
      document.addEventListener("mousemove", handleMouseMove, true);
      document.addEventListener("mouseup", handleMouseUp, true);
    },
    [leftPanelWidth]
  );

  // Load and save panel width
  useEffect(() => {
    const savedWidth = localStorage.getItem("solution_viewer_panel_width");
    if (savedWidth) {
      setLeftPanelWidth(parseFloat(savedWidth));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("solution_viewer_panel_width", leftPanelWidth.toString());
  }, [leftPanelWidth]);

  // Cleanup blob URL when component unmounts or changes
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // Global resize state cleanup on unmount
  useEffect(() => {
    return () => {
      if (isResizingRef.current) {
        setIsResizing(false);
        isResizingRef.current = false;
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        document.body.style.pointerEvents = "";
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Main Content Area with Resizable Panels */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left Panel - Code or Visualizer */}
        <div 
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full relative"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {viewMode === 'code' ? (
            // Code Solution Panel with Monaco Editor
            <div className="h-full flex flex-col">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    Solution Code
                  </h3>
                  <div className="flex items-center space-x-2">
                    {hasCodeSnippet && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {solution.codeSnippet!.language}
                      </span>
                    )}
                    
                    {/* Theme Selector */}
                    {hasCodeSnippet && (
                      <div className="relative">
                        <button
                          onClick={() => setShowThemeSelector(!showThemeSelector)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                          title="Change theme"
                        >
                          <Palette className="w-3 h-3" />
                        </button>

                        {showThemeSelector && (
                          <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[150px]">
                            {MONACO_THEMES.map((themeOption) => (
                              <button
                                key={themeOption.value}
                                onClick={() => {
                                  setEditorTheme(themeOption.value);
                                  setShowThemeSelector(false);
                                }}
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                                  editorTheme === themeOption.value
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`w-3 h-3 rounded ${themeOption.preview}`}
                                  ></div>
                                  <span>{themeOption.name}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-h-0">
                {hasCodeSnippet ? (
                  <Editor
                    height="100%"
                    language={getMonacoLanguage(solution.codeSnippet!.language)}
                    value={solution.codeSnippet!.code}
                    theme={editorTheme}
                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorDidMount}
                    options={{
                      readOnly: true,
                      fontSize: 13,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: "on",
                      lineNumbers: "on",
                      renderWhitespace: "selection",
                      tabSize: 2,
                      insertSpaces: true,
                      folding: true,
                      contextmenu: false,
                      selectOnLineNumbers: true,
                      cursorBlinking: "blink",
                      cursorSmoothCaretAnimation: "on",
                      smoothScrolling: true,
                      scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto',
                        verticalScrollbarSize: 4,
                        horizontalScrollbarSize: 4,
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No code solution provided</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Visualizer Panel with Enhanced Iframe Handling
            <div className="h-full flex flex-col">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <CubeTransparentIcon className="w-4 h-4 mr-2" />
                    Algorithm Visualizer
                  </h3>
                </div>
              </div>
              
              <div className="flex-1 min-h-0 relative iframe-container">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-300 text-sm">
                      Loading visualizer...
                    </span>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full text-red-600 dark:text-red-400 p-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">Failed to load visualizer</div>
                      <div className="text-xs mt-1 text-red-500 dark:text-red-400">{error}</div>
                    </div>
                  </div>
                ) : blobUrl ? (
                  <div className="w-full h-full overflow-hidden relative">
                    <iframe
                      ref={iframeRef}
                      src={blobUrl}
                      title="Algorithm Visualizer"
                      className="w-full h-full border-0 visualizer-iframe"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                      style={{
                        pointerEvents: isResizing ? 'none' : 'auto',
                        margin: 0,
                        padding: 0,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none'
                      }}
                    />
                    {/* Invisible overlay during resize to prevent iframe interference */}
                    {isResizing && (
                      <div 
                        className="absolute inset-0 bg-transparent cursor-col-resize z-10"
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4">
                    <div className="text-center">
                      <CubeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No visualizer selected</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Resizer with Better Event Handling */}
        <div
          className={`w-1 cursor-col-resize relative group flex-shrink-0 transition-colors z-20 ${
            isResizing 
              ? 'bg-blue-500 dark:bg-blue-400' 
              : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 dark:hover:bg-blue-400'
          }`}
          onMouseDown={handlePanelMouseDown}
          style={{ 
            userSelect: 'none',
            touchAction: 'none'
          }}
        >
          <div className="absolute inset-y-0 -left-2 -right-2 group-hover:bg-blue-500/10"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col space-y-0.5">
              <div className="w-0.5 h-1 bg-white rounded-full"></div>
              <div className="w-0.5 h-1 bg-white rounded-full"></div>
              <div className="w-0.5 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Panel - Solution Explanation */}
        <div 
          className="bg-white dark:bg-gray-800 flex flex-col h-full"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
            <div className="flex items-center justify-between">
              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                {/* Back Button */}
                <button
                  onClick={onBack}
                  className="flex items-center px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors text-xs"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  <span className="font-medium">Back to Question</span>
                </button>

                {/* YouTube Link */}
                {hasYouTube && (
                  <a
                    href={solution.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-xs"
                    title="Watch video explanation"
                  >
                    <Play className="w-3 h-3" />
                    <span className="font-medium">Video</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}

                {/* Drive Link */}
                {hasDrive && (
                  <a
                    href={solution.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors text-xs"
                    title="Open drive resources"
                  >
                    <FolderOpen className="w-3 h-3" />
                    <span className="font-medium">Resources</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}

                {/* Visualizer Buttons */}
                {visualizerFilesLoading ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400">Loading visualizers...</div>
                ) : visualizerFilesError ? (
                  <div className="text-xs text-red-500 dark:text-red-400">Failed to load visualizers</div>
                ) : hasVisualizers ? (
                  <div className="flex items-center space-x-1">
                    {visualizerFiles?.data?.map((file) => (
                      <button
                        key={file.fileId}
                        onClick={() => handleVisualizerSelect(file.fileId)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors text-xs ${
                          viewMode === 'visualizer' && selectedVisualizerId === file.fileId
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                        }`}
                      >
                        <CubeTransparentIcon className="w-3 h-3" />
                        <span className="font-medium">Visualizer</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {/* Code View Button */}
                {hasCodeSnippet && viewMode !== 'code' && (
                  <button
                    onClick={handleBackToCode}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 rounded transition-colors text-xs"
                    title="View code solution"
                  >
                    <Code className="w-3 h-3" />
                    <span className="font-medium">Code</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Solution content with custom scrollbar */}
          <div className="flex-1 min-h-0 overflow-auto p-6 custom-scrollbar">
            <div className="max-w-none">
              <MarkdownRenderer 
                content={solution.content}
                className="text-gray-700 dark:text-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Global resize overlay to handle edge cases */}
        {isResizing && (
          <div 
            className="fixed inset-0 bg-transparent cursor-col-resize z-50"
            style={{ 
              pointerEvents: 'none',
              userSelect: 'none' 
            }}
          />
        )}
      </div>

      {/* Click outside to close theme selector */}
      {showThemeSelector && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowThemeSelector(false)}
        />
      )}
    </div>
  );
}