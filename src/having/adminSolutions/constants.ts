// src/having/adminSolutions/constants.ts

import { API_BASE_URL } from "@/constants";

export const ADMIN_SOLUTIONS_ENDPOINTS = {
  // Solutions APIs
  SUMMARY: `${API_BASE_URL}/admin/solutions/summary`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/solutions/${id}`,
  CREATE_FOR_QUESTION: (questionId: string) => 
    `${API_BASE_URL}/solutions/question/${questionId}`,
  UPDATE: (id: string) => `${API_BASE_URL}/solutions/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/solutions/${id}`,
  
  // Questions metadata
  QUESTIONS_METADATA: `${API_BASE_URL}/questions/metadata`,
  
  // File uploads
  UPLOAD_IMAGE: `${API_BASE_URL}/files/images/solutions`,
  UPLOAD_VISUALIZER: (solutionId: string) => 
    `${API_BASE_URL}/files/visualizers/${solutionId}`,
  GET_VISUALIZER: (fileId: string) => 
    `${API_BASE_URL}/files/visualizers/${fileId}`,
  DELETE_VISUALIZER: (fileId: string) => 
    `${API_BASE_URL}/files/visualizers/${fileId}`,
   GET_VISUALIZER_METADATA: (fileId: string) => 
    `${API_BASE_URL}/files/visualizers/${fileId}/metadata`,
  
  // Link validation
  VALIDATE_YOUTUBE: `${API_BASE_URL}/solutions/validate-youtube`,
  VALIDATE_DRIVE: `${API_BASE_URL}/solutions/validate-drive`,
} as const;

export const ADMIN_SOLUTIONS_QUERY_KEYS = {
  SUMMARY: ['admin-solutions', 'summary'] as const,
  STATS: ['admin-solutions', 'stats'] as const,
  QUESTIONS_METADATA: ['admin-solutions', 'questions-metadata'] as const,
  DETAIL: (id: string) => ['admin-solutions', 'detail', id] as const,
  VISUALIZERS: (solutionId: string) => ['admin-solutions', 'visualizers', solutionId] as const,
} as const;

export const SOLUTION_VALIDATION = {
  CONTENT_MIN_LENGTH: 20,
  CONTENT_MAX_LENGTH: 20000, // ✅ 20k characters for solution statement
  MAX_IMAGES_PER_SOLUTION: 10, // ✅ From backend: app.file.images.max-per-solution=10
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // ✅ 2MB from backend
  MAX_VISUALIZERS_PER_SOLUTION: 2, // ✅ From backend: app.file.html.max-per-solution=2
  MAX_VISUALIZER_SIZE: 500 * 1024, // ✅ 500KB from backend
  CODE_MAX_LENGTH: 10000, // ✅ 10k chars per code template
  MAX_CODE_TEMPLATES: 10, // ✅ Max 10 code templates
  DESCRIPTION_MAX_LENGTH: 200,
} as const;

export const PROGRAMMING_LANGUAGES = [
  { value: "javascript", label: "JavaScript", template: "function solution() {\n    // Your JavaScript solution here\n    return null;\n}" },
  { value: "python", label: "Python", template: "def solution():\n    # Your Python solution here\n    pass" },
  { value: "java", label: "Java", template: "public class Solution {\n    public void solution() {\n        // Your Java solution here\n    }\n}" },
  { value: "cpp", label: "C++", template: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your C++ solution here\n    return 0;\n}" },
  { value: "c", label: "C", template: "#include <stdio.h>\n\nint main() {\n    // Your C solution here\n    return 0;\n}" },
  { value: "typescript", label: "TypeScript", template: "function solution(): void {\n    // Your TypeScript solution here\n}" },
  { value: "go", label: "Go", template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Your Go solution here\n}' },
  { value: "rust", label: "Rust", template: "fn main() {\n    // Your Rust solution here\n}" },
] as const;