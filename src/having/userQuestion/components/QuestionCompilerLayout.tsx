// src/having/userQuestion/components/QuestionCompilerLayout.tsx - WITH RESIZABLE INPUT/OUTPUT

"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
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
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Language, SUPPORTED_LANGUAGES } from "@/lib/compiler/languages";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import {
  useApproachesByQuestion,
  useCreateApproach,
} from "@/having/userQuestion/hooks";
import type { QuestionDetail } from "@/having/userQuestion/types";
import type { editor } from "monaco-editor";
import toast from "react-hot-toast";

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

// Custom Monaco Themes (same as before - keeping them for brevity)
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

interface QuestionCompilerLayoutProps {
  question: QuestionDetail;
}

export function QuestionCompilerLayout({
  question,
}: QuestionCompilerLayoutProps) {
  const getStorageKey = useCallback(
    (language: string, type: "code" | "input") =>
      `question_${question.id}_${language}_${type}`,
    [question.id]
  );

  const defaultLanguage = useMemo(() => {
    if (question.codeSnippets && question.codeSnippets.length > 0) {
      const javaSnippet = question.codeSnippets.find(
        (s) => s.language.toLowerCase() === "java"
      );
      if (javaSnippet) {
        return (
          SUPPORTED_LANGUAGES.find((lang) => lang.name === "Java") ||
          SUPPORTED_LANGUAGES[0]
        );
      }
      const firstSnippet = question.codeSnippets[0];
      return (
        SUPPORTED_LANGUAGES.find(
          (lang) =>
            lang.name.toLowerCase() === firstSnippet.language.toLowerCase()
        ) || SUPPORTED_LANGUAGES[0]
      );
    }
    return (
      SUPPORTED_LANGUAGES.find((lang) => lang.name === "Java") ||
      SUPPORTED_LANGUAGES[0]
    );
  }, [question.codeSnippets]);

  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>(defaultLanguage);
  const [code, setCode] = useState<string>("");
  const [starterCode, setStarterCode] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isOutputCopied, setIsOutputCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [showOutput, setShowOutput] = useState(true);
  const [inputOutputHeight, setInputOutputHeight] = useState(35); // ✅ Percentage of total height
  const [inputPanelWidth, setInputPanelWidth] = useState(50); // ✅ Percentage of input/output section

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isResizingRef = useRef(false);

  const { mutate: executeCode, isPending } = useCodeExecution();
  const createApproachMutation = useCreateApproach();
  const { data: approaches } = useApproachesByQuestion(question.id);
  
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
    }, 150);
  }, []);

  useEffect(() => {
    const handleWindowResize = () => {
      debouncedResizeEditor();
    };

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [debouncedResizeEditor]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem(`question_compiler_fontSize`);
    const savedTheme = localStorage.getItem(`question_compiler_editorTheme`);
    const savedShowInput = localStorage.getItem(`question_compiler_showInput`);
    const savedShowOutput = localStorage.getItem(
      `question_compiler_showOutput`
    );
    const savedIOHeight = localStorage.getItem(`question_compiler_ioHeight`);
    const savedInputWidth = localStorage.getItem(
      `question_compiler_inputWidth`
    );

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedTheme) setEditorTheme(savedTheme);
    if (savedShowInput !== null) setShowInput(savedShowInput === "true");
    if (savedShowOutput !== null) setShowOutput(savedShowOutput === "true");
    if (savedIOHeight) setInputOutputHeight(parseFloat(savedIOHeight));
    if (savedInputWidth) setInputPanelWidth(parseFloat(savedInputWidth));
  }, []);

  useEffect(() => {
    localStorage.setItem(`question_compiler_fontSize`, fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(`question_compiler_editorTheme`, editorTheme);
  }, [editorTheme]);

  useEffect(() => {
    localStorage.setItem(`question_compiler_showInput`, showInput.toString());
  }, [showInput]);

  useEffect(() => {
    localStorage.setItem(`question_compiler_showOutput`, showOutput.toString());
  }, [showOutput]);

  useEffect(() => {
    localStorage.setItem(
      `question_compiler_ioHeight`,
      inputOutputHeight.toString()
    );
  }, [inputOutputHeight]);

  useEffect(() => {
    localStorage.setItem(
      `question_compiler_inputWidth`,
      inputPanelWidth.toString()
    );
  }, [inputPanelWidth]);

  useEffect(() => {
    let codeToLoad = "";

    if (question.codeSnippets && question.codeSnippets.length > 0) {
      const snippet = question.codeSnippets.find(
        (s) => s.language.toLowerCase() === selectedLanguage.name.toLowerCase()
      );
      if (snippet) {
        codeToLoad = snippet.code;
      }
    }

    if (!codeToLoad) {
      codeToLoad = selectedLanguage.defaultCode;
    }

    setStarterCode(codeToLoad);

    const savedCode = localStorage.getItem(
      getStorageKey(selectedLanguage.name, "code")
    );
    const savedInput = localStorage.getItem(
      getStorageKey(selectedLanguage.name, "input")
    );

    setCode(savedCode || codeToLoad);
    setInput(savedInput || "");
    setOutput("");
  }, [selectedLanguage, question.codeSnippets, getStorageKey]);

  useEffect(() => {
    if (code && code !== starterCode) {
      localStorage.setItem(getStorageKey(selectedLanguage.name, "code"), code);
    }
  }, [code, selectedLanguage.name, starterCode, getStorageKey]);

  useEffect(() => {
    if (input) {
      localStorage.setItem(
        getStorageKey(selectedLanguage.name, "input"),
        input
      );
    }
  }, [input, selectedLanguage.name, getStorageKey]);

  const handleLanguageChange = (language: Language) => {
    if (code !== starterCode) {
      localStorage.setItem(getStorageKey(selectedLanguage.name, "code"), code);
    }
    if (input) {
      localStorage.setItem(
        getStorageKey(selectedLanguage.name, "input"),
        input
      );
    }

    setSelectedLanguage(language);
  };

  // ✅ Handle resizing for editor/input-output sections (vertical)
  const handleEditorOutputMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startY = e.clientY;
      const startHeight = inputOutputHeight;
      const containerHeight = window.innerHeight - 100;

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const deltaY = e.clientY - startY;
        const deltaPercent = (deltaY / containerHeight) * 100;
        const newHeight = Math.min(
          Math.max(startHeight - deltaPercent, 15),
          60
        );
        setInputOutputHeight(newHeight);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        setTimeout(() => {
          debouncedResizeEditor();
        }, 50);
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor = "row-resize";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [inputOutputHeight, debouncedResizeEditor]
  );

  // ✅ Handle resizing for input/output panels (horizontal)
  const handleInputOutputMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = inputPanelWidth;
      const containerWidth = window.innerWidth;

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const deltaX = e.clientX - startX;
        const deltaPercent = (deltaX / containerWidth) * 100;
        const newWidth = Math.min(Math.max(startWidth + deltaPercent, 25), 75);
        setInputPanelWidth(newWidth);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [inputPanelWidth]
  );

  const doesCodeRequireInput = (codeString: string): boolean => {
    const inputPatterns = [
      /Scanner.*nextInt|Scanner.*nextLine|Scanner.*next\(\)|System\.in/i,
      /input\s*\(/i,
      /cin\s*>>/i,
      /readline|process\.stdin/i,
    ];
    return inputPatterns.some((pattern) => pattern.test(codeString));
  };

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

  const handleRunCode = () => {
    if (doesCodeRequireInput(code) && !input.trim()) {
      setOutput(
        `❌ Input Required!\n\n${getInputRequirementMessage(
          selectedLanguage.name
        )}\n\nExample input format:\n- Each input on a new line\n- For numbers: 123\n- For text: Hello World`
      );
      setShowOutput(true);
      return;
    }

    setOutput("🚀 Connecting to execution server...\n⏳ Please wait...");
    setShowOutput(true);
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
          } else {
            errorMessage += `🔧 This could be due to:\n- Network connectivity issues\n- Backend server issues\n- Invalid response format\n\n💡 Please try again in a moment.\nCheck browser console for technical details.`;
          }

          setOutput(errorMessage);
        },
      }
    );
  };

  const handleReset = () => {
    setCode(starterCode);
    setInput("");
    setOutput("");
    localStorage.removeItem(getStorageKey(selectedLanguage.name, "code"));
    localStorage.removeItem(getStorageKey(selectedLanguage.name, "input"));
  };

  const handleSubmit = () => {
    // console.log("🔵 Submit clicked");

    if (!code.trim()) {
      toast.error("Please write some code before submitting");
      return;
    }

    // ✅ Check approach limit before submitting
    if (approaches && approaches.length >= 3) {
      toast.error(
        "Maximum 3 approaches allowed per question. Please delete an existing approach first."
      );
      return;
    }

    const languageMap: Record<string, string> = {
      Java: "java",
      Python: "python",
      JavaScript: "javascript",
      "C++": "cpp",
      C: "c",
      "C#": "csharp",
      Go: "go",
      Rust: "rust",
      Kotlin: "kotlin",
      Swift: "swift",
      Ruby: "ruby",
      PHP: "php",
      TypeScript: "typescript",
    };

    const backendLanguage =
      languageMap[selectedLanguage.name] || selectedLanguage.name.toLowerCase();

    const payload = {
      textContent:
        "Click edit to add your approach description and explanation...",
      codeContent: code,
      codeLanguage: backendLanguage,
    };

    createApproachMutation.mutate(
      { questionId: question.id, data: payload },
      {
        onSuccess: () => {
          toast.success("Approach submitted successfully!");
        },
      }
    );
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${question.title.replace(/[^a-z0-9]/gi, "_")}.${
      selectedLanguage.extension
    }`;
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

  // ✅ Calculate editor height based on which panels are open
  const calculateEditorHeight = () => {
    if (!showInput && !showOutput) return "100%";
    return `${100 - inputOutputHeight}%`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <select
            value={selectedLanguage.name}
            onChange={(e) => {
              const language = SUPPORTED_LANGUAGES.find(
                (lang) => lang.name === e.target.value
              );
              if (language) handleLanguageChange(language);
            }}
            disabled={isPending}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <option key={language.name} value={language.name}>
                {language.name}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-1">
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

          <div className="relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Change editor theme"
            >
              <Palette size={14} />
            </button>

            {showThemeSelector && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[150px]">
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

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            disabled={isPending}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isPending || !code.trim()}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={14} />
            <span>Download</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={createApproachMutation.isPending || !code.trim()}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload size={14} />
            <span>
              {createApproachMutation.isPending ? "Submitting..." : "Submit"}
            </span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isPending || !code.trim()}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play size={14} />
            <span>{isPending ? "Running..." : "Run"}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Code Editor + Toggleable Input/Output */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Code Editor Section */}
        <div
          className="flex flex-col"
          style={{ height: calculateEditorHeight() }}
        >
          <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Code Editor
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              key={`question-${question.id}-${selectedLanguage.name}`}
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
        </div>

        {/* ✅ Resizer between Editor and Input/Output */}
        {(showInput || showOutput) && (
          <div
            className="h-1 bg-gray-300 dark:bg-gray-600 cursor-row-resize hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors relative group"
            onMouseDown={handleEditorOutputMouseDown}
          >
            <div className="absolute inset-x-0 -top-1 -bottom-1 group-hover:bg-blue-500/20"></div>
          </div>
        )}

        {/* Input/Output Section (Toggleable & Resizable) */}
        {(showInput || showOutput) && (
          <div
            className="flex bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
            style={{ height: `${inputOutputHeight}%` }}
          >
            {/* Input Section */}
            {showInput && (
              <div
                className="flex flex-col min-h-0"
                style={{ width: showOutput ? `${inputPanelWidth}%` : "100%" }}
              >
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Input
                  </h3>
                  <button
                    onClick={() => setShowInput(false)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Hide input panel"
                  >
                    <ChevronDown size={14} />
                  </button>
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
            )}

            {/* ✅ Resizer between Input and Output (only if both are visible) */}
            {showInput && showOutput && (
              <div
                className="w-1 bg-gray-300 dark:bg-gray-600 cursor-col-resize hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors relative group"
                onMouseDown={handleInputOutputMouseDown}
              >
                <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20"></div>
              </div>
            )}

            {/* Output Section */}
            {showOutput && (
              <div
                className="flex flex-col min-h-0"
                style={{
                  width: showInput ? `${100 - inputPanelWidth}%` : "100%",
                }}
              >
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Output
                  </h3>
                  <div className="flex items-center space-x-2">
                    {output && (
                      <button
                        onClick={handleCopyOutput}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        {isOutputCopied ? (
                          <Check size={10} />
                        ) : (
                          <Copy size={10} />
                        )}
                        <span>{isOutputCopied ? "Copied!" : "Copy"}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowOutput(false)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Hide output panel"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
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
            )}
          </div>
        )}

        {/* Show Panel Buttons (when panels are hidden) */}
        {(!showInput || !showOutput) && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {!showInput && (
              <button
                onClick={() => setShowInput(true)}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronUp size={12} />
                <span>Show Input</span>
              </button>
            )}
            {!showOutput && (
              <button
                onClick={() => setShowOutput(true)}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronUp size={12} />
                <span>Show Output</span>
              </button>
            )}
          </div>
        )}
      </div>

      {showThemeSelector && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowThemeSelector(false)}
        />
      )}
    </div>
  );
}
