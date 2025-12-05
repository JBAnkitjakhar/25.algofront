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
  // User management endpoints
  USERS: `${API_BASE_URL}/admin/users`,
  USER_BY_ID: (id: string) => `${API_BASE_URL}/admin/users/${id}`,
  USERS_BY_ROLE: (role: string) => `${API_BASE_URL}/admin/users/role/${role}`,
  UPDATE_USER_ROLE: (id: string) => `${API_BASE_URL}/admin/users/${id}/role`,
  USER_PERMISSIONS: `${API_BASE_URL}/admin/users/permissions`,
} as const;
 
// Compiler endpoints
export const COMPILER_ENDPOINTS = {
  EXECUTE: `${API_BASE_URL}/compiler/execute`,
  RUNTIMES: `${API_BASE_URL}/compiler/runtimes`,
  LANGUAGES: `${API_BASE_URL}/compiler/languages`,
  HEALTH: `${API_BASE_URL}/compiler/health`,
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
    USERS: ["admin", "users"] as const,
    USER_PERMISSIONS: ["admin", "users", "permissions"] as const,
  },
  USERS: {
    LIST: ["users", "list"] as const,
    BY_ROLE: (role: string) => ["users", "role", role] as const,
    DETAIL: (id: string) => ["users", "detail", id] as const,
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

// User interface constants
export const UI_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  SEARCH_DEBOUNCE_DELAY: 300,
  PAGINATION_DISPLAY_RANGE: 5,
} as const;
