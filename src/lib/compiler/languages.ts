// src/lib/compiler/languages.ts

export interface Language {
  name: string;
  pistonName: string;
  version: string;
  monacoLanguage: string;
  extension: string;
  defaultCode: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    name: "Python",
    pistonName: "python",
    version: "3.10.0",
    monacoLanguage: "python",
    extension: "py",
    defaultCode: `# Write your code here...`,
  },
  {
    name: "Java",
    pistonName: "java",
    version: "15.0.2",
    monacoLanguage: "java",
    extension: "java",
    defaultCode: `// Write your code here...}`,
  },
  {
    name: "C++",
    pistonName: "cpp",
    version: "10.2.0",
    monacoLanguage: "cpp",
    extension: "cpp",
    defaultCode: `// Write your code here...}`,
  },
  {
    name: "JavaScript",
    pistonName: "javascript",
    version: "18.15.0",
    monacoLanguage: "javascript",
    extension: "js",
    defaultCode: `// Write your code here...`,
  },
  {
    name: "C",
    pistonName: "c",
    version: "10.2.0",
    monacoLanguage: "c",
    extension: "c",
    defaultCode: `// Write your code here...`,
  },
  {
    name: "Go",
    pistonName: "go",
    version: "1.16.2",
    monacoLanguage: "go",
    extension: "go",
    defaultCode: `// Write your code here...`,
  },
  {
    name: "Rust",
    pistonName: "rust",
    version: "1.68.2",
    monacoLanguage: "rust",
    extension: "rs",
    defaultCode: `// Write your code here...`,
  },
  {
    name: "TypeScript",
    pistonName: "typescript",
    version: "5.0.3",
    monacoLanguage: "typescript",
    extension: "ts",
    defaultCode: `// Write your code here...`,
  }
];

export const getLanguageByName = (name: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.name === name);
};

export const getDefaultLanguage = (): Language => {
  return SUPPORTED_LANGUAGES[0]; // Python as default
};