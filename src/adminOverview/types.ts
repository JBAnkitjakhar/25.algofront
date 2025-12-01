// src/adminOverview/types.ts

// User who logged in today
export interface LoggedInUserToday {
  id: string;
  name: string;
  email: string | null;
  githubUsername: string | null;
  image: string | null;
  displayIdentifier: string;
  lastLoginIST: string;
}

// System health status
export interface SystemHealthStatus {
  databaseConnected: boolean;
  databaseStatus: string;
}

// Main overview response
export interface AdminOverviewResponse {
  totalUsers: number;
  totalCategories: number;
  totalQuestions: number;
  totalSolutions: number;
  totalUserApproaches: number;
  usersLoggedInTodayDetails: LoggedInUserToday[];
  usersLoggedInToday: number;
  questionsLast7Days: number;
  solutionsLast7Days: number;
  newUsersLast7Days: number;
  systemHealth: SystemHealthStatus;
  generatedAt: string; // ISO date string
}

// Pagination for logged in users
export interface PaginatedLoggedInUsers {
  users: LoggedInUserToday[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}