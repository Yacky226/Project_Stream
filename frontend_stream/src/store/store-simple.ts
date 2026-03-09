import { configureStore } from '@reduxjs/toolkit';

// Import only essential slices
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import notificationsSlice from './slices/notificationsSlice';
import chatbotSlice from './slices/chatbotSlice';

// Minimal store configuration
export const simpleStore = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    notifications: notificationsSlice,
    chatbot: chatbotSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for date serialization
        ignoredActions: [
          'auth/loginUser/fulfilled', 
          'auth/registerUser/fulfilled',
          'notifications/addNotification',
          'notifications/simulateNotification'
        ],
        // Ignore these field paths in state
        ignoredPaths: [
          'auth.user.createdAt', 
          'auth.user.updatedAt',
          'notifications.notifications'
        ],
      },
    }),
  devTools: true,
});

export type SimpleRootState = ReturnType<typeof simpleStore.getState>;
export type SimpleAppDispatch = typeof simpleStore.dispatch;