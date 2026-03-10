import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import only essential slices
import authSlice, { setInitialState } from './slices/authSlice';
import uiSlice, { setLanguage, setTheme } from './slices/uiSlice';
import notificationsSlice from './slices/notificationsSlice';
import chatbotSlice from './slices/chatbotSlice';
import { authApi } from './api/authApi';
import { userApi } from './api/userApi';
import { adminUserApi } from './api/adminUserApi';
import { dashboardApi } from './api/dashboardApi';
import { authStorage, uiStorage } from '../lib/localStorage';
import { hydrateAuthState } from './persistence/authHydration';

// Minimal store configuration
export const simpleStore = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    notifications: notificationsSlice,
    chatbot: chatbotSlice,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [adminUserApi.reducerPath]: adminUserApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['notifications/addNotification', 'notifications/simulateNotification'],
        ignoredPaths: [
          'auth.user.createdAt',
          'auth.user.updatedAt',
          'notifications.notifications',
        ],
      },
    }).concat(
      authApi.middleware,
      userApi.middleware,
      adminUserApi.middleware,
      dashboardApi.middleware,
    ),
  devTools: true,
});

setupListeners(simpleStore.dispatch);

const initializePersistedState = () => {
  try {
    const savedAuth = authStorage.loadAuthData();
    if (savedAuth?.token && savedAuth?.user) {
      const hydratedAuth = hydrateAuthState(savedAuth);

      if (!hydratedAuth) {
        authStorage.clearAuthData();
      } else {
        simpleStore.dispatch(setInitialState(hydratedAuth));
      }
    }

    const savedTheme = uiStorage.loadTheme();
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      simpleStore.dispatch(setTheme(savedTheme));
    }

    const savedLanguage = uiStorage.loadLanguage();
    if (savedLanguage === 'fr' || savedLanguage === 'en') {
      simpleStore.dispatch(setLanguage(savedLanguage));
    }
  } catch {
    // Keep app functional if storage is unavailable/corrupted
  }
};

initializePersistedState();

simpleStore.subscribe(() => {
  const state = simpleStore.getState();

  if (state.auth.isAuthenticated && state.auth.user && state.auth.token) {
    authStorage.saveAuthData({
      token: state.auth.token,
      refreshToken: state.auth.refreshToken || undefined,
      user: state.auth.user,
    });
  } else {
    authStorage.clearAuthData();
  }

  uiStorage.saveTheme(state.ui.theme);
  uiStorage.saveLanguage(state.ui.preferences.language);
});

export type SimpleRootState = ReturnType<typeof simpleStore.getState>;
export type SimpleAppDispatch = typeof simpleStore.dispatch;
