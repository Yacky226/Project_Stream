/**
 * User Slice
 * SRP: User state management — profile, preferences, courses, notifications
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, UserPreferences, UserStats } from '../../types/user';
import { userApi } from '../api/userApi';

// ─── State Interface ──────────────────────────────────────────────────────────

interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences;
  stats: UserStats | null;
  enrolledCourses: string[];
  favoritesCourses: string[];
  completedCourses: string[];
  certificates: string[];
  notifications: any[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: number | null;
}

const initialState: UserState = {
  profile: null,
  preferences: {
    language: 'fr',
    theme: 'light',
    timezone: 'Europe/Paris',
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    courseReminders: true,
    weeklyDigest: true,
    autoplay: true,
    playbackSpeed: 1,
    subtitles: false,
    quality: 'auto',
    downloadQuality: 'medium',
    showOnlineStatus: true,
    allowProfileViews: true,
    allowCourseRecommendations: true,
  },
  stats: null,
  enrolledCourses: [],
  favoritesCourses: [],
  completedCourses: [],
  certificates: [],
  notifications: [],
  isLoading: false,
  error: null,
  lastSyncTime: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    updateLastSyncTime: (state) => {
      state.lastSyncTime = Date.now();
    },
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.unshift(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    updateLocalProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    addEnrolledCourse: (state, action: PayloadAction<string>) => {
      if (!state.enrolledCourses.includes(action.payload)) {
        state.enrolledCourses.push(action.payload);
      }
    },
    removeEnrolledCourse: (state, action: PayloadAction<string>) => {
      state.enrolledCourses = state.enrolledCourses.filter(
        courseId => courseId !== action.payload
      );
    },
    clearUserData: (state) => {
      state.profile = null;
      state.stats = null;
      state.enrolledCourses = [];
      state.favoritesCourses = [];
      state.completedCourses = [];
      state.certificates = [];
      state.notifications = [];
      state.error = null;
      state.lastSyncTime = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // ─── RTK Query matchers for user API ────────────────────────────────

    // Get Profile
    builder.addMatcher(
      userApi.endpoints.getProfile.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      },
    );
    builder.addMatcher(
      userApi.endpoints.getProfile.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.lastSyncTime = Date.now();
        state.error = null;
      },
    );
    builder.addMatcher(
      userApi.endpoints.getProfile.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as any)?.data?.message || 'Erreur lors du chargement du profil';
      },
    );

    // Update Profile
    builder.addMatcher(
      userApi.endpoints.updateProfile.matchFulfilled,
      (state, action) => {
        state.profile = action.payload;
      },
    );

    // Update Preferences
    builder.addMatcher(
      userApi.endpoints.getPreferences.matchFulfilled,
      (state, action) => {
        state.preferences = { ...state.preferences, ...action.payload };
      },
    );

    builder.addMatcher(
      userApi.endpoints.updatePreferences.matchFulfilled,
      (state, action) => {
        state.preferences = { ...state.preferences, ...action.payload };
      },
    );

    // Upload Avatar
    builder.addMatcher(
      userApi.endpoints.uploadAvatar.matchFulfilled,
      (state, action) => {
        if (state.profile) {
          state.profile.avatar = action.payload.avatarUrl;
        }
      },
    );

    // Enroll Course
    builder.addMatcher(
      userApi.endpoints.enrollCourse.matchFulfilled,
      (state, action) => {
        if (!state.enrolledCourses.includes(action.payload.courseId)) {
          state.enrolledCourses.push(action.payload.courseId);
        }
      },
    );

    // Unenroll Course
    builder.addMatcher(
      userApi.endpoints.unenrollCourse.matchFulfilled,
      (state) => {
        state.lastSyncTime = Date.now();
      },
    );

    // Notifications
    builder.addMatcher(
      userApi.endpoints.getNotifications.matchFulfilled,
      (state, action) => {
        state.notifications = action.payload.notifications;
      },
    );
    builder.addMatcher(
      userApi.endpoints.markNotificationRead.matchFulfilled,
      (state, action) => {
        const notificationId = action.meta.arg.originalArgs.notificationId;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
      },
    );
    builder.addMatcher(
      userApi.endpoints.markAllNotificationsRead.matchFulfilled,
      (state) => {
        state.notifications.forEach(n => { n.read = true; });
      },
    );
    builder.addMatcher(
      userApi.endpoints.deleteNotification.matchFulfilled,
      (state, action) => {
        const notificationId = action.meta.arg.originalArgs.notificationId;
        state.notifications = state.notifications.filter(n => n.id !== notificationId);
      },
    );
  },
});

export const {
  clearError,
  setPreferences,
  updateLastSyncTime,
  addNotification,
  removeNotification,
  clearNotifications,
  updateLocalProfile,
  addEnrolledCourse,
  removeEnrolledCourse,
  clearUserData,
} = userSlice.actions;

export default userSlice.reducer;
