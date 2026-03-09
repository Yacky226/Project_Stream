import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { 
  clearError,
  updateLastActivity,
  checkBlockStatus,
  loginSuccess,
  loginFailure,
  incrementLoginAttempts,
  logout as logoutAction
} from '../store/slices/authSlice';
import { 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation,
  useRefreshTokenMutation 
} from '../store/api/authApi';
import { LoginCredentials, RegisterData, AuthResponse } from '../types/auth';
import { authStorage } from '../lib/localStorage';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  
  // RTK Query mutations
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const [refreshTokenMutation] = useRefreshTokenMutation();
  
  const isLoading = isLoginLoading || isRegisterLoading || auth.isLoading;
  
  // Auto-refresh token before expiry
  useEffect(() => {
    if (auth.isAuthenticated && auth.sessionExpiry && auth.refreshToken) {
      const refreshBuffer = 5 * 60 * 1000; // 5 minutes before expiry
      const timeUntilRefresh = auth.sessionExpiry - Date.now() - refreshBuffer;
      
      if (timeUntilRefresh > 0) {
        const timer = setTimeout(() => {
          refreshTokenMutation({ refreshToken: auth.refreshToken! })
            .unwrap()
            .then((response: AuthResponse) => {
              // Update token in localStorage using authStorage
              const currentAuth = authStorage.loadAuthData();
              if (currentAuth) {
                authStorage.saveAuthData({
                  token: response.token,
                  refreshToken: response.refreshToken || currentAuth.refreshToken,
                  user: currentAuth.user
                });
              }
            })
            .catch((error) => {
              console.error('Token refresh failed:', error);
              dispatch(logoutAction());
            });
        }, timeUntilRefresh);
        
        return () => clearTimeout(timer);
      } else if (timeUntilRefresh <= 0) {
        // Token already expired or about to expire
        refreshTokenMutation({ refreshToken: auth.refreshToken })
          .unwrap()
          .then((response: AuthResponse) => {
            // Update token in localStorage using authStorage
            const currentAuth = authStorage.loadAuthData();
            if (currentAuth) {
              authStorage.saveAuthData({
                token: response.token,
                refreshToken: response.refreshToken || currentAuth.refreshToken,
                user: currentAuth.user
              });
            }
          })
          .catch((error) => {
            console.error('Token refresh failed:', error);
            dispatch(logoutAction());
          });
      }
    }
  }, [auth.isAuthenticated, auth.sessionExpiry, auth.refreshToken, dispatch, refreshTokenMutation]);
  
  // Check block status periodically
  useEffect(() => {
    if (auth.isBlocked) {
      const interval = setInterval(() => {
        dispatch(checkBlockStatus());
      }, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [auth.isBlocked, dispatch]);
  
  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => {
      if (auth.isAuthenticated) {
        dispatch(updateLastActivity());
      }
    };
    
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [auth.isAuthenticated, dispatch]);
  
  // Actions
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const result = await loginMutation(credentials).unwrap();
      
      // Store in localStorage using authStorage
      authStorage.saveAuthData({
        token: result.token,
        refreshToken: result.refreshToken,
        user: result.user
      });
      
      // Update Redux state
      dispatch(loginSuccess({
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken
      }));
      
      return result;
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      throw error;
    }
  }, [loginMutation, dispatch]);
  
  const register = useCallback(async (userData: RegisterData) => {
    try {
      const result = await registerMutation(userData).unwrap();
      
      // Store in localStorage using authStorage
      authStorage.saveAuthData({
        token: result.token,
        refreshToken: result.refreshToken,
        user: result.user
      });
      
      // Update Redux state
      dispatch(loginSuccess({
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken
      }));
      
      return result;
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Registration failed';
      dispatch(loginFailure(errorMessage));
      throw error;
    }
  }, [registerMutation, dispatch]);
  
  const logout = useCallback(async () => {
    try {
      if (auth.token) {
        await logoutMutation({ token: auth.token }).unwrap();
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear localStorage using authStorage
      authStorage.clearAuthData();
      
      // Clear Redux state
      dispatch(logoutAction());
    }
  }, [auth.token, logoutMutation, dispatch]);
  
  const refreshToken = useCallback(async () => {
    if (!auth.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const result = await refreshTokenMutation({ 
        refreshToken: auth.refreshToken 
      }).unwrap();
      
      // Update localStorage - just update the token, keep the user
      const currentAuth = authStorage.loadAuthData();
      if (currentAuth) {
        authStorage.saveAuthData({
          token: result.token,
          refreshToken: result.refreshToken || currentAuth.refreshToken,
          user: currentAuth.user
        });
      }
      
      return result;
    } catch (error) {
      dispatch(logoutAction());
      throw error;
    }
  }, [auth.refreshToken, refreshTokenMutation, dispatch]);
  
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);
  
  // Computed values
  const isExpiringSoon = auth.sessionExpiry 
    ? auth.sessionExpiry - Date.now() < 10 * 60 * 1000 // 10 minutes
    : false;
  
  const timeUntilExpiry = auth.sessionExpiry 
    ? Math.max(0, auth.sessionExpiry - Date.now())
    : 0;
  
  const canAttemptLogin = !auth.isBlocked || (
    auth.blockExpiry && Date.now() > auth.blockExpiry
  );
  
  const timeUntilUnblock = auth.isBlocked && auth.blockExpiry
    ? Math.max(0, auth.blockExpiry - Date.now())
    : 0;
  
  return {
    // State
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading,
    error: auth.error,
    loginAttempts: auth.loginAttempts,
    isBlocked: auth.isBlocked,
    
    // Computed
    isExpiringSoon,
    timeUntilExpiry,
    canAttemptLogin,
    timeUntilUnblock,
    
    // Actions
    login,
    register,
    logout,
    refreshToken,
    clearError: clearAuthError,
  };
};