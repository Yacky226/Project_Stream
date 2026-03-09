import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  // Theme and appearance
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  
  // Layout
  sidebarOpen: boolean;
  sidebarWidth: number;
  headerHeight: number;
  
  // Modals and dialogs
  activeModal: string | null;
  modalData: any;
  
  // Navigation
  currentPath: string;
  previousPath: string;
  navigationHistory: string[];
  
  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Notifications and alerts
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    duration?: number;
    actions?: Array<{
      label: string;
      action: string;
    }>;
  }>;
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
    duration: number;
  }>;
  
  // User preferences
  preferences: {
    language: 'fr' | 'en';
    autoSave: boolean;
    compactMode: boolean;
    animationsEnabled: boolean;
    soundEnabled: boolean;
    confirmActions: boolean; 
    keyboardShortcuts: boolean;
  };
  
  // Screen and device info
  screenSize: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  
  // Feature flags
  features: Record<string, boolean>;
  
  // Error handling
  errors: Array<{
    id: string;
    code?: string;
    message: string;
    timestamp: number;
    context?: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  
  // Performance tracking
  performance: {
    pageLoadTime: number | null;
    renderTime: number | null;
    apiResponseTimes: Record<string, number>;
    errorCount: number;
    warningCount: number;
  };
}

const initialState: UIState = {
  theme: 'light',
  primaryColor: '#030213',
  fontSize: 'medium',
  sidebarOpen: false,
  sidebarWidth: 280,
  headerHeight: 64,
  activeModal: null,
  modalData: null,
  currentPath: '/',
  previousPath: '/',
  navigationHistory: ['/'],
  globalLoading: false,
  loadingStates: {},
  notifications: [],
  toasts: [],
  preferences: {
    language: 'fr',
    autoSave: true,
    compactMode: false,
    animationsEnabled: true,
    soundEnabled: true,
    confirmActions: false,
    keyboardShortcuts: true,
  },
  screenSize: 'desktop',
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  orientation: 'landscape',
  features: {},
  errors: [],
  performance: {
    pageLoadTime: null,
    renderTime: null,
    apiResponseTimes: {},
    errorCount: 0,
    warningCount: 0,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme and appearance
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
    
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
    },
    
    // Layout
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebarWidth = Math.max(200, Math.min(400, action.payload));
    },
    
    setHeaderHeight: (state, action: PayloadAction<number>) => {
      state.headerHeight = action.payload;
    },
    
    // Modals and dialogs
    openModal: (state, action: PayloadAction<{ modal: string; data?: any }>) => {
      state.activeModal = action.payload.modal;
      state.modalData = action.payload.data || null;
    },
    
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
    
    updateModalData: (state, action: PayloadAction<any>) => {
      state.modalData = action.payload;
    },
    
    // Navigation
    setCurrentPath: (state, action: PayloadAction<string>) => {
      state.previousPath = state.currentPath;
      state.currentPath = action.payload;
      
      // Add to history if different from last entry
      if (state.navigationHistory[state.navigationHistory.length - 1] !== action.payload) {
        state.navigationHistory.push(action.payload);
        
        // Keep only last 50 entries
        if (state.navigationHistory.length > 50) {
          state.navigationHistory = state.navigationHistory.slice(-50);
        }
      }
    },
    
    clearNavigationHistory: (state) => {
      state.navigationHistory = [state.currentPath];
    },
    
    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    
    setLoadingState: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      const { key, loading } = action.payload;
      if (loading) {
        state.loadingStates[key] = true;
      } else {
        delete state.loadingStates[key];
      }
    },
    
    clearAllLoadingStates: (state) => {
      state.loadingStates = {};
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      message: string;
      duration?: number;
      actions?: Array<{ label: string; action: string }>;
    }>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        duration: action.payload.duration || 5000,
      };
      
      state.notifications.push(notification);
      
      // Keep only last 20 notifications
      if (state.notifications.length > 20) {
        state.notifications = state.notifications.slice(-20);
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Toasts
    addToast: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      duration?: number;
    }>) => {
      const toast = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        duration: action.payload.duration || 3000,
      };
      
      state.toasts.push(toast);
      
      // Keep only last 5 toasts
      if (state.toasts.length > 5) {
        state.toasts = state.toasts.slice(-5);
      }
    },
    
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(
        toast => toast.id !== action.payload
      );
    },
    
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // Preferences
    updatePreferences: (state, action: PayloadAction<Partial<UIState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    setLanguage: (state, action: PayloadAction<'fr' | 'en'>) => {
      state.preferences.language = action.payload;
    },
    
    togglePreference: (state, action: PayloadAction<keyof UIState['preferences']>) => {
      const key = action.payload;
      if (typeof state.preferences[key] === 'boolean') {
        (state.preferences[key] as boolean) = !(state.preferences[key] as boolean);
      }
    },
    
    // Screen and device info
    updateScreenInfo: (state, action: PayloadAction<{
      screenSize: 'mobile' | 'tablet' | 'desktop';
      orientation: 'portrait' | 'landscape';
    }>) => {
      state.screenSize = action.payload.screenSize;
      state.orientation = action.payload.orientation;
      state.isMobile = action.payload.screenSize === 'mobile';
      state.isTablet = action.payload.screenSize === 'tablet';
      state.isDesktop = action.payload.screenSize === 'desktop';
      
      // Auto-close sidebar on mobile
      if (state.isMobile && state.sidebarOpen) {
        state.sidebarOpen = false;
      }
    },
    
    // Feature flags
    setFeatureFlag: (state, action: PayloadAction<{ feature: string; enabled: boolean }>) => {
      state.features[action.payload.feature] = action.payload.enabled;
    },
    
    setFeatureFlags: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.features = { ...state.features, ...action.payload };
    },
    
    // Error handling
    addError: (state, action: PayloadAction<{
      code?: string;
      message: string;
      context?: any;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    }>) => {
      const error = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        severity: action.payload.severity || 'medium',
      };
      
      state.errors.push(error);
      state.performance.errorCount++;
      
      // Keep only last 50 errors
      if (state.errors.length > 50) {
        state.errors = state.errors.slice(-50);
      }
    },
    
    removeError: (state, action: PayloadAction<string>) => {
      state.errors = state.errors.filter(
        error => error.id !== action.payload
      );
    },
    
    clearErrors: (state) => {
      state.errors = [];
      state.performance.errorCount = 0;
    },
    
    // Performance tracking
    setPageLoadTime: (state, action: PayloadAction<number>) => {
      state.performance.pageLoadTime = action.payload;
    },
    
    setRenderTime: (state, action: PayloadAction<number>) => {
      state.performance.renderTime = action.payload;
    },
    
    addApiResponseTime: (state, action: PayloadAction<{ endpoint: string; time: number }>) => {
      state.performance.apiResponseTimes[action.payload.endpoint] = action.payload.time;
    },
    
    incrementWarningCount: (state) => {
      state.performance.warningCount++;
    },
    
    resetPerformanceCounters: (state) => {
      state.performance.errorCount = 0;
      state.performance.warningCount = 0;
      state.performance.apiResponseTimes = {};
    },
    
    // Shortcuts
    showSuccess: (state, action: PayloadAction<string>) => {
      uiSlice.caseReducers.addToast(state, {
        payload: {
          type: 'success',
          message: action.payload,
        },
        type: 'ui/addToast',
      });
    },
    
    showError: (state, action: PayloadAction<string>) => {
      uiSlice.caseReducers.addToast(state, {
        payload: {
          type: 'error',
          message: action.payload,
        },
        type: 'ui/addToast',
      });
    },
    
    showWarning: (state, action: PayloadAction<string>) => {
      uiSlice.caseReducers.addToast(state, {
        payload: {
          type: 'warning',
          message: action.payload,
        },
        type: 'ui/addToast',
      });
      state.performance.warningCount++;
    },
    
    showInfo: (state, action: PayloadAction<string>) => {
      uiSlice.caseReducers.addToast(state, {
        payload: {
          type: 'info',
          message: action.payload,
        },
        type: 'ui/addToast',
      });
    },
    
    // Reset
    resetUIState: () => initialState,
  },
});

export const {
  setTheme,
  setPrimaryColor,
  setFontSize,
  toggleSidebar,
  setSidebarOpen,
  setSidebarWidth,
  setHeaderHeight,
  openModal,
  closeModal,
  updateModalData,
  setCurrentPath,
  clearNavigationHistory,
  setGlobalLoading,
  setLoadingState,
  clearAllLoadingStates,
  addNotification,
  removeNotification,
  clearNotifications,
  addToast,
  removeToast,
  clearToasts,
  updatePreferences,
  setLanguage,
  togglePreference,
  updateScreenInfo,
  setFeatureFlag,
  setFeatureFlags,
  addError,
  removeError,
  clearErrors,
  setPageLoadTime,
  setRenderTime,
  addApiResponseTime,
  incrementWarningCount,
  resetPerformanceCounters,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;