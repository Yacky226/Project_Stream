import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { SimpleRootState, SimpleAppDispatch } from '../store/store-simple';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<SimpleAppDispatch>();
export const useAppSelector: TypedUseSelectorHook<SimpleRootState> = useSelector;

// Custom hooks for specific slices (simplified for debugging)
export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  return {
    ...auth,
    dispatch,
  };
};

export const useUI = () => {
  const ui = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  
  return {
    ...ui,
    dispatch,
  };
};

// Temporary stubs for hooks that depend on slices not in simple store
export const useUser = () => {
  const dispatch = useAppDispatch();
  return {
    profile: null,
    preferences: {},
    isLoading: false,
    error: null,
    dispatch,
  };
};

export const useCourses = () => {
  const dispatch = useAppDispatch();
  return {
    courses: [],
    isLoading: false,
    error: null,
    dispatch,
  };
};

export const useStreaming = () => {
  const dispatch = useAppDispatch();
  return {
    isStreaming: false,
    isViewing: false,
    currentSession: null,
    dispatch,
  };
};

export const useChat = () => {
  const dispatch = useAppDispatch();
  return {
    messages: [],
    isEnabled: true,
    dispatch,
  };
};

export const useNotifications = () => {
  const notifications = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();
  
  return {
    ...notifications,
    dispatch,
  };
};