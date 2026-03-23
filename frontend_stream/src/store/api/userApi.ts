/**
 * User API Service
 * SRP: profile, enrollment, and notifications endpoints.
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth, multipartBaseQuery } from './apiClient';
import type { UserProfile, UserPreferences, BackendProfileResponse } from '../../types/user';
import { normalizeUserProfile } from '../../types/user';
import type { Notification } from '../../types/notifications';

interface BackendNotificationDTO {
  id: number;
  message: string;
  lu: boolean;
  date: string;
  destinataireId: number;
}

interface NotificationsQueryParams {
  offset?: number;
  limit?: number;
  type?: string;
  read?: boolean;
}

interface NotificationsQueryResult {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
  offset: number;
}

interface EnrollCoursePayload {
  coursId: string | number;
}

interface UnenrollCoursePayload {
  inscriptionId: string | number;
}

interface EnrollCourseResponse {
  coursId?: number | string;
}

interface BackendPreferencesResponse {
  success: boolean;
  data: UserPreferences;
}

interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  nom?: string;
  dateNaissance?: string | null;
  avatar?: string | null;
}

function mapNotification(dto: BackendNotificationDTO): Notification {
  return {
    id: String(dto.id),
    type: 'system',
    title: 'Notification',
    message: dto.message,
    read: dto.lu,
    createdAt: new Date(dto.date),
    priority: 'normal',
    data: {
      destinataireId: dto.destinataireId,
    },
  };
}

function buildUpdateProfileBody(payload: UpdateProfilePayload) {
  return {
    nom: payload.lastName || payload.nom,
    prenom: payload.firstName,
    dateNaissance: payload.dateNaissance || undefined,
    photoProfil: payload.avatar || undefined,
  };
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'User',
    'UserPreferences',
    'Notification',
    'StudentLevel',
    'TeacherSpecialty',
    'TeacherCourses',
  ],
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => '/api/utilisateurs/profil',
      transformResponse: (response: BackendProfileResponse): UserProfile =>
        normalizeUserProfile(response.data),
      providesTags: ['User'],
      keepUnusedDataFor: 600,
    }),

    updateProfile: builder.mutation<UserProfile, UpdateProfilePayload>({
      query: (profileData) => ({
        url: '/api/utilisateurs/profil',
        method: 'PUT',
        body: buildUpdateProfileBody(profileData),
      }),
      transformResponse: (response: BackendProfileResponse): UserProfile =>
        normalizeUserProfile(response.data),
      invalidatesTags: ['User'],
    }),

    getStudentLevel: builder.query<string, void>({
      query: () => '/api/etudiant/niveau',
      providesTags: ['StudentLevel'],
      keepUnusedDataFor: 600,
    }),

    getTeacherSpecialty: builder.query<string, void>({
      query: () => '/api/enseignant/specialite',
      providesTags: ['TeacherSpecialty'],
      keepUnusedDataFor: 600,
    }),

    getTeacherCourses: builder.query<any[], void>({
      query: () => '/api/enseignant/mes-cours',
      providesTags: ['TeacherCourses'],
    }),

    getPreferences: builder.query<UserPreferences, void>({
      query: () => '/api/utilisateurs/preferences',
      transformResponse: (response: BackendPreferencesResponse): UserPreferences => response.data,
      providesTags: ['UserPreferences'],
      keepUnusedDataFor: 600,
    }),

    updatePreferences: builder.mutation<UserPreferences, Partial<UserPreferences>>({
      query: (preferences) => ({
        url: '/api/utilisateurs/preferences',
        method: 'PUT',
        body: preferences,
      }),
      transformResponse: (response: BackendPreferencesResponse): UserPreferences => response.data,
      invalidatesTags: ['UserPreferences'],
    }),

    uploadAvatar: builder.mutation<{ avatarUrl: string }, FormData>({
      queryFn: async (formData, api, extraOptions) => {
        const result = await multipartBaseQuery(
          {
            url: '/api/utilisateurs/avatar',
            method: 'POST',
            body: formData,
          },
          api,
          extraOptions,
        );

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as { avatarUrl: string } };
      },
      invalidatesTags: ['User'],
    }),

    enrollCourse: builder.mutation<{ courseId: string }, EnrollCoursePayload>({
      query: (data) => ({
        url: '/api/inscriptions/me',
        method: 'POST',
        params: {
          coursId: data.coursId,
        },
      }),
      transformResponse: (response: EnrollCourseResponse): { courseId: string } => ({
        courseId: String(response.coursId || ''),
      }),
      invalidatesTags: ['User'],
    }),

    unenrollCourse: builder.mutation<void, UnenrollCoursePayload>({
      query: (data) => ({
        url: `/api/inscriptions/me/${data.inscriptionId}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),

    getNotifications: builder.query<NotificationsQueryResult, NotificationsQueryParams | void>({
      query: () => '/api/notifications',
      transformResponse: (
        response: BackendNotificationDTO[],
        _meta,
        arg,
      ): NotificationsQueryResult => {
        const params = arg || {};
        const offset = params.offset || 0;
        const limit = params.limit || response.length || 20;

        let notifications = response.map(mapNotification);

        if (params.read === true) {
          notifications = notifications.filter((notification) => notification.read);
        }

        if (params.read === false) {
          notifications = notifications.filter((notification) => !notification.read);
        }

        const paginated = notifications.slice(offset, offset + limit);
        const unreadCount = response.filter((notification) => !notification.lu).length;

        return {
          notifications: paginated,
          unreadCount,
          hasMore: offset + limit < notifications.length,
          offset,
        };
      },
      providesTags: ['Notification'],
    }),

    getUnreadNotificationCount: builder.query<number, void>({
      query: () => '/api/notifications/unread-count',
      providesTags: ['Notification'],
      keepUnusedDataFor: 120,
    }),

    markNotificationRead: builder.mutation<void, { notificationId: string }>({
      query: (data) => ({
        url: `/api/notifications/${data.notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/api/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    deleteNotification: builder.mutation<void, { notificationId: string }>({
      query: (data) => ({
        url: `/api/notifications/${data.notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    updateNotificationSettings: builder.mutation<Partial<UserPreferences>, Partial<UserPreferences>>({
      query: (settings) => ({
        url: '/api/utilisateurs/preferences',
        method: 'PUT',
        body: settings,
      }),
      transformResponse: (response: BackendPreferencesResponse): Partial<UserPreferences> => response.data,
      invalidatesTags: ['UserPreferences'],
    }),

    subscribePushNotifications: builder.mutation<{ subscribed: true }, { subscription: unknown }>({
      query: () => ({
        url: '/api/utilisateurs/preferences',
        method: 'PUT',
        body: { pushNotifications: true },
      }),
      transformResponse: () => ({ subscribed: true }),
      invalidatesTags: ['UserPreferences'],
    }),

    unsubscribePushNotifications: builder.mutation<{ subscribed: false }, void>({
      query: () => ({
        url: '/api/utilisateurs/preferences',
        method: 'PUT',
        body: { pushNotifications: false },
      }),
      transformResponse: () => ({ subscribed: false }),
      invalidatesTags: ['UserPreferences'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetStudentLevelQuery,
  useGetTeacherSpecialtyQuery,
  useGetTeacherCoursesQuery,
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
  useUploadAvatarMutation,
  useEnrollCourseMutation,
  useUnenrollCourseMutation,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useUpdateNotificationSettingsMutation,
  useSubscribePushNotificationsMutation,
  useUnsubscribePushNotificationsMutation,
} = userApi;
