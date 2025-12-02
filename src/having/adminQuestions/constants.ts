// src/having/adminquestions/constants.ts

import { API_BASE_URL } from "@/constants";

export const ADMIN_QUESTIONS_ENDPOINTS = {
  // Questions APIs
  SUMMARY: `${API_BASE_URL}/admin/questions/summary`,
  CREATE: `${API_BASE_URL}/questions`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/questions/${id}`,
  UPDATE: (id: string) => `${API_BASE_URL}/questions/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/questions/${id}`,
  
  // Categories metadata
  CATEGORIES_METADATA: `${API_BASE_URL}/categories/metadata`,
  
  // File upload
  UPLOAD_IMAGE: `${API_BASE_URL}/files/images/questions`,
} as const;

export const ADMIN_QUESTIONS_QUERY_KEYS = {
  // Questions summary list
  SUMMARY: ['admin-questions', 'summary'] as const,
  
  // Categories metadata (for dropdown)
  CATEGORIES: ['admin-questions', 'categories'] as const,
  
  // Specific question detail (for editing)
  DETAIL: (id: string) => ['admin-questions', 'detail', id] as const,
} as const;

export const QUESTION_VALIDATION = {
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 200,
  STATEMENT_MIN_LENGTH: 20,
  STATEMENT_MAX_LENGTH: 15000, // ✅ 15k characters  
  MAX_IMAGES_PER_QUESTION: 5,
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB per image
  MAX_CODE_SNIPPETS: 10,
  CODE_SNIPPET_MAX_LENGTH: 2000, // ✅ NEW: 2k chars per template
} as const;

export const PROGRAMMING_LANGUAGES = [
  {
    value: "javascript",
    label: "JavaScript",
    template: "function solution() {\n    // Your JavaScript solution here\n    return null;\n}",
  },
  {
    value: "python",
    label: "Python",
    template: "def solution():\n    # Your Python solution here\n    pass",
  },
  {
    value: "java",
    label: "Java",
    template: "public class Solution {\n    public void solution() {\n        // Your Java solution here\n    }\n}",
  },
  {
    value: "cpp",
    label: "C++",
    template: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your C++ solution here\n    return 0;\n}",
  },
  {
    value: "c",
    label: "C",
    template: "#include <stdio.h>\n\nint main() {\n    // Your C solution here\n    return 0;\n}",
  },
  {
    value: "typescript",
    label: "TypeScript",
    template: "function solution(): void {\n    // Your TypeScript solution here\n}",
  },
  {
    value: "go",
    label: "Go",
    template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Your Go solution here\n}',
  },
  {
    value: "rust",
    label: "Rust",
    template: "fn main() {\n    // Your Rust solution here\n}",
  },
] as const;