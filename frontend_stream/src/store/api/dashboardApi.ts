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

interface AdminCoursesQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

interface AdminCourseListItem {
  id: string;
  title: string;
  teacherName: string;
  teacherId: string | null;
  enrollmentCount: number;
  sessionsCount: number;
  averageRating: number;
  completionRate: number;
  isArchived: boolean;
  createdAt: string | null;
  reviewCount: number;
}

interface AdminCoursesPage {
  items: AdminCourseListItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

function toNumber(value: unknown): number {
  const normalized = typeof value === 'string' ? Number(value) : value;
  return typeof normalized === 'number' && Number.isFinite(normalized) ? normalized : 0;
}

function toIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function buildTeacherNameForAdminCourse(course: BackendCourseManagementDTO): string {
  const prenom = course.enseignantPrenom?.trim() || '';
  const nom = course.enseignantNom?.trim() || '';
  const full = `${prenom} ${nom}`.trim();
  return full || 'N/A';
}

function mapAdminCourseItem(course: BackendCourseManagementDTO): AdminCourseListItem {
  return {
    id: String(course.id),
    title: course.titre,
    teacherName: buildTeacherNameForAdminCourse(course),
    teacherId: course.enseignantId != null ? String(course.enseignantId) : null,
    enrollmentCount: toNumber(course.nombreInscriptions),
    sessionsCount: toNumber(course.nombreSessions),
    averageRating: Number(toNumber(course.moyenneNotes).toFixed(2)),
    completionRate: Number(toNumber(course.tauxCompletion).toFixed(1)),
    isArchived: Boolean(course.archive),
    createdAt: toIso(course.dateCreation),
    reviewCount: toNumber(course.nombreAvis),
  };
}

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

    getAdminCourses: builder.query<AdminCoursesPage, AdminCoursesQueryParams | void>({
      query: (params) => ({
        url: '/api/admin/courses',
        params: {
          paginate: true,
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sortBy: params?.sortBy ?? 'dateCreation',
          sortDir: params?.sortDir ?? 'DESC',
        },
      }),
      transformResponse: (
        response: BackendPageResponse<BackendCourseManagementDTO>,
      ): AdminCoursesPage => ({
        items: (response.content || []).map(mapAdminCourseItem),
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        first: response.first,
        last: response.last,
        empty: response.empty,
      }),
      providesTags: ['AdminDashboard'],
    }),
  }),
});

export const {
  useGetStudentDashboardQuery,
  useGetTeacherDashboardQuery,
  useGetAdminDashboardQuery,
  useGetAdminCoursesQuery,
} = dashboardApi;
