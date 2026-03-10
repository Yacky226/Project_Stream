import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './apiClient';
import {
  buildAdminDashboardData,
} from './dashboardMappers';
import type {
  AdminDashboardData,
  BackendCourseManagementDTO,
  BackendDashboardStatsDTO,
  BackendInscriptionManagementDTO,
  BackendPageResponse,
  StudentDashboardData,
  TeacherDashboardData,
} from '../../types/dashboard';

function toPageContent<T>(data: unknown): T[] {
  if (!data || typeof data !== 'object') {
    return [];
  }

  const payload = data as BackendPageResponse<T>;
  return Array.isArray(payload.content) ? payload.content : [];
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['StudentDashboard', 'TeacherDashboard', 'AdminDashboard'],
  endpoints: (builder) => ({
    getStudentDashboard: builder.query<StudentDashboardData, void>({
      query: () => '/api/etudiant/dashboard',
      providesTags: ['StudentDashboard'],
    }),

    getTeacherDashboard: builder.query<TeacherDashboardData, void>({
      query: () => '/api/enseignant/dashboard',
      providesTags: ['TeacherDashboard'],
    }),

    getAdminDashboard: builder.query<AdminDashboardData, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const [statsResult, coursesResult, inscriptionsResult] = await Promise.all([
          baseQuery({ url: '/api/admin/dashboard' }),
          baseQuery({
            url: '/api/admin/courses',
            params: {
              paginate: true,
              page: 0,
              size: 10,
              sortBy: 'id',
              sortDir: 'DESC',
            },
          }),
          baseQuery({
            url: '/api/admin/inscriptions',
            params: {
              paginate: true,
              page: 0,
              size: 10,
              sortBy: 'id',
              sortDir: 'DESC',
            },
          }),
        ]);

        if (statsResult.error) {
          return { error: statsResult.error };
        }
        if (coursesResult.error) {
          return { error: coursesResult.error };
        }
        if (inscriptionsResult.error) {
          return { error: inscriptionsResult.error };
        }

        const stats = (statsResult.data || {}) as BackendDashboardStatsDTO;
        const courses = toPageContent<BackendCourseManagementDTO>(coursesResult.data);
        const inscriptions = toPageContent<BackendInscriptionManagementDTO>(
          inscriptionsResult.data,
        );

        const data = buildAdminDashboardData(stats, courses, inscriptions);
        return { data };
      },
      providesTags: ['AdminDashboard'],
    }),
  }),
});

export const {
  useGetStudentDashboardQuery,
  useGetTeacherDashboardQuery,
  useGetAdminDashboardQuery,
} = dashboardApi;
