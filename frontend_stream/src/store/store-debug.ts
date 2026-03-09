import { configureStore } from '@reduxjs/toolkit';

// Import only essential slices for debugging
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';

// Basic store configuration for debugging
export const debugStore = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
        ignoredPaths: [],
      },
    }),
  devTools: true,
});

export type DebugRootState = ReturnType<typeof debugStore.getState>;
export type DebugAppDispatch = typeof debugStore.dispatch;