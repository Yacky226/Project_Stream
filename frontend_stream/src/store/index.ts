import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import slices
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import coursesSlice from './slices/coursesSlice';
import streamingSlice from './slices/streamingSlice';
import chatSlice from './slices/chatSlice';
import chatbotSlice from './slices/chatbotSlice';
import uiSlice from './slices/uiSlice';
import notificationsSlice from './slices/notificationsSlice';

// Import API services
import { authApi } from './api/authApi';
import { coursesApi } from './api/coursesApi';
import { streamingApi } from './api/streamingApi';
import { userApi } from './api/userApi';

// Import middleware
import { authMiddleware } from './middleware/authMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';
import { loggingMiddleware } from './middleware/loggingMiddleware';
import { authStorage, uiStorage } from '../lib/localStorage';

// Configure store with direct reducer object
export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    courses: coursesSlice,
    streaming: streamingSlice,
    chat: chatSlice,
    chatbot: chatbotSlice,
    ui: uiSlice,
    notifications: notificationsSlice,
    // API reducers
    [authApi.reducerPath]: authApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
    [streamingApi.reducerPath]: streamingApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for date serialization
        ignoredActions: [
          'auth/loginUser/fulfilled', 
          'auth/registerUser/fulfilled'
        ],
        // Ignore these field paths in state
        ignoredPaths: [
          'auth.user.createdAt', 
          'auth.user.updatedAt'
        ],
      },
    })
    .concat(
      // RTK Query middleware
      authApi.middleware,
      coursesApi.middleware,
      streamingApi.middleware,
      userApi.middleware,
      // Custom middleware
      authMiddleware.middleware,
      errorMiddleware,
      loggingMiddleware,
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Initialize store with saved data after it's created
const initializeStoreData = () => {
  try {
    const savedAuth = authStorage.loadAuthData();
    if (savedAuth) {
      store.dispatch({
        type: 'auth/setInitialState',
        payload: {
          user: savedAuth.user,
          token: savedAuth.token,
          refreshToken: savedAuth.refreshToken,
          isAuthenticated: true,
        }
      });
    }
    
    const savedTheme = uiStorage.loadTheme();
    if (savedTheme) {
      store.dispatch({
        type: 'ui/setTheme',
        payload: savedTheme
      });
    }
    
    const savedLanguage = uiStorage.loadLanguage();
    if (savedLanguage) {
      store.dispatch({
        type: 'ui/setLanguage',
        payload: savedLanguage
      });
    }
  } catch (error) {
    console.warn('Failed to load initial state from localStorage:', error);
  }
};

// Initialize after store is created
setTimeout(() => initializeStoreData(), 0);

// Subscribe to store changes to save to localStorage
store.subscribe(() => {
  const state = store.getState();
  
  // Save auth state
  if (state.auth.isAuthenticated && state.auth.user && state.auth.token) {
    authStorage.saveAuthData({
      token: state.auth.token,
      refreshToken: state.auth.refreshToken || undefined,
      user: state.auth.user
    });
  } else {
    authStorage.clearAuthData();
  }
  
  // Save UI preferences
  uiStorage.saveTheme(state.ui.theme);
  uiStorage.saveLanguage(state.ui.preferences.language);
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store actions for easy access
export { store as default };