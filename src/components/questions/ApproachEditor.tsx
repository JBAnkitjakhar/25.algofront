// src/components/questions/ApproachEditor.tsx

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Editor } from "@monaco-editor/react";
import {
  ArrowLeft,
  Save,
  X,
  ZoomIn,
  ZoomOut,
  Palette,
  Play,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { LanguageSelector } from '@/components/compiler/LanguageSelector';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import { 
  useUpdateApproach, 
  useSubmissionStatus,
  useContentValidation,
  useApproachesByQuestion,
} from '@/hooks/useApproachManagement';
import { ApproachLimitCalculator } from '@/lib/utils/approachLimits';
import { APPROACH_VALIDATION } from '@/constants';
import { getDefaultLanguage, Language, SUPPORTED_LANGUAGES } from '@/lib/compiler/languages';
import type { editor } from "monaco-editor";
import type { ApproachDTO, UpdateApproachRequest } from '@/types/admin';
import { toast } from 'react-hot-toast';

// Monaco Editor Themes
const MONACO_THEMES = [
  { name: "VS Code Light", value: "light", preview: "bg-white text-gray-900" },
  { name: "VS Code Dark", value: "vs-dark", preview: "bg-gray-800 text-white" },
  { name: "Monokai", value: "monokai", preview: "bg-gray-900 text-green-400" },
  { name: "Dracula", value: "dracula", preview: "bg-purple-900 text-purple-200" },
  { name: "Cobalt", value: "cobalt", preview: "bg-blue-900 text-blue-200" },
  { name: "One Dark", value: "one-dark", preview: "bg-gray-900 text-orange-400" },
  { name: "Eclipse", value: "eclipse", preview: "bg-gray-100 text-gray-800" },
];

// Custom themes
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

interface ApproachEditorProps {
  approach: ApproachDTO;
  onBack: () => void;
}

export function ApproachEditor({ approach, onBack }: ApproachEditorProps) {
  // Language detection with fallback
  const getInitialLanguage = useCallback((): Language => {
    if (!approach.codeLanguage) {
      return getDefaultLanguage();
    }
    
    const savedLanguage = approach.codeLanguage.toLowerCase().trim();
    
    // Try exact match first
    let foundLanguage = SUPPORTED_LANGUAGES.find(lang => 
      lang.name.toLowerCase() === savedLanguage
    );
    
    // Try partial matches for common variations
    if (!foundLanguage) {
      foundLanguage = SUPPORTED_LANGUAGES.find(lang => {
        const langName = lang.name.toLowerCase();
        return langName.includes(savedLanguage) || savedLanguage.includes(langName);
      });
    }
    
    // Special cases for common language variations
    if (!foundLanguage) {
      const languageMap: Record<string, string> = {
        'js': 'JavaScript',
        'ts': 'TypeScript', 
        'py': 'Python',
        'cpp': 'C++',
        'c++': 'C++',
        'csharp': 'C#',
        'cs': 'C#',
        'go': 'Go',
        'golang': 'Go',
        'rs': 'Rust',
        'java': 'Java'
      };
      
      const mappedName = languageMap[savedLanguage];
      if (mappedName) {
        foundLanguage = SUPPORTED_LANGUAGES.find(lang => lang.name === mappedName);
      }
    }
    
    return foundLanguage || getDefaultLanguage();
  }, [approach.codeLanguage]);

  // State
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(getInitialLanguage());
  const [code, setCode] = useState<string>(approach.codeContent || '');
  const [textContent, setTextContent] = useState<string>(approach.textContent || '');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isOutputCopied, setIsOutputCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  // Panel states  
  const [leftPanelWidth, setLeftPanelWidth] = useState(60);
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [showOutputPanel, setShowOutputPanel] = useState(false);
  const [inputOutputHeight, setInputOutputHeight] = useState(30);

  // Form validation
  const [hasChanges, setHasChanges] = useState(false);

  // Refs
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isResizingRef = useRef(false);

  // API hooks
  const { mutate: executeCode, isPending: codeExecutePending } = useCodeExecution();
  const updateApproachMutation = useUpdateApproach();
  
  // For validation - exclude current approach to check if content fits
  const submissionStatus = useSubmissionStatus(
    approach.questionId,
    textContent,
    code,
    approach.id
  );
  
  // For display - get actual count including current approach
  const { data: allApproaches = [] } = useApproachesByQuestion(approach.questionId);
  const actualApproachCount = allApproaches.length;
  
  const contentValidation = useContentValidation(textContent, code);

  // ADDED: Character count validation functions
  const getTextCharacterStatus = () => {
    const currentLength = textContent.length;
    const maxLength = APPROACH_VALIDATION.TEXT_MAX_LENGTH;
    const isOverLimit = currentLength > maxLength;
    
    return {
      currentLength,
      maxLength,
      isOverLimit,
      displayText: `${currentLength}/${(maxLength / 1000).toFixed(0)}K characters`,
      color: isOverLimit ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
    };
  };

  const getCodeCharacterStatus = () => {
    const currentLength = code.length;
    const maxLength = APPROACH_VALIDATION.CODE_MAX_LENGTH;
    const isOverLimit = currentLength > maxLength;
    
    return {
      currentLength,
      maxLength,
      isOverLimit,
      displayText: `${currentLength}/${(maxLength / 1000).toFixed(0)}K characters`,
      color: isOverLimit ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
    };
  };

  // Track changes
  useEffect(() => {
    const codeChanged = code !== (approach.codeContent || '');
    const textChanged = textContent !== (approach.textContent || '');
    const languageChanged = selectedLanguage.name.toLowerCase() !== getInitialLanguage().name.toLowerCase();
    
    setHasChanges(codeChanged || textChanged || languageChanged);
  }, [code, textContent, selectedLanguage, approach.codeContent, approach.textContent, getInitialLanguage]);

  // Load saved preferences
  useEffect(() => {
    const savedFontSize = localStorage.getItem("approach_editor_fontSize");
    const savedTheme = localStorage.getItem("approach_editor_editorTheme");

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedTheme) setEditorTheme(savedTheme);
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem("approach_editor_fontSize", fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("approach_editor_editorTheme", editorTheme);
  }, [editorTheme]);

  // Debounced resize function
  const debouncedResizeEditor = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      if (editorRef.current && !isResizingRef.current) {
        try {
          requestAnimationFrame(() => {
            try {
              editorRef.current?.layout();
            } catch (error) {
              console.warn("Monaco Editor layout error (safe to ignore):", error);
            }
          });
        } catch (error) {
          console.warn("Monaco Editor resize error (safe to ignore):", error);
        }
      }
      isResizingRef.current = false;
    }, 150);
  }, []);

  // Resizable panel handler
  const handlePanelMouseDown = useCallback(
    (e: React.MouseEvent) => {
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
        const newWidth = Math.min(Math.max(startWidth + deltaPercent, 40), 80);

        setLeftPanelWidth(newWidth);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        isResizingRef.current = false;
        
        debouncedResizeEditor();
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [leftPanelWidth, debouncedResizeEditor]
  );

  // Input/Output panel resizer
  const handleInputOutputMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const container = e.currentTarget.parentElement?.parentElement;
      if (!container) return;

      const startY = e.clientY;
      const startHeight = inputOutputHeight;
      const containerHeight = container.clientHeight;

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const deltaY = startY - e.clientY;
        const deltaPercent = (deltaY / containerHeight) * 100;
        const newHeight = Math.min(Math.max(startHeight + deltaPercent, 15), 60);
        setInputOutputHeight(newHeight);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        
        debouncedResizeEditor();
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor = "row-resize";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [inputOutputHeight, debouncedResizeEditor]
  );

  // Save approach with centralized validation
  const handleSave = () => {
    // ADDED: Check character limits before submission
    const textStatus = getTextCharacterStatus();
    const codeStatus = getCodeCharacterStatus();
    
    if (textStatus.isOverLimit) {
      toast.error(`Description must not exceed ${(textStatus.maxLength / 1000).toFixed(0)}K characters. Currently: ${textStatus.currentLength} characters.`);
      return;
    }
    
    if (codeStatus.isOverLimit) {
      toast.error(`Code must not exceed ${(codeStatus.maxLength / 1000).toFixed(0)}K characters. Currently: ${codeStatus.currentLength} characters.`);
      return;
    }

    if (!contentValidation.valid) {
      toast.error(contentValidation.errors[0]);
      return;
    }

    if (!submissionStatus.canSubmit && submissionStatus.type === 'error') {
      toast.error(submissionStatus.message);
      return;
    }

    const updateData: UpdateApproachRequest = {
      textContent: textContent.trim(),
      codeContent: code.trim(),
      codeLanguage: selectedLanguage.name.toLowerCase(),
    };

    updateApproachMutation.mutate(
      { id: approach.id, data: updateData },
      {
        onSuccess: () => {
          setHasChanges(false);
        },
      }
    );
  };

  // Check if code requires input
  const doesCodeRequireInput = (codeString: string): boolean => {
    const inputPatterns = [
      /Scanner.*nextInt|Scanner.*nextLine|Scanner.*next\(\)|System\.in/i,
      /input\s*\(/i,
      /cin\s*>>/i,
      /readline|process\.stdin/i,
    ];
    return inputPatterns.some((pattern) => pattern.test(codeString));
  };

  // Run code
  const handleRunCode = () => {
    setShowOutputPanel(true);
    setShowInputPanel(false);
    
    if (doesCodeRequireInput(code) && !input.trim()) {
      setOutput(
        `❌ Input Required!\n\nYour ${selectedLanguage.name} code appears to require input. Please provide input in the Input section.\n\nExample input format:\n- Each input on a new line\n- For numbers: 123\n- For text: Hello World`
      );
      return;
    }

    setOutput("🚀 Executing code...\n⏳ Please wait...");
    
    executeCode(
      {
        language: selectedLanguage.pistonName,
        version: selectedLanguage.version,
        code,
        input: input.trim(),
      },
      {
        onSuccess: (response) => {
          if (!response.success || !response.data) {
            setOutput("❌ Invalid response from server");
            return;
          }

          let result = response.data;

          if (result.data && !result.run) {
            result = result.data;
          }

          if (result.successful === false && result.errorMessage) {
            setOutput(`❌ Backend Error: ${result.errorMessage}`);
            return;
          }

          let outputText = "";

          if (result.compile) {
            if (result.compile.stderr) {
              outputText += `❌ Compilation Error:\n${result.compile.stderr}\n\n`;
            }
            if (result.compile.stdout) {
              outputText += `📋 Compilation Output:\n${result.compile.stdout}\n\n`;
            }
            if (result.compile.code !== 0) {
              outputText += `❌ Compilation failed with exit code: ${result.compile.code}\n\n`;
              outputText += `💡 Common fixes:\n- Check syntax errors\n- Verify class name matches filename\n- Check for missing semicolons or brackets\n\n`;
            }
          }

          if (result.run && typeof result.run === "object") {
            if (result.run.stderr) {
              outputText += `🚨 Runtime Error:\n${result.run.stderr}\n`;

              if (result.run.stderr.includes("NoSuchElementException")) {
                outputText += `\n💡 Hint: This error usually means your program expected more input than provided.\n`;
              } else if (result.run.stderr.includes("InputMismatchException")) {
                outputText += `\n💡 Hint: Input type mismatch. Check if you're providing the correct data type.\n`;
              }
            }

            if (result.run.stdout) {
              outputText += result.run.stdout;
            }

            if (result.run.code !== 0 && !result.run.stderr) {
              outputText += `\n⚠️ Program exited with code: ${result.run.code}`;
            } else if (result.run.code === 0 && result.run.stdout) {
              outputText += `\n✅ Program completed successfully!`;
            }
          } else {
            outputText += `❌ Could not find execution results`;
          }

          setOutput(outputText || "✅ Program completed with no output");
        },
        onError: (error: Error) => {
          console.error("Code execution error:", error);
          setOutput(`❌ Execution Error: ${error.message}`);
        },
      }
    );
  };

  // Reset to original values
  const handleReset = () => {
    setCode(approach.codeContent || '');
    setTextContent(approach.textContent || '');
    setSelectedLanguage(getInitialLanguage());
    setInput('');
    setOutput('');
    setShowInputPanel(false);
    setShowOutputPanel(false);
  };

  // Copy output
  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setIsOutputCopied(true);
      setTimeout(() => setIsOutputCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy output:", err);
    }
  };

  // Font size controls
  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 12));

  // Language change handler
  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
  };

  // Monaco Editor handlers
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

  // Handle beforeunload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // Get save button style based on validation and limits
  const getSaveButtonStyle = () => {
    const textStatus = getTextCharacterStatus();
    const codeStatus = getCodeCharacterStatus();
    
    if (!hasChanges || updateApproachMutation.isPending || !contentValidation.valid || textStatus.isOverLimit || codeStatus.isOverLimit) {
      return "bg-gray-400 text-gray-200 cursor-not-allowed";
    }
    
    if (!submissionStatus.canSubmit && submissionStatus.type === 'error') {
      return "bg-red-600 text-white hover:bg-red-700";
    }
    
    if (submissionStatus.type === 'warning') {
      return "bg-orange-600 text-white hover:bg-orange-700";
    }
    
    return "bg-blue-600 text-white hover:bg-blue-700";
  };
 
  // Create display status message that shows actual count
  const getDisplayStatusMessage = () => {
    const textStatus = getTextCharacterStatus();
    const codeStatus = getCodeCharacterStatus();
    
    // Priority: Character limits validation errors
    if (textStatus.isOverLimit) {
      return {
        message: `Description exceeds ${(textStatus.maxLength / 1000).toFixed(0)}K character limit`,
        type: 'error' as const,
        color: "text-red-600 dark:text-red-400"
      };
    }
    
    if (codeStatus.isOverLimit) {
      return {
        message: `Code exceeds ${(codeStatus.maxLength / 1000).toFixed(0)}K character limit`,
        type: 'error' as const,
        color: "text-red-600 dark:text-red-400"
      };
    }

    // Content validation errors
    if (!contentValidation.valid) {
      return {
        message: contentValidation.errors[0],
        type: 'error' as const,
        color: "text-red-600 dark:text-red-400"
      };
    }

    // For display purposes, show the actual count (including current approach)
    const maxApproaches = APPROACH_VALIDATION.MAX_APPROACHES_PER_QUESTION;
    const sizeAvailable = ApproachLimitCalculator.formatSize(
      APPROACH_VALIDATION.MAX_TOTAL_SIZE_PER_USER_PER_QUESTION - 
      ApproachLimitCalculator.calculateContentSize(textContent, code)
    );

    // Use actual count for display instead of validation count
    return {
      message: `Editing approach ${actualApproachCount}/${maxApproaches}. ${sizeAvailable} available.`,
      type: 'info' as const,
      color: "text-blue-600 dark:text-blue-400"
    };
  };

  const displayStatus = getDisplayStatusMessage();

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-1.5">
          <h2 className="text-xs font-medium text-gray-900 dark:text-white">
            Edit Approach
          </h2>
          {hasChanges && (
            <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center space-x-0.5 px-1.5 py-0.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={10} />
            <span>Back to Approaches</span>
          </button>

          {/* Cancel */}
          <button
            onClick={onBack}
            disabled={updateApproachMutation.isPending}
            className="flex items-center space-x-0.5 px-1.5 py-0.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X size={10} />
            <span>Cancel</span>
          </button>

          {/* Save Changes */}
          <button
            onClick={handleSave}
            disabled={!hasChanges || updateApproachMutation.isPending || !contentValidation.valid || getTextCharacterStatus().isOverLimit || getCodeCharacterStatus().isOverLimit}
            className={`flex items-center space-x-0.5 px-1.5 py-0.5 text-xs rounded transition-colors ${getSaveButtonStyle()}`}
            title={
              getTextCharacterStatus().isOverLimit 
                ? `Description exceeds ${(getTextCharacterStatus().maxLength / 1000).toFixed(0)}K character limit`
                : getCodeCharacterStatus().isOverLimit
                  ? `Code exceeds ${(getCodeCharacterStatus().maxLength / 1000).toFixed(0)}K character limit`
                  : !contentValidation.valid 
                    ? contentValidation.errors[0]
                    : !submissionStatus.canSubmit && submissionStatus.type === 'error'
                      ? submissionStatus.message
                      : 'Save your changes'
            }
          >
            <Save size={10} />
            <span>
              {updateApproachMutation.isPending ? 'Saving...' : 'Save Changes'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Code Editor */}
        <div
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Compiler Header */}
          <div className="flex items-center justify-between px-2 py-1 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-medium text-gray-900 dark:text-white">
                Code Editor
              </h3>
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                disabled={codeExecutePending || updateApproachMutation.isPending}
              />
            </div>

            <div className="flex items-center space-x-1">
              {/* Font Size Controls */}
              <div className="flex items-center">
                <button
                  onClick={decreaseFontSize}
                  className="px-1 py-0.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Decrease font size"
                >
                  <ZoomOut size={12} />
                </button>
                <span className="text-xs text-gray-500 min-w-[2rem] text-center">
                  {fontSize}px
                </span>
                <button
                  onClick={increaseFontSize}
                  className="px-1 py-0.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Increase font size"
                >
                  <ZoomIn size={12} />
                </button>
              </div>

              {/* Theme Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="px-1 py-0.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Change editor theme"
                >
                  <Palette size={12} />
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
                          <div className={`w-3 h-3 rounded ${themeOption.preview}`}></div>
                          <span>{themeOption.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Run Code Button */}
              <button
                onClick={handleRunCode}
                disabled={codeExecutePending || !code.trim()}
                className="flex items-center space-x-1 px-2 py-0.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play size={10} />
                <span>{codeExecutePending ? "Running..." : "Run"}</span>
              </button>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                disabled={codeExecutePending || updateApproachMutation.isPending}
                className="flex items-center space-x-1 px-2 py-0.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw size={10} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Monaco Editor */}
            <div 
              className="flex-1 min-h-0"
              style={{ 
                height: (showInputPanel || showOutputPanel) 
                  ? `${100 - inputOutputHeight}%` 
                  : '100%' 
              }}
            >
              <Editor
                key={`approach-${approach.id}-${selectedLanguage.name}`}
                height="100%"
                language={selectedLanguage.monacoLanguage}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme={editorTheme}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: fontSize,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  lineNumbers: "on",
                  renderWhitespace: "selection",
                  tabSize: 2,
                  insertSpaces: true,
                  folding: true,
                  contextmenu: true,
                  selectOnLineNumbers: true,
                  cursorBlinking: "blink",
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                }}
              />
            </div>

            {/* Input/Output Panel */}
            {(showInputPanel || showOutputPanel) && (
              <div 
                className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
                style={{ height: `${inputOutputHeight}%` }}
              >
                {/* Resizer */}
                <div
                  className="h-1 bg-gray-300 dark:bg-gray-600 cursor-row-resize hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors relative group"
                  onMouseDown={handleInputOutputMouseDown}
                >
                  <div className="absolute inset-x-0 -top-1 -bottom-1 group-hover:bg-blue-500/20"></div>
                </div>

                {/* Input Panel */}
                {showInputPanel && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Input
                      </h3>
                      <button
                        onClick={() => setShowInputPanel(false)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                    <div className="flex-1 p-3">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter input for your program (each input on a new line)..."
                        className="w-full h-full resize-none border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ fontSize: `${fontSize - 2}px` }}
                        disabled={codeExecutePending}
                      />
                    </div>
                  </div>
                )}

                {/* Output Panel */}
                {showOutputPanel && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Output
                      </h3>
                      <div className="flex items-center space-x-2">
                        {output && (
                          <button
                            onClick={handleCopyOutput}
                            className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            {isOutputCopied ? <Check size={12} /> : <Copy size={12} />}
                            <span>{isOutputCopied ? "Copied!" : "Copy"}</span>
                          </button>
                        )}
                        <button
                          onClick={() => setShowOutputPanel(false)}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 p-3">
                      <pre
                        className="w-full h-full text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 whitespace-pre-wrap break-words overflow-auto text-gray-900 dark:text-gray-100"
                        style={{ fontSize: `${fontSize - 2}px` }}
                      >
                        {codeExecutePending
                          ? "🚀 Executing code...\n⏳ Please wait..."
                          : output ||
                            "💻 Run your code to see output here"}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Bar for Code Editor with live character count */}
          <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                {!showInputPanel && (
                  <button
                    onClick={() => {
                      setShowInputPanel(true);
                      setShowOutputPanel(false);
                    }}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <ChevronUp size={12} />
                    <span>Input</span>
                  </button>
                )}
                
                {!showOutputPanel && output && (
                  <button
                    onClick={() => {
                      setShowOutputPanel(true);
                      setShowInputPanel(false);
                    }}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <ChevronUp size={12} />
                    <span>Output</span>
                  </button>
                )}
              </div>

              {/* Right side with approach status and live code character count */}
              <div className="flex items-center space-x-3 text-xs">
                {/* Display Status */}
                <div className={`flex items-center space-x-1 ${displayStatus.color}`}>
                  {displayStatus.type === 'error' && (
                    <AlertCircle size={12} />
                  )}
                  <span>{displayStatus.message}</span>
                </div>
                
                {/* Code Size Separator */}
                <div className="h-3 w-px bg-gray-300 dark:bg-gray-600"></div>
                
                {/* ADDED: Live Code Character Count */}
                <div className={`${getCodeCharacterStatus().color}`}>
                  {getCodeCharacterStatus().displayText}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resizer */}
        <div
          className="w-1 bg-gray-300 dark:bg-gray-600 cursor-col-resize hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors relative group"
          onMouseDown={handlePanelMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20"></div>
        </div>

        {/* Right Panel - Description Editor */}
        <div
          className="bg-white dark:bg-gray-800 flex flex-col"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {/* UPDATED: Description Header with Live Character Count */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Approach Description
            </h3>
            {/* UPDATED: Live Text Character Count */}
            <div className={`text-xs ${getTextCharacterStatus().color}`}>
              {getTextCharacterStatus().displayText}
            </div>
          </div>

          {/* Description Editor */}
          <div className="flex-1 p-4">
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Describe your approach, algorithm, time/space complexity, thought process, etc..."
              className="w-full h-full resize-none border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={updateApproachMutation.isPending}
            />
          </div>
        </div>
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