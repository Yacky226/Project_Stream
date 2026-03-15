import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './apiClient';
import type {
  AdminSupportContactRequestDetail,
  AdminNewsletterQueryParams,
  AdminNewsletterSubscriptionsPage,
  AdminSupportContactsPage,
  AdminSupportOverview,
  AdminSupportQueryParams,
  AdminSupportReplyPayload,
  AdminSupportStatusUpdatePayload,
  AdminSupportWorkflowUpdatePayload,
  BackendAdminSupportContactRequestDetail,
  BackendAdminNewsletterSubscription,
  BackendAdminSupportContactRequest,
  BackendAdminSupportOverview,
  BackendPageResponse,
} from '../../types/admin';
import {
  mapBackendNewsletterSubscription,
  mapBackendSupportContactRequest,
  mapBackendSupportContactRequestDetail,
  mapBackendSupportOverview,
} from '../../types/admin';

export const adminSupportApi = createApi({
  reducerPath: 'adminSupportApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['AdminSupportOverview', 'AdminSupportContacts', 'AdminNewsletter'],
  endpoints: (builder) => ({
    getAdminSupportOverview: builder.query<AdminSupportOverview, void>({
      query: () => '/api/admin/support/overview',
      transformResponse: (response: BackendAdminSupportOverview): AdminSupportOverview =>
        mapBackendSupportOverview(response),
      providesTags: [{ type: 'AdminSupportOverview', id: 'CURRENT' }],
    }),

    getAdminSupportContacts: builder.query<
      AdminSupportContactsPage,
      AdminSupportQueryParams | void
    >({
      query: (params) => ({
        url: '/api/admin/support/contacts',
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 12,
          sortBy: params?.sortBy ?? 'createdAt',
          sortDir: params?.sortDir ?? 'DESC',
          status: params?.status,
          search: params?.search || undefined,
        },
      }),
      transformResponse: (
        response: BackendPageResponse<BackendAdminSupportContactRequest>,
      ): AdminSupportContactsPage => ({
        items: response.content.map(mapBackendSupportContactRequest),
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
              ...result.items.map((request) => ({
                type: 'AdminSupportContacts' as const,
                id: request.id,
              })),
              { type: 'AdminSupportContacts' as const, id: 'LIST' },
            ]
          : [{ type: 'AdminSupportContacts' as const, id: 'LIST' }],
    }),

    getAdminSupportContactById: builder.query<AdminSupportContactRequestDetail, string>({
      query: (id) => `/api/admin/support/contacts/${id}`,
      transformResponse: (
        response: BackendAdminSupportContactRequestDetail,
      ): AdminSupportContactRequestDetail => mapBackendSupportContactRequestDetail(response),
      providesTags: (_result, _error, id) => [{ type: 'AdminSupportContacts', id }],
    }),

    updateAdminSupportContactStatus: builder.mutation<
      void,
      { id: string; payload: AdminSupportStatusUpdatePayload }
    >({
      query: ({ id, payload }) => ({
        url: `/api/admin/support/contacts/${id}/status`,
        method: 'PATCH',
        body: payload,
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, arg) => [
        { type: 'AdminSupportContacts', id: arg.id },
        { type: 'AdminSupportContacts', id: 'LIST' },
        { type: 'AdminSupportOverview', id: 'CURRENT' },
      ],
    }),

    updateAdminSupportContactWorkflow: builder.mutation<
      void,
      { id: string; payload: AdminSupportWorkflowUpdatePayload }
    >({
      query: ({ id, payload }) => ({
        url: `/api/admin/support/contacts/${id}/workflow`,
        method: 'PATCH',
        body: payload,
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, arg) => [
        { type: 'AdminSupportContacts', id: arg.id },
        { type: 'AdminSupportContacts', id: 'LIST' },
        { type: 'AdminSupportOverview', id: 'CURRENT' },
      ],
    }),

    replyToAdminSupportContact: builder.mutation<
      void,
      { id: string; payload: AdminSupportReplyPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/api/admin/support/contacts/${id}/reply`,
        method: 'POST',
        body: payload,
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, arg) => [
        { type: 'AdminSupportContacts', id: arg.id },
        { type: 'AdminSupportContacts', id: 'LIST' },
        { type: 'AdminSupportOverview', id: 'CURRENT' },
      ],
    }),

    getAdminNewsletterSubscriptions: builder.query<
      AdminNewsletterSubscriptionsPage,
      AdminNewsletterQueryParams | void
    >({
      query: (params) => ({
        url: '/api/admin/support/newsletter',
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 8,
          sortBy: params?.sortBy ?? 'updatedAt',
          sortDir: params?.sortDir ?? 'DESC',
          active: params?.active,
          search: params?.search || undefined,
        },
      }),
      transformResponse: (
        response: BackendPageResponse<BackendAdminNewsletterSubscription>,
      ): AdminNewsletterSubscriptionsPage => ({
        items: response.content.map(mapBackendNewsletterSubscription),
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
              ...result.items.map((subscription) => ({
                type: 'AdminNewsletter' as const,
                id: subscription.id,
              })),
              { type: 'AdminNewsletter' as const, id: 'LIST' },
            ]
          : [{ type: 'AdminNewsletter' as const, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAdminSupportOverviewQuery,
  useGetAdminSupportContactsQuery,
  useGetAdminSupportContactByIdQuery,
  useUpdateAdminSupportContactStatusMutation,
  useUpdateAdminSupportContactWorkflowMutation,
  useReplyToAdminSupportContactMutation,
  useGetAdminNewsletterSubscriptionsQuery,
} = adminSupportApi;
