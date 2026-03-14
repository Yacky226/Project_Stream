import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationSettings, NotificationFilter } from '../../types/notifications';
import { userApi } from '../api/userApi';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  
  // Settings
  settings: NotificationSettings;
  
  // Filters
  filters: NotificationFilter;
  
  // Real-time
  isConnected: boolean;
  lastSync: number | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  hasMore: boolean;
  offset: number;
  limit: number;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    push: {
      enabled: true,
      courseUpdates: true,
      liveStreams: true,
      assignments: true,
      messages: true,
      marketing: false,
    },
    email: {
      enabled: true,
      dailyDigest: true,
      weeklyReport: true,
      courseReminders: true,
      liveStreamReminders: true,
      marketing: false,
    },
    inApp: {
      enabled: true,
      sound: true,
      desktop: true,
      courseProgress: true,
      socialInteractions: true,
    },
    schedule: {
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      dnd: {
        enabled: false,
        until: null,
      },
    },
  },
  filters: {
    type: 'all',
    read: 'all',
    dateRange: 'all',
  },
  isConnected: false,
  lastSync: null,
  isLoading: false,
  error: null,
  hasMore: true,
  offset: 0,
  limit: 20,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: {
    offset?: number;
    limit?: number;
    type?: string;
    read?: boolean;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.getNotifications.initiate(params).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.markNotificationRead.initiate({ 
        notificationId 
      }).unwrap();
      return { notificationId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.markAllNotificationsRead.initiate().unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await userApi.endpoints.deleteNotification.initiate({ notificationId }).unwrap();
      return { notificationId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete notification');
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'notifications/updateSettings',
  async (settings: Partial<NotificationSettings>, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.updateNotificationSettings.initiate(settings).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update notification settings');
    }
  }
);

export const subscribeToNotifications = createAsyncThunk(
  'notifications/subscribe',
  async (subscription: PushSubscription, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.subscribePushNotifications.initiate({
        subscription: subscription.toJSON(),
      }).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to subscribe to notifications');
    }
  }
);

export const unsubscribeFromNotifications = createAsyncThunk(
  'notifications/unsubscribe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.unsubscribePushNotifications.initiate().unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unsubscribe from notifications');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Real-time updates
    addNotification: (state, action: PayloadAction<Notification>) => {
      const notification = action.payload;
      
      // Avoid duplicates
      if (!state.notifications.find(n => n.id === notification.id)) {
        state.notifications.unshift(notification);
        
        if (!notification.read) {
          state.unreadCount++;
        }
        
        // Keep only last 100 notifications in memory
        if (state.notifications.length > 100) {
          const removed = state.notifications.pop();
          if (removed && !removed.read) {
            state.unreadCount--;
          }
        }
      }
    },
    
    updateNotification: (state, action: PayloadAction<{ id: string; updates: Partial<Notification> }>) => {
      const { id, updates } = action.payload;
      const notification = state.notifications.find(n => n.id === id);
      
      if (notification) {
        const wasUnread = !notification.read;
        Object.assign(notification, updates);
        
        // Update unread count
        if (wasUnread && updates.read === true) {
          state.unreadCount--;
        } else if (!wasUnread && updates.read === false) {
          state.unreadCount++;
        }
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const index = state.notifications.findIndex(n => n.id === notificationId);
      
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount--;
        }
        state.notifications.splice(index, 1);
      }
    },
    
    // Bulk operations
    markMultipleAsRead: (state, action: PayloadAction<string[]>) => {
      const notificationIds = action.payload;
      
      notificationIds.forEach(id => {
        const notification = state.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount--;
        }
      });
    },
    
    deleteMultiple: (state, action: PayloadAction<string[]>) => {
      const notificationIds = action.payload;
      
      notificationIds.forEach(id => {
        const index = state.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
          const notification = state.notifications[index];
          if (!notification.read) {
            state.unreadCount--;
          }
          state.notifications.splice(index, 1);
        }
      });
    },
    
    // Filters
    updateFilters: (state, action: PayloadAction<Partial<NotificationFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Settings
    updateSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    toggleNotificationSetting: (state, action: PayloadAction<{
      category: 'push' | 'email' | 'inApp';
      setting: string;
    }>) => {
      const { category, setting } = action.payload;
      const categorySettings = state.settings[category] as any;
      
      if (categorySettings && typeof categorySettings[setting] === 'boolean') {
        categorySettings[setting] = !categorySettings[setting];
      }
    },
    
    // Connection status
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.lastSync = Date.now();
      }
    },
    
    updateLastSync: (state) => {
      state.lastSync = Date.now();
    },
    
    // Pagination
    setOffset: (state, action: PayloadAction<number>) => {
      state.offset = action.payload;
    },
    
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    
    // Quiet hours
    setQuietHours: (state, action: PayloadAction<{
      enabled: boolean;
      start: string;
      end: string;
    }>) => {
      state.settings.schedule.quietHours = action.payload;
    },
    
    toggleDoNotDisturb: (state, action: PayloadAction<number | null>) => {
      const until = action.payload;
      state.settings.schedule.dnd = {
        enabled: until !== null,
        until: until,
      };
    },
    
    // Reset
    resetNotificationsState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload.offset === 0) {
          // Replace notifications for first page
          state.notifications = action.payload.notifications;
        } else {
          // Append for pagination
          state.notifications.push(...action.payload.notifications);
        }
        
        state.unreadCount = action.payload.unreadCount;
        state.hasMore = action.payload.hasMore;
        state.offset = action.payload.offset;
        state.lastSync = Date.now();
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark as read
    builder
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          n => n.id === action.payload.notificationId
        );
        
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount--;
        }
      });

    // Mark all as read
    builder
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
      });

    // Delete notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          n => n.id === action.payload.notificationId
        );
        
        if (index !== -1) {
          const notification = state.notifications[index];
          if (!notification.read) {
            state.unreadCount--;
          }
          state.notifications.splice(index, 1);
        }
      });

    // Update settings
    builder
      .addCase(updateNotificationSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = { ...state.settings, ...action.payload };
        state.error = null;
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Subscribe to push notifications
    builder
      .addCase(subscribeToNotifications.fulfilled, (state) => {
        state.settings.push.enabled = true;
      });

    // Unsubscribe from push notifications
    builder
      .addCase(unsubscribeFromNotifications.fulfilled, (state) => {
        state.settings.push.enabled = false;
      });
  },
});

export const {
  addNotification,
  updateNotification,
  removeNotification,
  markMultipleAsRead,
  deleteMultiple,
  updateFilters,
  resetFilters,
  updateSettings,
  toggleNotificationSetting,
  setConnectionStatus,
  updateLastSync,
  setOffset,
  setHasMore,
  clearError,
  setQuietHours,
  toggleDoNotDisturb,
  resetNotificationsState,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
