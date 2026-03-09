import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../../types/auth';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NODE_ENV === 'production' 
      ? '/api/v1/auth' 
      : 'http://localhost:8080/api/v1/auth',
    
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json');
      headers.set('accept', 'application/json');
      return headers;
    },
  }),
  
  tagTypes: ['Auth', 'User'],
  
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<AuthResponse, LoginCredentials>({
      queryFn: async (credentials, api, extraOptions, baseQuery) => {
        // Always use development mode for now (no backend available)
        console.log('Login attempt:', credentials.email);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate different responses based on email
        if (credentials.email === 'error@test.com') {
          return {
            error: {
              status: 401,
              data: { message: 'Invalid credentials' }
            }
          };
        }
        
        if (credentials.email === 'blocked@test.com') {
          return {
            error: {
              status: 429,
              data: { message: 'Account temporarily blocked' }
            }
          };
        }
        
        // Default success response
        return {
          data: {
            user: {
              id: '1',
              email: credentials.email,
              firstName: 'Test',
              lastName: 'User',
              role: credentials.email.includes('teacher') ? 'teacher' : 
                    credentials.email.includes('admin') ? 'admin' : 'student',
              avatar: null,
              emailVerified: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            token: 'dev-jwt-token-' + Date.now(),
            refreshToken: 'dev-refresh-token-' + Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          }
        };
      },
      
      invalidatesTags: ['Auth'],
    }),
    
    // Register
    register: builder.mutation<AuthResponse, RegisterData>({
      queryFn: async (userData, api, extraOptions, baseQuery) => {
        console.log('Register attempt:', userData.email);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (userData.email === 'existing@test.com') {
          return {
            error: {
              status: 409,
              data: { message: 'Email already exists' }
            }
          };
        }
        
        return {
          data: {
            user: {
              id: '2',
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role || 'student',
              avatar: null,
              emailVerified: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            token: 'dev-jwt-token-' + Date.now(),
            refreshToken: 'dev-refresh-token-' + Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000),
          }
        };
      },
      
      invalidatesTags: ['Auth'],
    }),
    
    // Refresh token
    refreshToken: builder.mutation<AuthResponse, { refreshToken: string }>({
      queryFn: async (data, api, extraOptions, baseQuery) => {
        console.log('Refresh token');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          data: {
            token: 'dev-jwt-token-refreshed-' + Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000),
          }
        };
      },
    }),
    
    // Logout
    logout: builder.mutation<void, { token: string }>({
      queryFn: async (data, api, extraOptions, baseQuery) => {
        console.log('Logout');
        
        await new Promise(resolve => setTimeout(resolve, 300));
        return { data: undefined };
      },
      
      invalidatesTags: ['Auth', 'User'],
    }),
    
    // Verify email
    verifyEmail: builder.mutation<{ success: boolean }, { token: string }>({
      queryFn: async (data, api, extraOptions, baseQuery) => {
        console.log('Verify email:', data.token);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (data.token === 'invalid-token') {
          return {
            error: {
              status: 400,
              data: { message: 'Invalid or expired token' }
            }
          };
        }
        
        return { data: { success: true } };
      },
    }),
    
    // Forgot password
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      queryFn: async (data, api, extraOptions, baseQuery) => {
        console.log('Forgot password:', data.email);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          data: {
            message: 'Password reset email sent successfully'
          }
        };
      },
    }),
    
    // Reset password
    resetPassword: builder.mutation<{ success: boolean }, { token: string; password: string }>({
      queryFn: async (data, api, extraOptions, baseQuery) => {
        console.log('Reset password');
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (data.token === 'expired-token') {
          return {
            error: {
              status: 400,
              data: { message: 'Reset token expired' }
            }
          };
        }
        
        return { data: { success: true } };
      },
    }),
    
    // Change password (authenticated)
    changePassword: builder.mutation<{ success: boolean }, { 
      currentPassword: string; 
      newPassword: string;
    }>({
      queryFn: async (data, api, extraOptions, baseQuery) => {
        console.log('Change password');
        
        await new Promise(resolve => setTimeout(resolve, 600));
        
        if (data.currentPassword === 'wrong-password') {
          return {
            error: {
              status: 400,
              data: { message: 'Current password is incorrect' }
            }
          };
        }
        
        return { data: { success: true } };
      },
    }),
    
    // Get current user
    getCurrentUser: builder.query<User, void>({
      queryFn: async (_, api, extraOptions, baseQuery) => {
        console.log('Get current user');
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Import authStorage dynamically to avoid circular dependencies
        const token = localStorage.getItem('auth_token');
        if (!token) {
          return {
            error: {
              status: 401,
              data: { message: 'No token provided' }
            }
          };
        }
        
        // Get user from localStorage with correct key
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            return { data: user };
          } catch (e) {
            console.error('Failed to parse user from localStorage:', e);
          }
        }
        
        return {
          data: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'student',
            avatar: null,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        };
      },
      
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetCurrentUserQuery,
} = authApi;