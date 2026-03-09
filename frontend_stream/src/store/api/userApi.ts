import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { UserProfile, UserPreferences, UserStats } from '../../types/user';
import { Notification } from '../../types/notifications';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NODE_ENV === 'production' 
      ? '/api/v1' 
      : 'http://localhost:8080/api/v1',
    
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state?.auth?.token;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      headers.set('content-type', 'application/json');
      headers.set('accept', 'application/json');
      
      return headers;
    },
  }),
  
  tagTypes: ['User', 'Notification'],
  endpoints: (builder) => ({
    // Get user profile
    getProfile: builder.query<{
      profile: UserProfile;
      enrolledCourses: string[];
      favoritesCourses: string[];
      completedCourses: string[];
      certificates: string[];
    }, string>({
      query: (userId) => `/users/${userId}/profile`,
      
      queryFn: async (userId, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 400));
          
          const mockProfile: UserProfile = {
            id: userId,
            email: 'user@example.com',
            firstName: 'Jean',
            lastName: 'Dupont',
            role: 'student',
            avatar: '/api/placeholder/128/128',
            emailVerified: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date(),
            timezone: 'Europe/Paris',
            bio: 'Passionné de développement web et de nouvelles technologies.',
            location: 'Paris, France',
            isPublic: true,
            allowMessages: true,
            showEmail: false,
            showProgress: true,
            jobTitle: 'Développeur Frontend',
            company: 'Tech Corp',
            experience: 'intermediate',
            skills: ['React', 'JavaScript', 'TypeScript', 'CSS'],
            interests: ['Web Development', 'AI', 'UI/UX'],
          };
          
          return {
            data: {
              profile: mockProfile,
              enrolledCourses: ['1', '2'],
              favoritesCourses: ['1'],
              completedCourses: [],
              certificates: [],
            }
          };
        }
        
        return baseQuery(`/users/${userId}/profile`, api, extraOptions);
      },
      
      providesTags: ['User'],
    }),
    
    // Update user profile
    updateProfile: builder.mutation<UserProfile, Partial<UserProfile>>({
      query: (profileData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: profileData,
      }),
      
      queryFn: async (profileData, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 600));
          
          return {
            data: {
              ...profileData,
              updatedAt: new Date(),
            } as UserProfile
          };
        }
        
        return baseQuery({
          url: '/users/profile',
          method: 'PUT',
          body: profileData,
        }, api, extraOptions);
      },
      
      invalidatesTags: ['User'],
    }),
    
    // Update user preferences
    updatePreferences: builder.mutation<UserPreferences, Partial<UserPreferences>>({
      query: (preferences) => ({
        url: '/users/preferences',
        method: 'PUT',
        body: preferences,
      }),
      
      queryFn: async (preferences, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          return { data: preferences as UserPreferences };
        }
        
        return baseQuery({
          url: '/users/preferences',
          method: 'PUT',
          body: preferences,
        }, api, extraOptions);
      },
      
      invalidatesTags: ['User'],
    }),
    
    // Get user stats
    getStats: builder.query<UserStats, string>({
      query: (userId) => `/users/${userId}/stats`,
      
      queryFn: async (userId, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const mockStats: UserStats = {
            totalCoursesEnrolled: 5,
            totalCoursesCompleted: 2,
            totalLessonsWatched: 48,
            totalTimeSpent: 1440, // 24 hours
            certificatesEarned: 2,
            badgesEarned: 8,
            streakDays: 7,
            longestStreak: 21,
            forumPosts: 12,
            questionsAsked: 8,
            questionsAnswered: 15,
            helpfulVotes: 23,
            averageCompletionRate: 85,
            averageQuizScore: 87,
            lastActivityAt: new Date(),
            currentStreak: 7,
            weeklyGoal: 10,
            weeklyProgress: 8,
          };
          
          return { data: mockStats };
        }
        
        return baseQuery(`/users/${userId}/stats`, api, extraOptions);
      },
      
      providesTags: ['User'],
    }),
    
    // Enroll in course
    enrollCourse: builder.mutation<{ courseId: string }, { courseId: string }>({
      query: (data) => ({
        url: '/users/enrollments',
        method: 'POST',
        body: data,
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          return { data };
        }
        
        return baseQuery({
          url: '/users/enrollments',
          method: 'POST',
          body: data,
        }, api, extraOptions);
      },
      
      invalidatesTags: ['User'],
    }),
    
    // Unenroll from course
    unenrollCourse: builder.mutation<{ courseId: string }, { courseId: string }>({
      query: (data) => ({
        url: `/users/enrollments/${data.courseId}`,
        method: 'DELETE',
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 400));
          
          return { data };
        }
        
        return baseQuery({
          url: `/users/enrollments/${data.courseId}`,
          method: 'DELETE',
        }, api, extraOptions);
      },
      
      invalidatesTags: ['User'],
    }),
    
    // Toggle course favorite
    toggleFavorite: builder.mutation<void, { courseId: string; action: 'add' | 'remove' }>({
      query: (data) => ({
        url: `/users/favorites/${data.courseId}`,
        method: data.action === 'add' ? 'POST' : 'DELETE',
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          return { data: undefined };
        }
        
        return baseQuery({
          url: `/users/favorites/${data.courseId}`,
          method: data.action === 'add' ? 'POST' : 'DELETE',
        }, api, extraOptions);
      },
      
      invalidatesTags: ['User'],
    }),
    
    // Complete course
    completeCourse: builder.mutation<{ courseId: string; certificate?: string }, { courseId: string }>({
      query: (data) => ({
        url: `/users/completions`,
        method: 'POST',
        body: data,
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            data: {
              courseId: data.courseId,
              certificate: `cert-${Date.now()}`,
            }
          };
        }
        
        return baseQuery({
          url: '/users/completions',
          method: 'POST',
          body: data,
        }, api, extraOptions);
      },
      
      invalidatesTags: ['User'],
    }),
    
    // Upload avatar
    uploadAvatar: builder.mutation<{ avatarUrl: string }, FormData>({
      query: (formData) => ({
        url: '/users/avatar',
        method: 'POST',
        body: formData,
      }),
      
      queryFn: async (formData, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          return {
            data: {
              avatarUrl: '/api/placeholder/128/128?t=' + Date.now(),
            }
          };
        }
        
        return baseQuery({
          url: '/users/avatar',
          method: 'POST',
          body: formData,
        }, api, extraOptions);
      },
      
      invalidatesTags: ['User'],
    }),
    
    // Get notifications
    getNotifications: builder.query<{
      notifications: Notification[];
      unreadCount: number;
      hasMore: boolean;
      offset: number;
    }, {
      offset?: number;
      limit?: number;
      type?: string;
      read?: boolean;
    }>({
      query: (params) => ({
        url: '/users/notifications',
        params,
      }),
      
      queryFn: async (params, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 400));
          
          const mockNotifications: Notification[] = [
            {
              id: '1',
              type: 'course_update',
              title: 'Nouveau chapitre disponible',
              message: 'Un nouveau chapitre a été ajouté à votre cours "React Hooks Avancés"',
              read: false,
              createdAt: new Date(Date.now() - 3600000),
              priority: 'normal',
              data: { courseId: '1' },
            },
            {
              id: '2',
              type: 'achievement',
              title: 'Badge obtenu !',
              message: 'Félicitations ! Vous avez obtenu le badge "Premier cours terminé"',
              read: false,
              createdAt: new Date(Date.now() - 7200000),
              priority: 'normal',
              data: { badgeId: 'first_completion' },
            },
          ];
          
          return {
            data: {
              notifications: mockNotifications,
              unreadCount: 2,
              hasMore: false,
              offset: params.offset || 0,
            }
          };
        }
        
        return baseQuery({
          url: '/users/notifications',
          params,
        }, api, extraOptions);
      },
      
      providesTags: ['Notification'],
    }),
    
    // Mark notification as read
    markNotificationRead: builder.mutation<void, { notificationId: string }>({
      query: (data) => ({
        url: `/users/notifications/${data.notificationId}/read`,
        method: 'PUT',
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          return { data: undefined };
        }
        
        return baseQuery({
          url: `/users/notifications/${data.notificationId}/read`,
          method: 'PUT',
        }, api, extraOptions);
      },
      
      invalidatesTags: ['Notification'],
    }),
    
    // Mark all notifications as read
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/users/notifications/read-all',
        method: 'PUT',
      }),
      
      queryFn: async (_, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          return { data: undefined };
        }
        
        return baseQuery({
          url: '/users/notifications/read-all',
          method: 'PUT',
        }, api, extraOptions);
      },
      
      invalidatesTags: ['Notification'],
    }),
    
    // Delete notification
    deleteNotification: builder.mutation<void, { notificationId: string }>({
      query: (data) => ({
        url: `/users/notifications/${data.notificationId}`,
        method: 'DELETE',
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          return { data: undefined };
        }
        
        return baseQuery({
          url: `/users/notifications/${data.notificationId}`,
          method: 'DELETE',
        }, api, extraOptions);
      },
      
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdatePreferencesMutation,
  useGetStatsQuery,
  useEnrollCourseMutation,
  useUnenrollCourseMutation,
  useToggleFavoriteMutation,
  useCompleteCourseMutation,
  useUploadAvatarMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} = userApi;