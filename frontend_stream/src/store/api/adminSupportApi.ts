import { createApi } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
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
} from '../../types/admin';
import {
  mapBackendNewsletterSubscription,
  mapBackendSupportContactRequest,
  mapBackendSupportContactRequestDetail,
  mapBackendSupportOverview,
} from '../../types/admin';

const SUPPORT_OVERVIEW_PATHS = [
  '/api/admin/support/overview',
  '/api/admin/support/stats',
  '/api/admin/support/metrics',
];

const SUPPORT_CONTACTS_PATHS = [
  '/api/admin/support/contacts',
  '/api/admin/support/contact-requests',
];

const SUPPORT_NEWSLETTER_PATHS = [
  '/api/admin/support/newsletter',
  '/api/admin/support/newsletters',
  '/api/admin/support/newsletter/subscriptions',
];

interface BackendApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function unwrapPayload<T>(value: unknown): T | unknown {
  const record = asRecord(value);
  if (!record) {
    return value;
  }

  const envelope = record as BackendApiEnvelope<T>;
  if (envelope.data !== undefined) {
    return envelope.data;
  }

  return value;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    if (lowered === 'true') return true;
    if (lowered === 'false') return false;
  }
  return fallback;
}

function parseCollection<T>(payload: unknown): T[] | null {
  const unwrapped = unwrapPayload(payload);
  if (Array.isArray(unwrapped)) {
    return unwrapped as T[];
  }

  const record = asRecord(unwrapped);
  if (!record) {
    return null;
  }

  if (Array.isArray(record.content)) {
    return record.content as T[];
  }
  if (Array.isArray(record.items)) {
    return record.items as T[];
  }
  if (Array.isArray(record.list)) {
    return record.list as T[];
  }

  return null;
}

function buildPageFromItems<T>(
  items: T[],
  page: number,
  size: number,
): {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
} {
  const pageNumber = Math.max(0, page);
  const pageSize = Math.max(1, size);
  const totalElements = items.length;
  const totalPages = totalElements > 0 ? Math.ceil(totalElements / pageSize) : 0;
  const normalizedPage = totalPages > 0 ? Math.min(pageNumber, totalPages - 1) : 0;
  const start = normalizedPage * pageSize;
  const pagedItems = items.slice(start, start + pageSize);

  return {
    items: pagedItems,
    pageNumber: normalizedPage,
    pageSize,
    totalElements,
    totalPages,
    first: normalizedPage === 0,
    last: totalPages === 0 || normalizedPage >= totalPages - 1,
    empty: pagedItems.length === 0,
  };
}

function parseOverview(payload: unknown): AdminSupportOverview | null {
  const unwrapped = unwrapPayload<BackendAdminSupportOverview>(payload);
  const record = asRecord(unwrapped);
  if (!record) return null;

  const hasKnownMetric = [
    'pendingContactRequests',
    'demandesContactEnAttente',
    'newContactRequests',
    'nouvellesDemandesContact',
    'monthlyContactRequests',
    'demandesContactMois',
    'activeNewsletterSubscriptions',
    'newslettersActives',
  ].some((key) => key in record);

  if (!hasKnownMetric) {
    return null;
  }

  return mapBackendSupportOverview(record as BackendAdminSupportOverview);
}

function compareDateDesc(left: string | null | undefined, right: string | null | undefined): number {
  const leftValue = left ? new Date(left).getTime() : 0;
  const rightValue = right ? new Date(right).getTime() : 0;
  const normalizedLeft = Number.isNaN(leftValue) ? 0 : leftValue;
  const normalizedRight = Number.isNaN(rightValue) ? 0 : rightValue;
  return normalizedRight - normalizedLeft;
}

function parseContactsPage(
  payload: unknown,
  params?: AdminSupportQueryParams,
): AdminSupportContactsPage | null {
  const unwrapped = unwrapPayload(payload);
  const record = asRecord(unwrapped);

  if (record && Array.isArray(record.content)) {
    const content = record.content as BackendAdminSupportContactRequest[];
    return {
      items: content.map(mapBackendSupportContactRequest),
      pageNumber: Math.max(0, toNumber(record.pageNumber, params?.page ?? 0)),
      pageSize: Math.max(1, toNumber(record.pageSize, params?.size ?? 12)),
      totalElements: Math.max(0, toNumber(record.totalElements, content.length)),
      totalPages: Math.max(0, toNumber(record.totalPages, 0)),
      first: toBoolean(record.first, toNumber(record.pageNumber, 0) === 0),
      last: toBoolean(record.last, false),
      empty: toBoolean(record.empty, content.length === 0),
    };
  }

  const collection = parseCollection<BackendAdminSupportContactRequest>(unwrapped);
  if (!collection) {
    return null;
  }

  const mapped = collection.map(mapBackendSupportContactRequest);
  const normalizedSearch = params?.search?.trim().toLowerCase() || '';

  const filtered = mapped
    .filter((item) => (params?.status ? item.status === params.status : true))
    .filter((item) => {
      if (!normalizedSearch) return true;
      return [
        item.subject,
        item.fullName,
        item.email,
        item.preview,
        item.sourcePage,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    })
    .sort((left, right) => compareDateDesc(left.createdAt, right.createdAt));

  const fallbackPage = buildPageFromItems(
    filtered,
    params?.page ?? 0,
    params?.size ?? 12,
  );

  return {
    items: fallbackPage.items,
    pageNumber: fallbackPage.pageNumber,
    pageSize: fallbackPage.pageSize,
    totalElements: fallbackPage.totalElements,
    totalPages: fallbackPage.totalPages,
    first: fallbackPage.first,
    last: fallbackPage.last,
    empty: fallbackPage.empty,
  };
}

function parseContactDetail(payload: unknown): AdminSupportContactRequestDetail | null {
  const unwrapped = unwrapPayload<BackendAdminSupportContactRequestDetail>(payload);
  const record = asRecord(unwrapped);
  if (!record) return null;
  return mapBackendSupportContactRequestDetail(record as BackendAdminSupportContactRequestDetail);
}

function parseNewsletterPage(
  payload: unknown,
  params?: AdminNewsletterQueryParams,
): AdminNewsletterSubscriptionsPage | null {
  const unwrapped = unwrapPayload(payload);
  const record = asRecord(unwrapped);

  if (record && Array.isArray(record.content)) {
    const content = record.content as BackendAdminNewsletterSubscription[];
    return {
      items: content.map(mapBackendNewsletterSubscription),
      pageNumber: Math.max(0, toNumber(record.pageNumber, params?.page ?? 0)),
      pageSize: Math.max(1, toNumber(record.pageSize, params?.size ?? 8)),
      totalElements: Math.max(0, toNumber(record.totalElements, content.length)),
      totalPages: Math.max(0, toNumber(record.totalPages, 0)),
      first: toBoolean(record.first, toNumber(record.pageNumber, 0) === 0),
      last: toBoolean(record.last, false),
      empty: toBoolean(record.empty, content.length === 0),
    };
  }

  const collection = parseCollection<BackendAdminNewsletterSubscription>(unwrapped);
  if (!collection) {
    return null;
  }

  const mapped = collection.map(mapBackendNewsletterSubscription);
  const normalizedSearch = params?.search?.trim().toLowerCase() || '';

  const filtered = mapped
    .filter((item) => {
      if (params?.active === undefined) return true;
      return item.active === params.active;
    })
    .filter((item) => {
      if (!normalizedSearch) return true;
      return [item.email, item.sourcePage]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    })
    .sort((left, right) => compareDateDesc(left.updatedAt, right.updatedAt));

  const fallbackPage = buildPageFromItems(
    filtered,
    params?.page ?? 0,
    params?.size ?? 8,
  );

  return {
    items: fallbackPage.items,
    pageNumber: fallbackPage.pageNumber,
    pageSize: fallbackPage.pageSize,
    totalElements: fallbackPage.totalElements,
    totalPages: fallbackPage.totalPages,
    first: fallbackPage.first,
    last: fallbackPage.last,
    empty: fallbackPage.empty,
  };
}

function buildParseError(message: string): FetchBaseQueryError {
  return {
    status: 'PARSING_ERROR',
    originalStatus: 200,
    data: '',
    error: message,
  };
}

function extractBackendErrorMessage(error: FetchBaseQueryError): string {
  const data = error.data;
  if (!data) return '';

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const messageValue = record.message;
    const errorValue = record.error;
    if (typeof messageValue === 'string') {
      return messageValue;
    }
    if (typeof errorValue === 'string') {
      return errorValue;
    }
  }

  return '';
}

function isStaticResourceNotFound(error: FetchBaseQueryError): boolean {
  if (error.status !== 500) {
    return false;
  }

  const message = extractBackendErrorMessage(error).toLowerCase();
  return message.includes('no static resource') || message.includes('endpoint non trouve');
}

function isFallbackCandidateStatus(error: FetchBaseQueryError): boolean {
  const status = error.status;
  if (status === 404 || status === 405) {
    return true;
  }

  if (typeof status === 'string' && status.toUpperCase() === 'PARSING_ERROR') {
    return true;
  }

  return isStaticResourceNotFound(error);
}

async function tryMultiplePaths<T>(
  baseQuery: (
    args: string | { url: string; method?: string; params?: Record<string, unknown>; body?: unknown },
  ) => Promise<{ data?: unknown; error?: unknown }>,
  paths: string[],
  request: { method?: string; params?: Record<string, unknown>; body?: unknown },
  parser: (payload: unknown) => T | null,
): Promise<{ data?: T; error?: FetchBaseQueryError }> {
  let firstError: FetchBaseQueryError | undefined;
  let parseFailed = false;

  for (let index = 0; index < paths.length; index += 1) {
    const path = paths[index];
    const result = await baseQuery({
      url: path,
      method: request.method,
      params: request.params,
      body: request.body,
    });

    if (result.data !== undefined) {
      const parsed = parser(result.data);
      if (parsed) {
        return { data: parsed };
      }
      parseFailed = true;
      continue;
    }

    if (result.error) {
      const normalizedError = result.error as FetchBaseQueryError;
      if (!firstError) {
        firstError = normalizedError;
      }

      const isNotFound = isFallbackCandidateStatus(normalizedError);

      // If the canonical endpoint fails with a non-404/405 server/client error,
      // do not continue to fallback routes that may produce noisy "No static resource" errors.
      if (index === 0 && !isNotFound) {
        return { error: normalizedError };
      }
    }
  }

  if (firstError) {
    return { error: firstError };
  }

  if (parseFailed) {
    return { error: buildParseError('Support payload shape is unsupported for this endpoint.') };
  }

  return {
    error: buildParseError('Unable to parse support payload from backend.'),
  };
}

async function runSupportContactMutation(
  baseQuery: (
    args: string | { url: string; method?: string; params?: Record<string, unknown>; body?: unknown },
  ) => Promise<{ data?: unknown; error?: unknown }>,
  id: string,
  suffix: string,
  method: 'PATCH' | 'POST',
  body: unknown,
): Promise<{ error?: FetchBaseQueryError }> {
  let firstError: FetchBaseQueryError | undefined;

  for (let index = 0; index < SUPPORT_CONTACTS_PATHS.length; index += 1) {
    const basePath = SUPPORT_CONTACTS_PATHS[index];
    const result = await baseQuery({
      url: `${basePath}/${id}/${suffix}`,
      method,
      body,
    });

    if (!result.error) {
      return {};
    }

    const normalizedError = result.error as FetchBaseQueryError;
    if (!firstError) {
      firstError = normalizedError;
    }

    const isNotFound = isFallbackCandidateStatus(normalizedError);

    if (index === 0 && !isNotFound) {
      return { error: normalizedError };
    }
  }

  return {
    error: firstError ?? buildParseError('Unable to reach support contact mutation endpoint.'),
  };
}

export const adminSupportApi = createApi({
  reducerPath: 'adminSupportApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['AdminSupportOverview', 'AdminSupportContacts', 'AdminNewsletter'],
  endpoints: (builder) => ({
    getAdminSupportOverview: builder.query<AdminSupportOverview, void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        const result = await tryMultiplePaths(
          (args) => baseQuery(args),
          SUPPORT_OVERVIEW_PATHS,
          {},
          parseOverview,
        );

        if (result.error || !result.data) {
          return {
            error: result.error ?? buildParseError('Unable to parse support overview response.'),
          };
        }

        return { data: result.data };
      },
      providesTags: [{ type: 'AdminSupportOverview', id: 'CURRENT' }],
    }),

    getAdminSupportContacts: builder.query<
      AdminSupportContactsPage,
      AdminSupportQueryParams | void
    >({
      queryFn: async (params, _api, _extraOptions, baseQuery) => {
        const requestParams = {
          page: params?.page ?? 0,
          size: params?.size ?? 12,
          sortBy: params?.sortBy ?? 'createdAt',
          sortDir: params?.sortDir ?? 'DESC',
          status: params?.status,
          search: params?.search || undefined,
        };

        const result = await tryMultiplePaths(
          (args) => baseQuery(args),
          SUPPORT_CONTACTS_PATHS,
          { params: requestParams },
          (payload) => parseContactsPage(payload, params),
        );

        if (result.error || !result.data) {
          return {
            error: result.error ?? buildParseError('Unable to parse support contacts response.'),
          };
        }

        return { data: result.data };
      },
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
      queryFn: async (id, _api, _extraOptions, baseQuery) => {
        const pathCandidates = SUPPORT_CONTACTS_PATHS.map((basePath) => `${basePath}/${id}`);
        const result = await tryMultiplePaths(
          (args) => baseQuery(args),
          pathCandidates,
          {},
          parseContactDetail,
        );

        if (result.error || !result.data) {
          return {
            error: result.error ?? buildParseError('Unable to parse support ticket details.'),
          };
        }

        return { data: result.data };
      },
      providesTags: (_result, _error, id) => [{ type: 'AdminSupportContacts', id }],
    }),

    updateAdminSupportContactStatus: builder.mutation<
      void,
      { id: string; payload: AdminSupportStatusUpdatePayload }
    >({
      queryFn: async ({ id, payload }, _api, _extraOptions, baseQuery) => {
        const result = await runSupportContactMutation(
          (args) => baseQuery(args),
          id,
          'status',
          'PATCH',
          payload,
        );

        if (result.error) {
          return { error: result.error };
        }

        return { data: undefined };
      },
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
      queryFn: async ({ id, payload }, _api, _extraOptions, baseQuery) => {
        const result = await runSupportContactMutation(
          (args) => baseQuery(args),
          id,
          'workflow',
          'PATCH',
          payload,
        );

        if (result.error) {
          return { error: result.error };
        }

        return { data: undefined };
      },
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
      queryFn: async ({ id, payload }, _api, _extraOptions, baseQuery) => {
        const result = await runSupportContactMutation(
          (args) => baseQuery(args),
          id,
          'reply',
          'POST',
          payload,
        );

        if (result.error) {
          return { error: result.error };
        }

        return { data: undefined };
      },
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
      queryFn: async (params, _api, _extraOptions, baseQuery) => {
        const requestParams = {
          page: params?.page ?? 0,
          size: params?.size ?? 8,
          sortBy: params?.sortBy ?? 'updatedAt',
          sortDir: params?.sortDir ?? 'DESC',
          active: params?.active,
          search: params?.search || undefined,
        };

        const result = await tryMultiplePaths(
          (args) => baseQuery(args),
          SUPPORT_NEWSLETTER_PATHS,
          { params: requestParams },
          (payload) => parseNewsletterPage(payload, params),
        );

        if (result.error || !result.data) {
          return {
            error: result.error ?? buildParseError('Unable to parse newsletter subscriptions response.'),
          };
        }

        return { data: result.data };
      },
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
