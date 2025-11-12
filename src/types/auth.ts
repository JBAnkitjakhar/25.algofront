// src/types/auth.ts
export interface User {
  id: string;
  name: string;
  email?: string; // CHANGED: Email is now optional (can be undefined for GitHub private email users)
  image?: string;
  githubUsername?: string; // NEW: For displaying GitHub users without email
  role: UserRole;
  createdAt: string; // ISO string format
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN'
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  provider: 'google' | 'github';
}

// NEW: Helper function to get display identifier
export const getUserDisplayIdentifier = (user: User | null): string => {
  if (!user) return 'Guest';
  
  if (user.email) {
    return user.email;
  } else if (user.githubUsername) {
    return `@${user.githubUsername}`;
  }
  return user.name || 'User';
};

// NEW: Helper to get user greeting
export const getUserGreeting = (user: User | null): string => {
  if (!user) return 'Welcome';
  return `Welcome, ${user.name || user.githubUsername || 'User'}`;
};