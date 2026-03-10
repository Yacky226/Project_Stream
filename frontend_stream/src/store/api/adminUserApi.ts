import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './apiClient';
import type {
  AdminUsersPage,
  AdminUsersQueryParams,
  AdminUser,
  AdminUserUpdatePayload,
  BackendAdminUser,
  BackendPageResponse,
  CreateAdminPayload,
  CreateStudentPayload,
  CreateTeacherPayload,
} from '../../types/admin';
import { mapBackendAdminUser } from '../../types/admin';

export const adminUserApi = createApi({
  reducerPath: 'adminUserApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['AdminUsers'],
  endpoints: (builder) => ({
    getAdminUsers: builder.query<AdminUsersPage, AdminUsersQueryParams | void>({
      query: (params) => ({
        url: '/api/admin/users',
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          sortBy: params?.sortBy ?? 'dateCreation',
          sortDir: params?.sortDir ?? 'DESC',
          role: params?.role,
          actif: params?.actif,
          search: params?.search || undefined,
        },
      }),
      transformResponse: (
        response: BackendPageResponse<BackendAdminUser>,
      ): AdminUsersPage => ({
        items: response.content.map(mapBackendAdminUser),
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        first: response.first,
        last: response.last,
        empty: response.empty,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((user) => ({ type: 'AdminUsers' as const, id: user.id })),
              { type: 'AdminUsers' as const, id: 'LIST' },
            ]
          : [{ type: 'AdminUsers' as const, id: 'LIST' }],
    }),

    getAdminUserById: builder.query<AdminUser, string>({
      query: (id) => `/api/admin/users/${id}`,
      transformResponse: (response: BackendAdminUser): AdminUser =>
        mapBackendAdminUser(response),
      providesTags: (_result, _error, id) => [{ type: 'AdminUsers', id }],
    }),

    updateAdminUser: builder.mutation<
      AdminUser,
      { id: string; payload: AdminUserUpdatePayload }
    >({
      query: ({ id, payload }) => ({
        url: `/api/admin/users/${id}`,
        method: 'PUT',
        body: payload,
      }),
      transformResponse: (response: BackendAdminUser): AdminUser =>
        mapBackendAdminUser(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'AdminUsers', id: arg.id },
        { type: 'AdminUsers', id: 'LIST' },
      ],
    }),

    toggleAdminUserStatus: builder.mutation<
      void,
      { id: string; actif: boolean }
    >({
      query: ({ id, actif }) => ({
        url: `/api/admin/users/${id}/toggle-status`,
        method: 'PATCH',
        params: { actif },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'AdminUsers', id: arg.id },
        { type: 'AdminUsers', id: 'LIST' },
      ],
    }),

    deleteAdminUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminUsers', id },
        { type: 'AdminUsers', id: 'LIST' },
      ],
    }),

    createAdminUser: builder.mutation<void, CreateAdminPayload>({
      query: (payload) => ({
        url: '/api/admin/ajouter-admin',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'AdminUsers', id: 'LIST' }],
    }),

    createTeacherUser: builder.mutation<void, CreateTeacherPayload>({
      query: (payload) => ({
        url: '/api/admin/ajouter-enseignant',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'AdminUsers', id: 'LIST' }],
    }),

    createStudentUser: builder.mutation<void, CreateStudentPayload>({
      query: (payload) => ({
        url: '/api/admin/ajouter-etudiant',
        method: 'POST',
        body: payload,
      }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'AdminUsers', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useUpdateAdminUserMutation,
  useToggleAdminUserStatusMutation,
  useDeleteAdminUserMutation,
  useCreateAdminUserMutation,
  useCreateTeacherUserMutation,
  useCreateStudentUserMutation,
} = adminUserApi;
