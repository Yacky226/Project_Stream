import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserProfile, UserPreferences, UserStats } from '../../types/user';
import { userApi } from '../api/userApi';

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

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.getProfile.initiate(userId).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.updateProfile.initiate(profileData).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences: Partial<UserPreferences>, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.updatePreferences.initiate(preferences).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update preferences');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'user/fetchStats',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.getStats.initiate(userId).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch stats');
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'user/enrollInCourse',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.enrollCourse.initiate({ courseId }).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to enroll in course');
    }
  }
);

export const unenrollFromCourse = createAsyncThunk(
  'user/unenrollFromCourse',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.unenrollCourse.initiate({ courseId }).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unenroll from course');
    }
  }
);

export const toggleCourseFavorite = createAsyncThunk(
  'user/toggleFavorite',
  async (courseId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const isFavorite = state.user.favoritesCourses.includes(courseId);
      
      const response = await userApi.endpoints.toggleFavorite.initiate({ 
        courseId, 
        action: isFavorite ? 'remove' : 'add' 
      }).unwrap();
      
      return { courseId, action: isFavorite ? 'remove' : 'add' };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle favorite');
    }
  }
);

export const markCourseComplete = createAsyncThunk(
  'user/markCourseComplete',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.completeCourse.initiate({ courseId }).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark course as complete');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await userApi.endpoints.uploadAvatar.initiate(formData).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload avatar');
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'user/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.getNotifications.initiate().unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'user/markNotificationRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.markNotificationRead.initiate({ 
        notificationId 
      }).unwrap();
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

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
    // Fetch profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.profile;
        state.enrolledCourses = action.payload.enrolledCourses || [];
        state.favoritesCourses = action.payload.favoritesCourses || [];
        state.completedCourses = action.payload.completedCourses || [];
        state.certificates = action.payload.certificates || [];
        state.lastSyncTime = Date.now();
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update preferences
    builder
      .addCase(updateUserPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = { ...state.preferences, ...action.payload };
        state.error = null;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Enroll in course
    builder
      .addCase(enrollInCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!state.enrolledCourses.includes(action.payload.courseId)) {
          state.enrolledCourses.push(action.payload.courseId);
        }
        state.error = null;
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Unenroll from course
    builder
      .addCase(unenrollFromCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unenrollFromCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrolledCourses = state.enrolledCourses.filter(
          courseId => courseId !== action.payload.courseId
        );
        state.error = null;
      })
      .addCase(unenrollFromCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Toggle favorite
    builder
      .addCase(toggleCourseFavorite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleCourseFavorite.fulfilled, (state, action) => {
        state.isLoading = false;
        const { courseId, action: toggleAction } = action.payload;
        
        if (toggleAction === 'add') {
          if (!state.favoritesCourses.includes(courseId)) {
            state.favoritesCourses.push(courseId);
          }
        } else {
          state.favoritesCourses = state.favoritesCourses.filter(
            id => id !== courseId
          );
        }
        state.error = null;
      })
      .addCase(toggleCourseFavorite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark course complete
    builder
      .addCase(markCourseComplete.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markCourseComplete.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!state.completedCourses.includes(action.payload.courseId)) {
          state.completedCourses.push(action.payload.courseId);
        }
        if (action.payload.certificate) {
          state.certificates.push(action.payload.certificate);
        }
        state.error = null;
      })
      .addCase(markCourseComplete.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Upload avatar
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.avatar = action.payload.avatarUrl;
        }
        state.error = null;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark notification read
    builder
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
      });
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