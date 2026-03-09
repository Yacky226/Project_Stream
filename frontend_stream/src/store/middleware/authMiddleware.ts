import { createListenerMiddleware } from '@reduxjs/toolkit';
import { loginSuccess, logout, updateProfile, loginFailure, clearAuth } from '../slices/authSlice';
import { clearUserData } from '../slices/userSlice';
import { resetStreamingState } from '../slices/streamingSlice';
import { resetChatState } from '../slices/chatSlice';
import { resetNotificationsState, addNotification } from '../slices/notificationsSlice';
import { setCurrentPath, showError } from '../slices/uiSlice';
import { configUtils } from '../../lib/config';

// Create auth middleware for side effects
export const authMiddleware = createListenerMiddleware();

// Handle successful login
authMiddleware.startListening({
  actionCreator: loginSuccess,
  effect: async (action, listenerApi) => {
    const { user, token } = action.payload;
    
    try {
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Log successful login
      configUtils.log('User logged in successfully:', user.email);
      
      // Add welcome notification
      listenerApi.dispatch(addNotification({
        id: `welcome-${Date.now()}`,
        type: 'system',
        title: 'Connexion réussie',
        message: `Bienvenue ${user.name} !`,
        isRead: false,
        createdAt: new Date().toISOString()
      }));
      
      // Handle redirect after login
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      
      if (redirectUrl) {
        // Clean the URL and navigate to the redirect path
        window.history.replaceState({}, '', window.location.pathname);
        // Use setTimeout to ensure the navigation happens after state updates
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = decodeURIComponent(redirectUrl);
          }
        }, 100);
      } else {
        // Navigate to appropriate dashboard based on user role
        const dashboardPath = user.role === 'teacher' ? '/teacher/dashboard' : 
                              user.role === 'admin' ? '/admin' : '/dashboard';
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = dashboardPath;
          }
        }, 100);
      }
      
      // Initialize user-specific services if backend is enabled
      if (configUtils.isBackendEnabled()) {
        configUtils.debug('Initializing user-specific services for:', user.id);
      }
      
    } catch (error) {
      configUtils.error('Error handling login success:', error);
    }
  },
});

// Handle login failure
authMiddleware.startListening({
  actionCreator: loginFailure,
  effect: async (action, listenerApi) => {
    const error = action.payload;
    
    try {
      configUtils.warn('Login failed:', error);
      
      // Add error notification
      listenerApi.dispatch(addNotification({
        id: `login-error-${Date.now()}`,
        type: 'system',
        title: 'Erreur de connexion',
        message: error || 'Une erreur est survenue lors de la connexion',
        isRead: false,
        createdAt: new Date().toISOString()
      }));
      
      // Show error in UI
      listenerApi.dispatch(showError('Échec de la connexion. Vérifiez vos identifiants.'));
      
      // Clear any stored auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
    } catch (error) {
      configUtils.error('Error handling login failure:', error);
    }
  },
});

// Handle logout
authMiddleware.startListening({
  actionCreator: logout,
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    
    try {
      // Clear all stored data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userPreferences');
      
      // Clear all related state
      dispatch(clearUserData());
      dispatch(resetStreamingState());
      dispatch(resetChatState());
      dispatch(resetNotificationsState());
      
      configUtils.log('User logged out successfully');
      
      // Navigate to home page
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = '/';
        }
      }, 100);
      
      // Add logout notification
      dispatch(addNotification({
        id: `logout-${Date.now()}`,
        type: 'system',
        title: 'Déconnexion',
        message: 'Vous avez été déconnecté avec succès',
        isRead: false,
        createdAt: new Date().toISOString()
      }));
      
      // Cleanup user-specific services
      if (configUtils.isBackendEnabled()) {
        configUtils.debug('Cleaning up user-specific services');
      }
      
    } catch (error) {
      configUtils.error('Error handling logout:', error);
    }
  },
});

// Handle profile updates
authMiddleware.startListening({
  actionCreator: updateProfile,
  effect: async (action, listenerApi) => {
    const { getState } = listenerApi;
    const state = getState() as any;
    
    try {
      // Update stored user data
      const updatedUser = state.auth.user;
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        configUtils.log('User profile updated:', updatedUser.email);
        
        // Add success notification
        listenerApi.dispatch(addNotification({
          id: `profile-update-${Date.now()}`,
          type: 'system',
          title: 'Profil mis à jour',
          message: 'Votre profil a été mis à jour avec succès',
          isRead: false,
          createdAt: new Date().toISOString()
        }));
      }
    } catch (error) {
      configUtils.error('Error handling profile update:', error);
    }
  },
});

// Handle clear auth (session expiration, etc.)
authMiddleware.startListening({
  actionCreator: clearAuth,
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    
    try {
      // Clear stored data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userPreferences');
      
      // Clear related state
      dispatch(clearUserData());
      dispatch(resetStreamingState());
      dispatch(resetChatState());
      dispatch(resetNotificationsState());
      
      configUtils.warn('Authentication cleared');
      
      // Add session expiration notification
      dispatch(addNotification({
        id: `session-expired-${Date.now()}`,
        type: 'system',
        title: 'Session expirée',
        message: 'Votre session a expiré. Veuillez vous reconnecter.',
        isRead: false,
        createdAt: new Date().toISOString()
      }));
      
      // Show error message
      dispatch(showError('Session expirée. Veuillez vous reconnecter.'));
      
      // Redirect to login
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location) {
          const currentPath = window.location.pathname;
          if (currentPath !== '/' && currentPath !== '/auth/signin') {
            window.location.href = `/auth/signin?redirect=${encodeURIComponent(currentPath)}`;
          } else {
            window.location.href = '/auth/signin';
          }
        }
      }, 1000);
      
    } catch (error) {
      configUtils.error('Error handling clear auth:', error);
    }
  },
});

// Handle 401 responses from API calls
authMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/rejected') && 
           (action.payload?.status === 401 || action.payload?.code === 'UNAUTHORIZED');
  },
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as any;
    
    // Only handle if user was previously authenticated
    if (state.auth.isAuthenticated) {
      configUtils.warn('Received 401 response, clearing authentication');
      dispatch(clearAuth());
    }
  },
});

// Handle 403 responses
authMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/rejected') && 
           (action.payload?.status === 403 || action.payload?.code === 'FORBIDDEN');
  },
  effect: async (action, listenerApi) => {
    configUtils.warn('Access denied (403)');
    listenerApi.dispatch(showError('Accès refusé. Vous n\'avez pas les permissions nécessaires.'));
    
    listenerApi.dispatch(addNotification({
      id: `access-denied-${Date.now()}`,
      type: 'system',
      title: 'Accès refusé',
      message: 'Vous n\'avez pas les permissions pour effectuer cette action',
      isRead: false,
      createdAt: new Date().toISOString()
    }));
  },
});

// Auto-restore authentication from localStorage on app start
authMiddleware.startListening({
  actionCreator: setCurrentPath,
  effect: async (action, listenerApi) => {
    const { getState, dispatch } = listenerApi;
    const state = getState() as any;
    
    // Only attempt auto-restore once when app starts
    if (!state.auth.isAuthenticated && !state.auth.loading && !state.auth.initialized) {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser);
          
          // Basic token validation (check if it looks like a JWT and isn't expired)
          try {
            const tokenParts = storedToken.split('.');
            if (tokenParts.length === 3) {
              const tokenPayload = JSON.parse(atob(tokenParts[1]));
              const isExpired = tokenPayload.exp && tokenPayload.exp * 1000 < Date.now();
              
              if (!isExpired) {
                configUtils.log('Restoring authentication from stored credentials');
                dispatch(loginSuccess({ user, token: storedToken }));
                return;
              } else {
                configUtils.warn('Stored token is expired, clearing credentials');
              }
            } else {
              configUtils.warn('Invalid token format, clearing credentials');
            }
          } catch (tokenError) {
            configUtils.warn('Error parsing stored token, clearing credentials');
          }
          
          // Clear invalid/expired credentials
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
        
        // Mark as initialized to prevent future auto-restore attempts
        dispatch({ type: 'auth/setInitialized' });
      } catch (error) {
        configUtils.error('Error during authentication restoration:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  },
});