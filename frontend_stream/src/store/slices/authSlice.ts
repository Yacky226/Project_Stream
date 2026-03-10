import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/auth';
import { authApi } from '../api/authApi';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
  sessionExpiry: number | null;
  loginAttempts: number;
  isBlocked: boolean;
  blockExpiry: number | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastActivity: Date.now(),
  sessionExpiry: null,
  loginAttempts: 0,
  isBlocked: false,
  blockExpiry: null,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    setSessionExpiry: (state, action: PayloadAction<number>) => {
      state.sessionExpiry = action.payload;
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
      if (state.loginAttempts >= 5) {
        state.isBlocked = true;
        state.blockExpiry = Date.now() + 15 * 60 * 1000;
      }
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.isBlocked = false;
      state.blockExpiry = null;
    },
    checkBlockStatus: (state) => {
      if (state.isBlocked && state.blockExpiry && Date.now() > state.blockExpiry) {
        state.isBlocked = false;
        state.blockExpiry = null;
        state.loginAttempts = 0;
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setToken: (state, action: PayloadAction<{ token: string; refreshToken?: string }>) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.sessionExpiry = null;
      state.isLoading = false;
    },
    setInitialized: (state) => {
      state.initialized = true;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken?: string;
        expiresAt?: number;
      }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.loginAttempts = 0;
      state.isBlocked = false;
      state.blockExpiry = null;
      state.initialized = true;
      if (action.payload.expiresAt) {
        state.sessionExpiry = action.payload.expiresAt;
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.loginAttempts += 1;
      if (state.loginAttempts >= 5) {
        state.isBlocked = true;
        state.blockExpiry = Date.now() + 15 * 60 * 1000;
      }
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.sessionExpiry = null;
      state.isLoading = false;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setInitialState: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken?: string;
        isAuthenticated: boolean;
        sessionExpiry?: number | null;
      }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.sessionExpiry = action.payload.sessionExpiry || null;
      state.error = null;
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(authApi.endpoints.login.matchPending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
      state.sessionExpiry = action.payload.expiresAt;
      state.error = null;
      state.loginAttempts = 0;
      state.isBlocked = false;
      state.blockExpiry = null;
      state.initialized = true;
    });

    builder.addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
      state.isLoading = false;
      state.error =
        (action.payload as { data?: { message?: string; error?: string } })?.data
          ?.message ||
        (action.payload as { data?: { message?: string; error?: string } })?.data
          ?.error ||
        'Echec de la connexion';
      state.loginAttempts += 1;
      if (state.loginAttempts >= 5) {
        state.isBlocked = true;
        state.blockExpiry = Date.now() + 15 * 60 * 1000;
      }
    });

    builder.addMatcher(authApi.endpoints.register.matchPending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
      state.sessionExpiry = action.payload.expiresAt;
      state.error = null;
      state.loginAttempts = 0;
      state.isBlocked = false;
      state.blockExpiry = null;
      state.initialized = true;
    });

    builder.addMatcher(authApi.endpoints.register.matchRejected, (state, action) => {
      state.isLoading = false;
      state.error =
        (action.payload as { data?: { message?: string; error?: string } })?.data
          ?.message ||
        (action.payload as { data?: { message?: string; error?: string } })?.data
          ?.error ||
        'Echec de l inscription';
    });

    builder.addMatcher(
      authApi.endpoints.refreshToken.matchFulfilled,
      (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || state.refreshToken;
        state.sessionExpiry = action.payload.expiresAt;
      },
    );

    builder.addMatcher(authApi.endpoints.refreshToken.matchRejected, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.sessionExpiry = null;
    });

    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.sessionExpiry = null;
    });

    builder.addMatcher(
      authApi.endpoints.getCurrentUser.matchFulfilled,
      (state, action) => {
        state.user = action.payload;
        state.initialized = true;
      },
    );
  },
});

export const {
  setAuthError,
  clearError,
  updateLastActivity,
  setSessionExpiry,
  incrementLoginAttempts,
  resetLoginAttempts,
  checkBlockStatus,
  updateUser,
  setToken,
  clearAuth,
  setInitialState,
  setInitialized,
  loginSuccess,
  loginFailure,
  logout,
  updateProfile,
} = authSlice.actions;

export default authSlice.reducer;
