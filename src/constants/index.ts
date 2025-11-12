// src/constants/index.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  GOOGLE_LOGIN: `${API_BASE_URL}/oauth2/authorization/google`,
  GITHUB_LOGIN: `${API_BASE_URL}/oauth2/authorization/github`,
  GET_ME: `${API_BASE_URL}/auth/me`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
} as const;

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  STATS: `${API_BASE_URL}/admin/stats`,
  SETTINGS: `${API_BASE_URL}/admin/settings`,
  PROGRESS: `${API_BASE_URL}/admin/progress`,
  HEALTH: `${API_BASE_URL}/admin/health`,
  METRICS: `${API_BASE_URL}/admin/metrics`,
  // User management endpoints
  USERS: `${API_BASE_URL}/admin/users`,
  USER_BY_ID: (id: string) => `${API_BASE_URL}/admin/users/${id}`,
  USERS_BY_ROLE: (role: string) => `${API_BASE_URL}/admin/users/role/${role}`,
  UPDATE_USER_ROLE: (id: string) => `${API_BASE_URL}/admin/users/${id}/role`,
  USER_PERMISSIONS: `${API_BASE_URL}/admin/users/permissions`,
  GLOBAL_PROGRESS: `${API_BASE_URL}/admin/progress/global`,
} as const;

// Category management endpoints
export const CATEGORY_ENDPOINTS = {
  LIST: `${API_BASE_URL}/categories`,
  WITH_PROGRESS: `${API_BASE_URL}/categories/with-progress`, // NEW: Optimized endpoint
  CREATE: `${API_BASE_URL}/categories`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/categories/${id}`,
  UPDATE: (id: string) => `${API_BASE_URL}/categories/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/categories/${id}`,
  GET_STATS: (id: string) => `${API_BASE_URL}/categories/${id}/stats`,
  GET_PROGRESS: (id: string) => `${API_BASE_URL}/categories/${id}/progress`,
} as const;

// Question management endpoints
export const QUESTION_ENDPOINTS = {
  LIST: `${API_BASE_URL}/questions`,
  SUMMARY: `${API_BASE_URL}/questions/summary`, // NEW: Optimized endpoint with user progress
  CREATE: `${API_BASE_URL}/questions`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/questions/${id}`,
  UPDATE: (id: string) => `${API_BASE_URL}/questions/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/questions/${id}`,
  SEARCH: `${API_BASE_URL}/questions/search`,
  STATS: `${API_BASE_URL}/questions/stats`,
  GET_PROGRESS: (id: string) => `${API_BASE_URL}/questions/${id}/progress`,
  UPDATE_PROGRESS: (id: string) => `${API_BASE_URL}/questions/${id}/progress`,
} as const;

// USER PROGRESS ENDPOINTS - NEW
export const USER_PROGRESS_ENDPOINTS = {
  CURRENT_USER_STATS: `${API_BASE_URL}/users/progress`,
  CURRENT_USER_RECENT: `${API_BASE_URL}/users/progress/recent`,
  USER_STATS: (userId: string) => `${API_BASE_URL}/users/${userId}/progress`,
  USER_ALL_PROGRESS: (userId: string) =>
    `${API_BASE_URL}/users/${userId}/progress/all`,
} as const;

// APPROACH ENDPOINTS - NEW
export const APPROACH_ENDPOINTS = {
  GET_BY_ID: (id: string) => `${API_BASE_URL}/approaches/${id}`,
  BY_QUESTION: (questionId: string) =>
    `${API_BASE_URL}/approaches/question/${questionId}`,
  CREATE_FOR_QUESTION: (questionId: string) =>
    `${API_BASE_URL}/approaches/question/${questionId}`,
  UPDATE: (id: string) => `${API_BASE_URL}/approaches/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/approaches/${id}`,
  MY_APPROACHES: `${API_BASE_URL}/approaches/my-approaches`,
  MY_RECENT: `${API_BASE_URL}/approaches/my-approaches/recent`,
  MY_STATS: `${API_BASE_URL}/approaches/my-stats`,
  SIZE_USAGE: (questionId: string) =>
    `${API_BASE_URL}/approaches/question/${questionId}/size-usage`,
  CHECK_LIMITS: (questionId: string) =>
    `${API_BASE_URL}/approaches/question/${questionId}/check-limits`,
  CHECK_SIZE: (questionId: string) =>
    `${API_BASE_URL}/approaches/question/${questionId}/check-size`,
} as const;

// Solution management endpoints
export const SOLUTION_ENDPOINTS = {
  LIST: `${API_BASE_URL}/solutions`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/solutions/${id}`,
  BY_QUESTION: (questionId: string) =>
    `${API_BASE_URL}/solutions/question/${questionId}`,
  CREATE_FOR_QUESTION: (questionId: string) =>
    `${API_BASE_URL}/solutions/question/${questionId}`,
  UPDATE: (id: string) => `${API_BASE_URL}/solutions/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/solutions/${id}`,
  STATS: `${API_BASE_URL}/solutions/stats`,
  WITH_IMAGES: `${API_BASE_URL}/solutions/with-images`,
  WITH_VISUALIZERS: `${API_BASE_URL}/solutions/with-visualizers`,
  WITH_YOUTUBE: `${API_BASE_URL}/solutions/with-youtube`,
  BY_CREATOR: (creatorId: string) =>
    `${API_BASE_URL}/solutions/creator/${creatorId}`,
  // Link validation
  VALIDATE_YOUTUBE: `${API_BASE_URL}/solutions/validate-youtube`,
  VALIDATE_DRIVE: `${API_BASE_URL}/solutions/validate-drive`,
  // Image management
  ADD_IMAGE: (id: string) => `${API_BASE_URL}/solutions/${id}/images`,
  REMOVE_IMAGE: (id: string) => `${API_BASE_URL}/solutions/${id}/images`,
  // Visualizer management
  ADD_VISUALIZER: (id: string) => `${API_BASE_URL}/solutions/${id}/visualizers`,
  REMOVE_VISUALIZER: (id: string) =>
    `${API_BASE_URL}/solutions/${id}/visualizers`,
} as const;

// Compiler endpoints
export const COMPILER_ENDPOINTS = {
  EXECUTE: `${API_BASE_URL}/compiler/execute`,
  RUNTIMES: `${API_BASE_URL}/compiler/runtimes`,
  LANGUAGES: `${API_BASE_URL}/compiler/languages`,
  HEALTH: `${API_BASE_URL}/compiler/health`,
} as const;

// File upload endpoints
export const FILE_ENDPOINTS = {
  CONFIG: `${API_BASE_URL}/files/config`,
  UPLOAD_QUESTION_IMAGE: `${API_BASE_URL}/files/images/questions`,
  UPLOAD_SOLUTION_IMAGE: `${API_BASE_URL}/files/images/solutions`,
  DELETE_IMAGE: `${API_BASE_URL}/files/images`,
  HEALTH_CHECK: `${API_BASE_URL}/files/health/cloudinary`,
  // Visualizer endpoints
  UPLOAD_VISUALIZER: (solutionId: string) =>
    `${API_BASE_URL}/files/visualizers/${solutionId}`,
  GET_VISUALIZER: (fileId: string) =>
    `${API_BASE_URL}/files/visualizers/${fileId}`,
  DELETE_VISUALIZER: (fileId: string) =>
    `${API_BASE_URL}/files/visualizers/${fileId}`,
  VISUALIZERS_BY_SOLUTION: (solutionId: string) =>
    `${API_BASE_URL}/files/solutions/${solutionId}/visualizers`,
} as const;

// Courses endpoints
export const COURSES_ENDPOINTS = {
  // Admin endpoints
  CREATE_TOPIC: `${API_BASE_URL}/courses/topics`,
  UPDATE_TOPIC: (topicId: string) =>
    `${API_BASE_URL}/courses/topics/${topicId}`,
  DELETE_TOPIC: (topicId: string) =>
    `${API_BASE_URL}/courses/topics/${topicId}`,
  CREATE_DOC: `${API_BASE_URL}/courses/docs`,
  UPDATE_DOC: (docId: string) => `${API_BASE_URL}/courses/docs/${docId}`,
  DELETE_DOC: (docId: string) => `${API_BASE_URL}/courses/docs/${docId}`,
  UPLOAD_IMAGE: `${API_BASE_URL}/courses/images`,
  DELETE_IMAGE: `${API_BASE_URL}/courses/images`,
  IMAGE_CONFIG: `${API_BASE_URL}/courses/images/config`,
  // User endpoints
  GET_ALL_TOPICS: `${API_BASE_URL}/courses/topics`,
  GET_TOPIC: (topicId: string) => `${API_BASE_URL}/courses/topics/${topicId}`,
  GET_DOCS_BY_TOPIC: (topicId: string) =>
    `${API_BASE_URL}/courses/topics/${topicId}/docs`,
  GET_DOC: (docId: string) => `${API_BASE_URL}/courses/docs/${docId}`,
  STATS: `${API_BASE_URL}/courses/stats`,
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  CALLBACK: "/auth/callback",
  ME: "/me",
  ADMIN: "/admin",
  QUESTIONS: "/questions",
  QUESTION_DETAIL: (id: string) => `/questions/${id}`,
  CATEGORIES: "/categories",
  CATEGORY_DETAIL: (id: string) => `/categories/${id}`,
  COMPILER: "/compiler",
  USER_PROGRESS: "/userprogress",
  PROFILE: "/profile",
  INTERVIEW_PREP: '/interview-prep',
  INTERVIEW_PREP_TOPIC: (topicId: string) => `/interview-prep/${topicId}`,
  INTERVIEW_PREP_DOC: (topicId: string, docId: string) => `/interview-prep/${topicId}/${docId}`,
} as const;

export const ADMIN_ROUTES = {
  ME: "/admin",
  QUESTIONS: "/admin/questions",
  SOLUTIONS: "/admin/solutions",
  USERS: "/admin/users",
  CATEGORIES: "/admin/categories",
  SETTINGS: "/admin/settings",
  ANALYTICS: "/admin/analytics",
  COURSES: '/admin/courses',
  COURSES_TOPIC: (topicId: string) => `/admin/courses/${topicId}`,
  COURSES_DOC_EDIT: (topicId: string, docId: string) => `/admin/courses/${topicId}/${docId}`,
  COURSES_DOC_NEW: (topicId: string) => `/admin/courses/${topicId}/new`,
} as const;

// Storage and cookies
export const STORAGE_KEYS = {
  TOKEN: "algoarena_token",
  REFRESH_TOKEN: "algoarena_refresh_token",
  USER: "algoarena_user",
} as const;

export const COOKIE_OPTIONS = {
  TOKEN: {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  },
  REFRESH_TOKEN: {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  },
  USER: {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  },
} as const;

// Labels and display
export const USER_ROLE_LABELS = {
  USER: "User",
  ADMIN: "Admin",
  SUPERADMIN: "Super Admin",
} as const;

// Query keys for all features
export const QUERY_KEYS = {
  AUTH: {
    USER: ["auth", "user"] as const,
    REFRESH: ["auth", "refresh"] as const,
  },
  ADMIN: {
    STATS: ["admin", "stats"] as const,
    SETTINGS: ["admin", "settings"] as const,
    PROGRESS: ["admin", "progress"] as const,
    HEALTH: ["admin", "health"] as const,
    METRICS: ["admin", "metrics"] as const,
    USERS: ["admin", "users"] as const,
    USER_PERMISSIONS: ["admin", "users", "permissions"] as const,
  },
  USERS: {
    LIST: ["users", "list"] as const,
    BY_ROLE: (role: string) => ["users", "role", role] as const,
    DETAIL: (id: string) => ["users", "detail", id] as const,
  },
  CATEGORIES: {
    LIST: ["categories", "list"] as const,
    WITH_PROGRESS: ["categories", "with-progress"] as const, // NEW: For optimized categories
    DETAIL: (id: string) => ["categories", "detail", id] as const,
    STATS: (id: string) => ["categories", "stats", id] as const,
    PROGRESS: (id: string) => ["categories", "progress", id] as const,
  },
  QUESTIONS: {
    LIST: ["questions", "list"] as const,
    SUMMARY: ["questions", "summary"] as const, // NEW: For optimized summaries
    DETAIL: (id: string) => ["questions", "detail", id] as const,
    STATS: ["questions", "stats"] as const,
    SEARCH: (query: string) => ["questions", "search", query] as const,
    BY_CATEGORY: (categoryId: string) =>
      ["questions", "category", categoryId] as const,
    PROGRESS: (id: string) => ["questions", "progress", id] as const,
  },
  // USER PROGRESS QUERY KEYS - NEW
  USER_PROGRESS: {
    CURRENT_STATS: ["userProgress", "currentStats"] as const,
    CURRENT_RECENT: ["userProgress", "currentRecent"] as const,
    QUESTION_PROGRESS: (questionId: string) =>
      ["userProgress", "question", questionId] as const,
    CATEGORY_PROGRESS: (categoryId: string) =>
      ["userProgress", "category", categoryId] as const,
    USER_STATS: (userId: string) =>
      ["userProgress", "userStats", userId] as const,
    USER_ALL: (userId: string) => ["userProgress", "userAll", userId] as const,
  },
  // APPROACH QUERY KEYS - NEW
  APPROACHES: {
    BY_QUESTION: (questionId: string) =>
      ["approaches", "question", questionId] as const,
    DETAIL: (id: string) => ["approaches", "detail", id] as const,
    MY_APPROACHES: ["approaches", "my"] as const,
    MY_RECENT: ["approaches", "my", "recent"] as const,
    MY_STATS: ["approaches", "my", "stats"] as const,
    SIZE_USAGE: (questionId: string) =>
      ["approaches", "size", questionId] as const,
    LIMITS: (questionId: string) =>
      ["approaches", "limits", questionId] as const,
  },
  SOLUTIONS: {
    LIST: ["solutions", "list"] as const,
    DETAIL: (id: string) => ["solutions", "detail", id] as const,
    BY_QUESTION: (questionId: string) =>
      ["solutions", "question", questionId] as const,
    BY_CREATOR: (creatorId: string) =>
      ["solutions", "creator", creatorId] as const,
    STATS: ["solutions", "stats"] as const,
    VISUALIZERS: (solutionId?: string) =>
      solutionId
        ? (["solutions", "visualizers", solutionId] as const)
        : (["solutions", "visualizers"] as const),
  },
  COMPILER: {
    RUNTIMES: ["compiler", "runtimes"] as const,
    LANGUAGES: ["compiler", "languages"] as const,
    HEALTH: ["compiler", "health"] as const,
  },
  FILES: {
    CONFIG: ["files", "config"] as const,
    UPLOAD: ["files", "upload"] as const,
  },
  COURSES: {
    TOPICS_LIST: ['courses', 'topics'] as const,
    TOPIC_DETAIL: (topicId: string) => ['courses', 'topic', topicId] as const,
    DOCS_BY_TOPIC: (topicId: string) => ['courses', 'docs', 'topic', topicId] as const,
    DOC_DETAIL: (docId: string) => ['courses', 'doc', docId] as const,
    IMAGE_CONFIG: ['courses', 'image', 'config'] as const,
    STATS: ['courses', 'stats'] as const,
  },
} as const;

// Question validation constants
export const QUESTION_VALIDATION = {
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 200,
  STATEMENT_MIN_LENGTH: 20,
  STATEMENT_MAX_LENGTH: 10000,
  MAX_IMAGES_PER_QUESTION: 5,
  MAX_CODE_SNIPPETS: 10,
} as const;

// Solution validation constants
export const SOLUTION_VALIDATION = {
  CONTENT_MIN_LENGTH: 20,
  CONTENT_MAX_LENGTH: 15000,
  MAX_IMAGES_PER_SOLUTION: 10,
  MAX_VISUALIZERS_PER_SOLUTION: 2,
  CODE_MAX_LENGTH: 13000,
  DESCRIPTION_MAX_LENGTH: 200,
} as const;

// APPROACH VALIDATION CONSTANTS - NEW
export const APPROACH_VALIDATION = {
  TEXT_MIN_LENGTH: 10,
  TEXT_MAX_LENGTH: 10000,
  CODE_MAX_LENGTH: 13000,
  MAX_APPROACHES_PER_QUESTION: 3,
  MAX_TOTAL_SIZE_PER_USER_PER_QUESTION: 15 * 1024, // 15KB in bytes
} as const;

// Compiler validation constants
export const COMPILER_VALIDATION = {
  CODE_MAX_LENGTH: 50000,
  INPUT_MAX_LENGTH: 10000,
  MAX_EXECUTION_TIME: 30000, // 30 seconds
} as const;

// Question level display labels
export const QUESTION_LEVEL_LABELS = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
} as const;

// Question level colors for UI
export const QUESTION_LEVEL_COLORS = {
  EASY: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-800 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
  },
  MEDIUM: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-800 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  HARD: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-800 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
  },
} as const;

// Category validation constants
export const CATEGORY_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

// User interface constants
export const UI_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  SEARCH_DEBOUNCE_DELAY: 300,
  PAGINATION_DISPLAY_RANGE: 5,
} as const;
