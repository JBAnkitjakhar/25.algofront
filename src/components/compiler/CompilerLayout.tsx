// src/components/compiler/CompilerLayout.tsx  

"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  // flushSync,
} from "react";
import { Editor } from "@monaco-editor/react";
import {
  Play,
  RotateCcw,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Palette,
} from "lucide-react";
import {
  Language,
  SUPPORTED_LANGUAGES,
  getDefaultLanguage,
} from "@/lib/compiler/languages";
import { LanguageSelector } from "./LanguageSelector";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import type { editor } from "monaco-editor";

// Monaco Editor Themes
const MONACO_THEMES = [
  { name: "VS Code Light", value: "light", preview: "bg-white text-gray-900" },
  { name: "VS Code Dark", value: "vs-dark", preview: "bg-gray-800 text-white" },
  { name: "Monokai", value: "monokai", preview: "bg-gray-900 text-green-400" },
  {
    name: "Dracula",
    value: "dracula",
    preview: "bg-purple-900 text-purple-200",
  },
  { name: "Cobalt", value: "cobalt", preview: "bg-blue-900 text-blue-200" },
  {
    name: "One Dark",
    value: "one-dark",
    preview: "bg-gray-900 text-orange-400",
  },
  { name: "Eclipse", value: "eclipse", preview: "bg-gray-100 text-gray-800" },
];

// Custom Monaco Themes
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
      { token: "regexp", foreground: "80FFC2" },
      { token: "operator", foreground: "FF9D00" },
      { token: "namespace", foreground: "FF9D00" },
      { token: "type", foreground: "80FFC2" },
      { token: "struct", foreground: "FFEE80" },
      { token: "class", foreground: "FFEE80" },
      { token: "interface", foreground: "FFEE80" },
      { token: "parameter", foreground: "FFCC00" },
      { token: "variable", foreground: "FFFFFF" },
      { token: "function", foreground: "FFEE80" },
    ],
    colors: {
      "editor.background": "#002240",
      "editor.foreground": "#FFFFFF",
      "editorCursor.foreground": "#FFFFFF",
      "editor.lineHighlightBackground": "#1F4662",
      "editorLineNumber.foreground": "#0088FF",
      "editor.selectionBackground": "#316AC5",
      "editor.inactiveSelectionBackground": "#316AC5",
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
      { token: "type", foreground: "61AFEF" },
      { token: "struct", foreground: "E06C75" },
      { token: "class", foreground: "E06C75" },
      { token: "interface", foreground: "E06C75" },
      { token: "parameter", foreground: "D19A66" },
      { token: "variable", foreground: "ABB2BF" },
      { token: "function", foreground: "61AFEF" },
    ],
    colors: {
      "editor.background": "#282C34",
      "editor.foreground": "#ABB2BF",
      "editorCursor.foreground": "#528BFF",
      "editor.lineHighlightBackground": "#2C313C",
      "editorLineNumber.foreground": "#495162",
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
      { token: "variable", foreground: "0000C0" },
      { token: "function", foreground: "000000" },
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.foreground": "#000000",
      "editorCursor.foreground": "#000000",
      "editor.lineHighlightBackground": "#F0F0F0",
      "editorLineNumber.foreground": "#CCCCCC",
      "editor.selectionBackground": "#C0C0C0",
      "editor.inactiveSelectionBackground": "#E0E0E0",
    },
  },
};

export const CompilerLayout: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    getDefaultLanguage()
  );
  const [code, setCode] = useState<string>(getDefaultLanguage().defaultCode); // FIXED: Initialize with default language code
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isOutputCopied, setIsOutputCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(70); // Percentage
  const [inputPanelHeight, setInputPanelHeight] = useState(50); // Percentage of right panel
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"editor" | "input" | "output">(
    "editor"
  );

  // FIXED: Add refs for Monaco Editor management
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isResizingRef = useRef(false);

  const { mutate: executeCode, isPending, error } = useCodeExecution();

  // Local storage keys for persistence
  const getStorageKey = (language: string, type: "code" | "input") =>
    `compiler_${language}_${type}`;

  // FIXED: Debounced resize function to prevent Monaco Editor errors
  const debouncedResizeEditor = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      if (editorRef.current && !isResizingRef.current) {
        try {
          // Use requestAnimationFrame to ensure DOM has updated
          requestAnimationFrame(() => {
            try {
              editorRef.current?.layout();
            } catch (error) {
              console.warn(
                "Monaco Editor layout error (safe to ignore):",
                error
              );
            }
          });
        } catch (error) {
          console.warn("Monaco Editor resize error (safe to ignore):", error);
        }
      }
      isResizingRef.current = false;
    }, 150); // Increased debounce time for stability
  }, []);

  // Handle resizing for left panel (desktop only)
  const handleLeftPanelMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return;
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
        const newWidth = Math.min(Math.max(startWidth + deltaPercent, 25), 85);

        setLeftPanelWidth(newWidth);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";

        // FIXED: Call debounced resize after mouse up
        setTimeout(() => {
          debouncedResizeEditor();
        }, 50);
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [leftPanelWidth, isMobile, debouncedResizeEditor]
  );

  // Handle resizing for input/output panels (desktop only)
  const handleInputOutputMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return;
      e.preventDefault();
      e.stopPropagation();

      const rightPanel = e.currentTarget.parentElement;
      if (!rightPanel) return;

      const startY = e.clientY;
      const startHeight = inputPanelHeight;
      const containerHeight = rightPanel.clientHeight;

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const deltaY = e.clientY - startY;
        const deltaPercent = (deltaY / containerHeight) * 100;
        const newHeight = Math.min(
          Math.max(startHeight + deltaPercent, 20),
          80
        );
        setInputPanelHeight(newHeight);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor = "row-resize";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [inputPanelHeight, isMobile]
  );

  // Check if device is mobile and cleanup
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Cleanup function to remove any lingering event listeners
    const cleanup = () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };

    window.addEventListener("beforeunload", cleanup);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
    };
  }, []);

  // FIXED: Handle window resize to update Monaco Editor
  useEffect(() => {
    const handleWindowResize = () => {
      debouncedResizeEditor();
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [debouncedResizeEditor]);

  // Load saved preferences
  useEffect(() => {
    const savedFontSize = localStorage.getItem("compiler_fontSize");
    const savedTheme = localStorage.getItem("compiler_editorTheme");
    const savedPanelWidth = localStorage.getItem("compiler_panelWidth");
    const savedInputHeight = localStorage.getItem("compiler_inputHeight");

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedTheme) setEditorTheme(savedTheme);
    if (savedPanelWidth) setLeftPanelWidth(parseFloat(savedPanelWidth));
    if (savedInputHeight) setInputPanelHeight(parseFloat(savedInputHeight));
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem("compiler_fontSize", fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("compiler_editorTheme", editorTheme);
  }, [editorTheme]);

  useEffect(() => {
    localStorage.setItem("compiler_panelWidth", leftPanelWidth.toString());
  }, [leftPanelWidth]);

  useEffect(() => {
    localStorage.setItem("compiler_inputHeight", inputPanelHeight.toString());
  }, [inputPanelHeight]);

  // Save code to localStorage when it changes (only if different from default)
  useEffect(() => {
    if (code && code !== selectedLanguage.defaultCode) {
      localStorage.setItem(getStorageKey(selectedLanguage.name, "code"), code);
    }
  }, [code, selectedLanguage.name, selectedLanguage.defaultCode]);

  // Save input to localStorage when it changes
  useEffect(() => {
    if (input) {
      localStorage.setItem(
        getStorageKey(selectedLanguage.name, "input"),
        input
      );
    }
  }, [input, selectedLanguage.name]);

  // Function to check if code requires input
  const doesCodeRequireInput = (codeString: string): boolean => {
    const inputPatterns = [
      // Java
      /Scanner.*nextInt|Scanner.*nextLine|Scanner.*next\(\)|System\.in/i,
      // Python
      /input\s*\(/i,
      // C++
      /cin\s*>>/i,
      // JavaScript (Node.js)
      /readline|process\.stdin/i,
    ];

    return inputPatterns.some((pattern) => pattern.test(codeString));
  };

  // Function to provide helpful error messages
  const getInputRequirementMessage = (language: string): string => {
    const messages: Record<string, string> = {
      Java: "Your Java code uses Scanner or System.in. Please provide input in the Input section.",
      Python:
        "Your Python code uses input(). Please provide input in the Input section.",
      "C++":
        "Your C++ code uses cin. Please provide input in the Input section.",
      JavaScript:
        "Your JavaScript code uses readline or stdin. Please provide input in the Input section.",
    };
    return (
      messages[language] ||
      "Your code appears to require input. Please provide input in the Input section."
    );
  };

  // FIXED: Language change handler
  const handleLanguageChange = (language: Language) => {
    // console.log("🔄 Language change initiated:", language.name);

    // Save current code and input before switching
    if (code !== selectedLanguage.defaultCode) {
      localStorage.setItem(getStorageKey(selectedLanguage.name, "code"), code);
    }
    if (input) {
      localStorage.setItem(
        getStorageKey(selectedLanguage.name, "input"),
        input
      );
    }

    // Load saved code/input for new language
    const savedCode = localStorage.getItem(
      getStorageKey(language.name, "code")
    );
    const savedInput = localStorage.getItem(
      getStorageKey(language.name, "input")
    );

    // CRITICAL: Update language first
    setSelectedLanguage(language);

    // CRITICAL: Use setTimeout to ensure state update happens after re-render
    setTimeout(() => {
      setCode(savedCode || language.defaultCode);
      setInput(savedInput || "");
      setOutput("");
      // console.log("✅ Code updated for:", language.name);
    }, 0);
  };

  const handleRunCode = () => {
    // Check if code requires input but none provided
    if (doesCodeRequireInput(code) && !input.trim()) {
      setOutput(
        `❌ Input Required!\n\n${getInputRequirementMessage(
          selectedLanguage.name
        )}\n\nExample input format:\n- Each input on a new line\n- For numbers: 123\n- For text: Hello World`
      );
      return;
    }

    setOutput("🚀 Connecting to execution server...\n⏳ Please wait...");
    executeCode(
      {
        language: selectedLanguage.pistonName,
        version: selectedLanguage.version,
        code,
        input: input.trim(),
      },
      {
        onSuccess: (response) => {
          // Handle ApiResponse structure correctly
          if (!response.success || !response.data) {
            setOutput("❌ Invalid response from server");
            return;
          }

          // Handle nested response structure with proper typing
          let result = response.data;

          // Check if there's another data layer and unwrap it
          if (result.data && !result.run) {
            result = result.data;
          }

          // Check if the backend indicates failure
          if (result.successful === false && result.errorMessage) {
            setOutput(`❌ Backend Error: ${result.errorMessage}`);
            return;
          }

          let outputText = "";

          // Show compilation output if present
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

          // Check if run exists and show runtime output
          if (result.run && typeof result.run === "object") {
            if (result.run.stderr) {
              outputText += `🚨 Runtime Error:\n${result.run.stderr}\n`;

              // Add helpful hints for common errors
              if (result.run.stderr.includes("NoSuchElementException")) {
                outputText += `\n💡 Hint: This error usually means your program expected more input than provided.\n`;
              } else if (result.run.stderr.includes("InputMismatchException")) {
                outputText += `\n💡 Hint: Input type mismatch. Check if you're providing the correct data type.\n`;
              } else if (
                result.run.stderr.includes("ArrayIndexOutOfBoundsException")
              ) {
                outputText += `\n💡 Hint: Array index error. Check your array bounds.\n`;
              } else if (result.run.stderr.includes("NullPointerException")) {
                outputText += `\n💡 Hint: Null pointer error. Initialize your variables before using them.\n`;
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
            // Handle case where run is still missing
            outputText += `❌ Could not find execution results\n`;
            outputText += `Available properties: ${Object.keys(result).join(
              ", "
            )}`;
          }

          setOutput(outputText || "✅ Program completed with no output");
        },
        onError: (error: Error) => {
          console.error("Code execution error:", error);

          let errorMessage = `❌ Execution Error: ${error.message}\n\n`;

          if (error.message.includes("timeout")) {
            errorMessage += `🕐 Possible causes:\n- Infinite loop in your code\n- Code taking too long to execute\n- Server overload\n\n💡 Try:\n- Check for infinite loops\n- Optimize your algorithm\n- Try again in a moment`;
          } else if (
            error.message.includes("network") ||
            error.message.includes("fetch")
          ) {
            errorMessage += `🌐 Network issue:\n- Check your internet connection\n- Piston API server may be down\n- Try again in a moment`;
          } else if (error.message.includes("Cannot read properties")) {
            errorMessage += `🔧 Response parsing error:\n- Backend returned unexpected response format\n- Check browser console for details\n- Contact support if issue persists`;
          } else {
            errorMessage += `🔧 This could be due to:\n- Network connectivity issues\n- Backend server issues\n- Invalid response format\n\n💡 Please try again in a moment.\nCheck browser console for technical details.`;
          }

          setOutput(errorMessage);
        },
      }
    );
  };

  const handleReset = () => {
    setCode(selectedLanguage.defaultCode);
    setInput("");
    setOutput("");
    // Clear localStorage
    localStorage.removeItem(getStorageKey(selectedLanguage.name, "code"));
    localStorage.removeItem(getStorageKey(selectedLanguage.name, "input"));
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${selectedLanguage.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setIsOutputCopied(true);
      setTimeout(() => setIsOutputCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy output:", err);
    }
  };

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12));
  };

  // FIXED: Monaco Editor mount handler with proper error handling
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    try {
      editorRef.current = editor;

      // Initial layout
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

  // FIXED: Monaco Editor beforeMount with proper error handling
  const handleEditorWillMount = (monaco: typeof import("monaco-editor")) => {
    try {
      Object.entries(customThemes).forEach(([name, theme]) => {
        try {
          monaco.editor.defineTheme(name, theme);
        } catch (error) {
          console.warn(
            `Failed to define theme ${name} (safe to ignore):`,
            error
          );
        }
      });
    } catch (error) {
      console.warn("Failed to define custom themes (safe to ignore):", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Responsive Header */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
            Code Compiler
          </h1>
          <div className="hidden sm:block">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Mobile Language Selector */}
          <div className="sm:hidden">
            <select
              value={selectedLanguage.name}
              onChange={(e) => {
                const language = SUPPORTED_LANGUAGES.find(
                  (lang) => lang.name === e.target.value
                );
                if (language) handleLanguageChange(language);
              }}
              disabled={isPending}
              className="text-xs px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {SUPPORTED_LANGUAGES.map((language) => (
                <option key={language.name} value={language.name}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Font Size Controls */}
            <div className="flex items-center space-x-1 mr-2">
              <button
                onClick={decreaseFontSize}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Decrease font size"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs text-gray-500 min-w-[2rem] text-center">
                {fontSize}px
              </span>
              <button
                onClick={increaseFontSize}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Increase font size"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {/* Theme Selector */}
            <div className="relative mr-2">
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Change editor theme"
              >
                <Palette size={14} />
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
          </div>

          <button
            onClick={handleRunCode}
            disabled={isPending || !code.trim()}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play size={12} className="sm:hidden" />
            <Play size={14} className="hidden sm:block" />
            <span className="hidden sm:inline">
              {isPending ? "Running..." : "Run"}
            </span>
          </button>

          <button
            onClick={handleReset}
            disabled={isPending}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isPending || !code.trim()}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      {isMobile && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {/* Tab Navigation */}
          <div className="flex">
            <button
              onClick={() => setMobileView("editor")}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                mobileView === "editor"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setMobileView("input")}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                mobileView === "input"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Input
            </button>
            <button
              onClick={() => setMobileView("output")}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                mobileView === "output"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Output
            </button>
          </div>

          {/* Mobile Controls Row */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {/* Font Size Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={decreaseFontSize}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Decrease font size"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs text-gray-500 min-w-[2.5rem] text-center">
                {fontSize}px
              </span>
              <button
                onClick={increaseFontSize}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Increase font size"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Change editor theme"
              >
                <Palette size={16} />
              </button>

              {showThemeSelector && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[150px] max-h-60 overflow-y-auto">
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

            {/* Reset and Download Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleReset}
                disabled={isPending}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reset code"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={handleDownload}
                disabled={isPending || !code.trim()}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download code"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {isMobile ? (
        /* Mobile Layout - Stacked Views */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile Editor View */}
          {mobileView === "editor" && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 min-h-0">
                <Editor
                  key={`mobile-${selectedLanguage.name}`} // CRITICAL: More specific key
                  height="100%"
                  language={selectedLanguage.monacoLanguage}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme={editorTheme}
                  beforeMount={handleEditorWillMount}
                  onMount={(editor) => {
                    handleEditorDidMount(editor);
                    // console.log(
                    //   "📝 Mobile Editor mounted for:",
                    //   selectedLanguage.name,
                    //   "with code:",
                    //   code.substring(0, 50) + "..."
                    // );
                  }}
                  options={{
                    fontSize: Math.max(fontSize, 12),
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: "on",
                    lineNumbers: "on",
                    renderWhitespace: "none",
                    tabSize: 2,
                    insertSpaces: true,
                    folding: true,
                    contextmenu: false,
                    selectOnLineNumbers: true,
                    glyphMargin: false,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                  }}
                />
              </div>
            </div>
          )}

          {/* Mobile Input View */}
          {mobileView === "input" && (
            <div className="flex-1 flex flex-col p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Input
              </h3>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input for your program (each input on a new line)..."
                className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontSize: `${Math.max(fontSize, 12)}px` }}
                disabled={isPending}
              />
            </div>
          )}

          {/* Mobile Output View */}
          {mobileView === "output" && (
            <div className="flex-1 flex flex-col p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Output
                </h3>
                {output && (
                  <button
                    onClick={handleCopyOutput}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {isOutputCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{isOutputCopied ? "Copied!" : "Copy"}</span>
                  </button>
                )}
              </div>
              <pre
                className="flex-1 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 whitespace-pre-wrap break-words overflow-auto text-gray-900 dark:text-gray-100"
                style={{ fontSize: `${Math.max(fontSize, 12)}px` }}
              >
                {isPending
                  ? "🚀 Executing code...\n⏳ This may take up to 30 seconds\n\n🔄 Processing your request..."
                  : output ||
                    "💻 Run your code to see output here\n\n💡 Tip: Use the input section if your code needs user input"}
              </pre>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout - Side by Side */
        <div className="flex-1 flex relative">
          {/* Code Editor Panel */}
          <div
            className="flex flex-col"
            style={{ width: `${leftPanelWidth}%` }}
          >
            <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Code Editor
              </h3>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                key={`desktop-${selectedLanguage.name}`} // CRITICAL: More specific key
                height="100%"
                language={selectedLanguage.monacoLanguage}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme={editorTheme}
                beforeMount={handleEditorWillMount}
                onMount={(editor) => {
                  handleEditorDidMount(editor);
                  // console.log(
                  //   "🖥️ Desktop Editor mounted for:",
                  //   selectedLanguage.name,
                  //   "with code:",
                  //   code.substring(0, 50) + "..."
                  // );
                }}
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
          </div>

          {/* Resizer */}
          <div
            className="w-1 bg-gray-300 dark:bg-gray-600 cursor-col-resize hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors relative group"
            onMouseDown={handleLeftPanelMouseDown}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20"></div>
          </div>

          {/* Input & Output Panel */}
          <div
            className="flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700"
            style={{ width: `${100 - leftPanelWidth}%` }}
          >
            {/* Input Section */}
            <div
              className="flex flex-col min-h-0"
              style={{ height: `${inputPanelHeight}%` }}
            >
              <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Input
                </h3>
              </div>
              <div className="flex-1 p-2 min-h-0">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter input for your program (each input on a new line)..."
                  className="w-full h-full resize-none border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-auto"
                  style={{ fontSize: `${fontSize - 2}px` }}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Input/Output Resizer */}
            <div
              className="h-1 bg-gray-300 dark:bg-gray-600 cursor-row-resize hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors relative group"
              onMouseDown={handleInputOutputMouseDown}
            >
              <div className="absolute inset-x-0 -top-1 -bottom-1 group-hover:bg-blue-500/20"></div>
            </div>

            {/* Output Section */}
            <div
              className="flex flex-col min-h-0"
              style={{ height: `${100 - inputPanelHeight}%` }}
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Output
                </h3>
                {output && (
                  <button
                    onClick={handleCopyOutput}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {isOutputCopied ? <Check size={10} /> : <Copy size={10} />}
                    <span>{isOutputCopied ? "Copied!" : "Copy"}</span>
                  </button>
                )}
              </div>
              <div className="flex-1 p-2 min-h-0">
                <pre
                  className="w-full h-full text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 whitespace-pre-wrap break-words overflow-auto text-gray-900 dark:text-gray-100"
                  style={{ fontSize: `${fontSize - 2}px` }}
                >
                  {isPending
                    ? "🚀 Executing code...\n⏳ This may take up to 30 seconds\n\n🔄 Processing your request..."
                    : output ||
                      "💻 Run your code to see output here\n\n💡 Tip: Use the input section if your code needs user input"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="px-3 py-2 bg-red-100 dark:bg-red-900 border-t border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">
            Error: {error.message}
          </p>
        </div>
      )}

      {/* Click outside to close theme selector */}
      {showThemeSelector && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowThemeSelector(false)}
        />
      )}
    </div>
  );
};
