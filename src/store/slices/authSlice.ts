// src/store/slices/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState, UserRole } from '@/types';
import { cookieManager } from '@/lib/utils/auth';
// import { cookieManager } from '@/lib/utils';

// Helper function to get initial state from cookies
const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }

  // Client-side - use centralized cookie manager
  const token = cookieManager.getToken();
  const refreshToken = cookieManager.getRefreshToken();
  const user = cookieManager.getUser();

  return {
    user,
    token: token || null,
    refreshToken: refreshToken || null,
    isAuthenticated: !!token && !!user,
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Start loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Login success
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
      const { user, token, refreshToken } = action.payload;
      
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Use centralized cookie manager
      cookieManager.setAuthData(token, refreshToken, user);
    },

    // Update user info
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update cookie using centralized manager
        cookieManager.setUser(state.user);
      }
    },

    // Update tokens
    updateTokens: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      const { token, refreshToken } = action.payload;
      
      state.token = token;
      state.refreshToken = refreshToken;

      // Update cookies using centralized manager
      cookieManager.setToken(token);
      cookieManager.setRefreshToken(refreshToken);
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Clear cookies using centralized manager
      cookieManager.clearAll();
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  loginSuccess,
  updateUser,
  updateTokens,
  logout,
  clearError,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;

// Helper selectors
export const selectUserRole = (state: { auth: AuthState }): UserRole | null => 
  state.auth.user?.role || null;

export const selectIsAdmin = (state: { auth: AuthState }): boolean => {
  const role = state.auth.user?.role;
  return role === UserRole.ADMIN || role === UserRole.SUPERADMIN;
};

export const selectIsSuperAdmin = (state: { auth: AuthState }): boolean => {
  return state.auth.user?.role === UserRole.SUPERADMIN;
};

export default authSlice.reducer;