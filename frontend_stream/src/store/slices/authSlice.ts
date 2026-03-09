import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginCredentials, RegisterData } from '../../types/auth';
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
  initialized: boolean; // Track if auth state has been initialized
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

// Legacy async thunks - kept for backwards compatibility but not recommended
// Use RTK Query mutations directly via hooks instead
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue, dispatch }) => {
    try {
      // Note: This is a workaround. RTK Query mutations should be called via hooks
      // This will simulate the API call
      const result = await new Promise<any>((resolve, reject) => {
        const subscription = dispatch(
          authApi.endpoints.login.initiate(credentials) as any
        );
        
        subscription.unwrap()
          .then(resolve)
          .catch(reject);
      });
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error?.data?.message || error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterData, { rejectWithValue, dispatch }) => {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        const subscription = dispatch(
          authApi.endpoints.register.initiate(userData) as any
        );
        
        subscription.unwrap()
          .then(resolve)
          .catch(reject);
      });
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error?.data?.message || error.message || 'Registration failed');
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const result = await new Promise<any>((resolve, reject) => {
        const subscription = dispatch(
          authApi.endpoints.refreshToken.initiate({ refreshToken }) as any
        );
        
        subscription.unwrap()
          .then(resolve)
          .catch(reject);
      });
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error?.data?.message || error.message || 'Token refresh failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState, dispatch }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;
      
      if (token) {
        await new Promise<void>((resolve, reject) => {
          const subscription = dispatch(
            authApi.endpoints.logout.initiate({ token }) as any
          );
          
          subscription.unwrap()
            .then(() => resolve())
            .catch(reject);
        });
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue, dispatch }) => {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        const subscription = dispatch(
          authApi.endpoints.verifyEmail.initiate({ token }) as any
        );
        
        subscription.unwrap()
          .then(resolve)
          .catch(reject);
      });
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error?.data?.message || error.message || 'Email verification failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue, dispatch }) => {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        const subscription = dispatch(
          authApi.endpoints.forgotPassword.initiate({ email }) as any
        );
        
        subscription.unwrap()
          .then(resolve)
          .catch(reject);
      });
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error?.data?.message || error.message || 'Password reset request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: { token: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        const subscription = dispatch(
          authApi.endpoints.resetPassword.initiate(data) as any
        );
        
        subscription.unwrap()
          .then(resolve)
          .catch(reject);
      });
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error?.data?.message || error.message || 'Password reset failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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
        state.blockExpiry = Date.now() + (15 * 60 * 1000); // 15 minutes
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
    },
    setInitialized: (state) => {
      state.initialized = true;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) => {
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
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.loginAttempts += 1;
      if (state.loginAttempts >= 5) {
        state.isBlocked = true;
        state.blockExpiry = Date.now() + (15 * 60 * 1000);
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
    setInitialState: (state, action: PayloadAction<{
      user: User;
      token: string;
      refreshToken?: string;
      isAuthenticated: boolean;
    }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.sessionExpiry = action.payload.expiresAt;
        state.error = null;
        state.loginAttempts = 0;
        state.isBlocked = false;
        state.blockExpiry = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.loginAttempts += 1;
        if (state.loginAttempts >= 5) {
          state.isBlocked = true;
          state.blockExpiry = Date.now() + (15 * 60 * 1000);
        }
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          state.sessionExpiry = action.payload.expiresAt;
        }
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh token
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.sessionExpiry = action.payload.expiresAt;
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Clear auth if refresh fails
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.sessionExpiry = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Still clear auth even if logout API fails
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });

    // Email verification
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.emailVerified = true;
        }
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Forgot password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
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