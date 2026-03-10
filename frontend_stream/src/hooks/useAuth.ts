import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  clearError,
  updateLastActivity,
  checkBlockStatus,
  setAuthError,
  logout as logoutAction,
} from '../store/slices/authSlice';
import {
  useLoginMutation,
  useRegisterMutation,
  useRegisterTeacherMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '../store/api/authApi';
import type {
  LoginCredentials,
  RegisterData,
  RegisterTeacherData,
  UserRole,
} from '../types/auth';
import { selectAuthState } from '../store/selectors/authSelectors';

function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };

  return (
    payload.data?.message ||
    payload.data?.error ||
    payload.error ||
    payload.message ||
    fallback
  );
}

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuthState);

  const [loginMutation, loginState] = useLoginMutation();
  const [registerMutation, registerState] = useRegisterMutation();
  const [registerTeacherMutation, registerTeacherState] = useRegisterTeacherMutation();
  const [logoutMutation] = useLogoutMutation();
  const [refreshTokenMutation] = useRefreshTokenMutation();
  const [forgotPasswordMutation, forgotPasswordState] = useForgotPasswordMutation();
  const [resetPasswordMutation, resetPasswordState] = useResetPasswordMutation();

  const isLoading =
    auth.isLoading ||
    loginState.isLoading ||
    registerState.isLoading ||
    registerTeacherState.isLoading ||
    forgotPasswordState.isLoading ||
    resetPasswordState.isLoading;

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.sessionExpiry || !auth.refreshToken) {
      return;
    }

    const refreshBuffer = 5 * 60 * 1000;
    const timeUntilRefresh = auth.sessionExpiry - Date.now() - refreshBuffer;

    const triggerRefresh = () => {
      refreshTokenMutation({ refreshToken: auth.refreshToken as string })
        .unwrap()
        .catch(() => {
          dispatch(logoutAction());
        });
    };

    if (timeUntilRefresh <= 0) {
      triggerRefresh();
      return;
    }

    const timer = setTimeout(triggerRefresh, timeUntilRefresh);
    return () => clearTimeout(timer);
  }, [auth.isAuthenticated, auth.refreshToken, auth.sessionExpiry, dispatch, refreshTokenMutation]);

  useEffect(() => {
    if (!auth.isBlocked) {
      return;
    }

    const interval = setInterval(() => {
      dispatch(checkBlockStatus());
    }, 60_000);

    return () => clearInterval(interval);
  }, [auth.isBlocked, dispatch]);

  useEffect(() => {
    const updateActivity = () => {
      if (auth.isAuthenticated) {
        dispatch(updateLastActivity());
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [auth.isAuthenticated, dispatch]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        return await loginMutation(credentials).unwrap();
      } catch (error) {
        dispatch(setAuthError(extractErrorMessage(error, 'Echec de la connexion')));
        throw error;
      }
    },
    [dispatch, loginMutation],
  );

  const register = useCallback(
    async (userData: RegisterData) => {
      try {
        return await registerMutation(userData).unwrap();
      } catch (error) {
        dispatch(setAuthError(extractErrorMessage(error, "Echec de l'inscription")));
        throw error;
      }
    },
    [dispatch, registerMutation],
  );

  const forgotPassword = useCallback(
    async (email: string) => {
      try {
        const result = await forgotPasswordMutation({ email }).unwrap();
        return result;
      } catch (error) {
        dispatch(setAuthError(extractErrorMessage(error, "Echec de l'envoi de l'email")));
        throw error;
      }
    },
    [dispatch, forgotPasswordMutation],
  );

  const registerTeacher = useCallback(
    async (teacherData: RegisterTeacherData) => {
      try {
        return await registerTeacherMutation(teacherData).unwrap();
      } catch (error) {
        dispatch(
          setAuthError(
            extractErrorMessage(
              error,
              "Echec de l'inscription enseignant",
            ),
          ),
        );
        throw error;
      }
    },
    [dispatch, registerTeacherMutation],
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      try {
        const result = await resetPasswordMutation({
          token,
          newPassword,
        }).unwrap();
        return result;
      } catch (error) {
        dispatch(setAuthError(extractErrorMessage(error, "Echec de la reinitialisation")));
        throw error;
      }
    },
    [dispatch, resetPasswordMutation],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation({ refreshToken: auth.refreshToken }).unwrap();
    } catch {
      // keep client logout even if server logout fails
    } finally {
      dispatch(logoutAction());
    }
  }, [auth.refreshToken, dispatch, logoutMutation]);

  const refreshToken = useCallback(async () => {
    if (!auth.refreshToken) {
      throw new Error('No refresh token available');
    }

    const result = await refreshTokenMutation({
      refreshToken: auth.refreshToken,
    }).unwrap();

    return result;
  }, [auth.refreshToken, refreshTokenMutation]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const getCurrentUser = useCallback(() => auth.user, [auth.user]);

  const hasRole = useCallback(
    (requiredRole: UserRole) => {
      if (!auth.user) {
        return false;
      }

      const order: Record<UserRole, number> = {
        student: 0,
        teacher: 1,
        admin: 2,
      };

      return order[auth.user.role] >= order[requiredRole];
    },
    [auth.user],
  );

  const isExpiringSoon = auth.sessionExpiry
    ? auth.sessionExpiry - Date.now() < 10 * 60 * 1000
    : false;

  const timeUntilExpiry = auth.sessionExpiry
    ? Math.max(0, auth.sessionExpiry - Date.now())
    : 0;

  const canAttemptLogin = !auth.isBlocked || (
    !!auth.blockExpiry && Date.now() > auth.blockExpiry
  );

  const timeUntilUnblock = auth.isBlocked && auth.blockExpiry
    ? Math.max(0, auth.blockExpiry - Date.now())
    : 0;

  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading,
    error: auth.error,
    loginAttempts: auth.loginAttempts,
    isBlocked: auth.isBlocked,
    isExpiringSoon,
    timeUntilExpiry,
    canAttemptLogin,
    timeUntilUnblock,
    login,
    register,
    registerTeacher,
    forgotPassword,
    resetPassword,
    logout,
    refreshToken,
    clearError: clearAuthError,
    getCurrentUser,
    hasRole,
  };
};
