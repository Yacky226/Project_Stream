import { createApi } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseQueryWithAuth } from './apiClient';
import type {
  AdminRoleFilter,
  AdminUserRole,
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

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

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

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function toOptionalString(value: unknown): string | undefined {
  const normalized = toStringValue(value).trim();
  return normalized ? normalized : undefined;
}

function normalizeBackendAdminUser(raw: unknown, index: number): BackendAdminUser | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;

  const fallbackId = index + 1;
  const id = toNumber(value.id, fallbackId);

  return {
    id,
    nom: toStringValue(value.nom),
    prenom: toStringValue(value.prenom),
    email: toStringValue(value.email, `unknown-${id}@local.invalid`),
    role: toStringValue(value.role, 'ETUDIANT'),
    actif: toBoolean(value.actif, true),
    dateCreation: toOptionalString(value.dateCreation ?? value.createdAt),
    nombreCours:
      value.nombreCours !== undefined ? toNumber(value.nombreCours, 0) : undefined,
    nombreInscriptions:
      value.nombreInscriptions !== undefined ? toNumber(value.nombreInscriptions, 0) : undefined,
    nombreSessions:
      value.nombreSessions !== undefined ? toNumber(value.nombreSessions, 0) : undefined,
    specialite: toOptionalString(value.specialite),
    niveau: toOptionalString(value.niveau),
    photoProfil:
      typeof value.photoProfil === 'string' || value.photoProfil === null
        ? (value.photoProfil as string | null)
        : null,
  };
}

function mapRawUsersToAdminUsers(rows: unknown[]): AdminUser[] {
  return rows
    .map((entry, index) => normalizeBackendAdminUser(entry, index))
    .filter((entry): entry is BackendAdminUser => entry !== null)
    .map(mapBackendAdminUser);
}

function parseUsersCollection(payload: unknown): AdminUser[] | null {
  if (Array.isArray(payload)) {
    return mapRawUsersToAdminUsers(payload);
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const value = payload as Record<string, unknown>;
  if (Array.isArray(value.content)) {
    return mapRawUsersToAdminUsers(value.content);
  }
  if (Array.isArray(value.items)) {
    return mapRawUsersToAdminUsers(value.items);
  }

  return null;
}

function parseUsersPage(payload: unknown): AdminUsersPage | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const value = payload as BackendPageResponse<unknown> & Record<string, unknown>;
  if (!Array.isArray(value.content)) {
    return null;
  }

  const items = mapRawUsersToAdminUsers(value.content);
  const pageNumber = Math.max(0, toNumber(value.pageNumber, 0));
  const pageSize = Math.min(
    Math.max(1, toNumber(value.pageSize, DEFAULT_PAGE_SIZE)),
    MAX_PAGE_SIZE,
  );
  const totalElements = Math.max(0, toNumber(value.totalElements, items.length));
  const totalPages = Math.max(
    0,
    toNumber(value.totalPages, totalElements > 0 ? Math.ceil(totalElements / pageSize) : 0),
  );

  return {
    items,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    first: toBoolean(value.first, pageNumber === 0),
    last: toBoolean(value.last, totalPages <= 1 || pageNumber >= totalPages - 1),
    empty: toBoolean(value.empty, items.length === 0),
  };
}

const ROLE_FILTER_MAP: Record<AdminRoleFilter, AdminUserRole> = {
  ETUDIANT: 'student',
  ENSEIGNANT: 'teacher',
  ADMINISTRATEUR: 'admin',
};

function roleMatches(user: AdminUser, roleFilter?: AdminRoleFilter): boolean {
  if (!roleFilter) return true;
  return user.role === ROLE_FILTER_MAP[roleFilter];
}

function statusMatches(user: AdminUser, actif?: boolean): boolean {
  if (actif === undefined) return true;
  return actif ? user.status === 'active' : user.status === 'inactive';
}

function searchMatches(user: AdminUser, query?: string): boolean {
  if (!query) return true;
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [
    user.name,
    user.nom,
    user.prenom,
    user.email,
    user.role,
    user.specialite,
    user.niveau,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalized));
}

function sortableValue(user: AdminUser, sortBy?: string): number | string {
  if (sortBy === 'email') return user.email.toLowerCase();
  if (sortBy === 'nom') return (user.nom || user.name || '').toLowerCase();
  if (sortBy === 'prenom') return (user.prenom || '').toLowerCase();
  if (sortBy === 'role') return user.role;
  if (sortBy === 'dateCreation') {
    if (!user.joinDate) return 0;
    const parsed = new Date(user.joinDate).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  const parsedId = Number(user.id);
  return Number.isFinite(parsedId) ? parsedId : 0;
}

function compareValues(left: number | string, right: number | string): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  return String(left).localeCompare(String(right));
}

function applyClientPage(
  users: AdminUser[],
  params: AdminUsersQueryParams | void,
): AdminUsersPage {
  const pageSize = Math.min(
    Math.max(1, params?.size ?? DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const requestedPage = Math.max(0, params?.page ?? 0);
  const sortBy = params?.sortBy ?? 'id';
  const direction = (params?.sortDir ?? 'DESC') === 'ASC' ? 1 : -1;

  const filtered = users
    .filter((user) => roleMatches(user, params?.role))
    .filter((user) => statusMatches(user, params?.actif))
    .filter((user) => searchMatches(user, params?.search));

  const sorted = [...filtered].sort((left, right) => {
    const leftValue = sortableValue(left, sortBy);
    const rightValue = sortableValue(right, sortBy);
    return compareValues(leftValue, rightValue) * direction;
  });

  const totalElements = sorted.length;
  const totalPages = totalElements > 0 ? Math.ceil(totalElements / pageSize) : 0;
  const pageNumber = totalPages > 0 ? Math.min(requestedPage, totalPages - 1) : 0;
  const start = pageNumber * pageSize;
  const items = sorted.slice(start, start + pageSize);

  return {
    items,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    first: pageNumber === 0,
    last: totalPages === 0 || pageNumber >= totalPages - 1,
    empty: items.length === 0,
  };
}

function buildParseError(): FetchBaseQueryError {
  return {
    status: 'PARSING_ERROR',
    originalStatus: 200,
    data: '',
    error: 'Unable to parse admin users payload.',
  };
}

function shouldTryLegacyUsersEndpoint(error: FetchBaseQueryError): boolean {
  const status = error.status;
  if (status === 404 || status === 405) {
    return true;
  }
  return typeof status === 'string' && status.toUpperCase() === 'PARSING_ERROR';
}

export const adminUserApi = createApi({
  reducerPath: 'adminUserApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['AdminUsers'],
  endpoints: (builder) => ({
    getAdminUsers: builder.query<AdminUsersPage, AdminUsersQueryParams | void>({
      queryFn: async (params, _api, _extraOptions, baseQuery) => {
        const usersParams = {
          page: params?.page ?? 0,
          size: params?.size ?? DEFAULT_PAGE_SIZE,
          sortBy: params?.sortBy ?? 'id',
          sortDir: params?.sortDir ?? 'DESC',
          role: params?.role,
          actif: params?.actif,
          search: params?.search || undefined,
        };

        const primaryResult = await baseQuery({
          url: '/api/admin/users',
          params: usersParams,
        });

        let canUseLegacyFallback = true;

        if ('data' in primaryResult && primaryResult.data !== undefined) {
          const parsedPage = parseUsersPage(primaryResult.data);
          if (parsedPage) {
            return { data: parsedPage };
          }

          const parsedCollection = parseUsersCollection(primaryResult.data);
          if (parsedCollection) {
            return { data: applyClientPage(parsedCollection, params) };
          }

          canUseLegacyFallback = true;
        }

        if ('error' in primaryResult && primaryResult.error) {
          const normalizedError = primaryResult.error as FetchBaseQueryError;
          canUseLegacyFallback = shouldTryLegacyUsersEndpoint(normalizedError);
          if (!canUseLegacyFallback) {
            return { error: normalizedError };
          }
        }

        let legacyResult:
          | { data?: unknown; error?: unknown }
          | undefined;
        if (canUseLegacyFallback) {
          legacyResult = await baseQuery({
            url: '/api/admin/utilisateurs',
            params: { paginate: false },
          });
        }

        if (legacyResult && 'data' in legacyResult && legacyResult.data !== undefined) {
          const legacyCollection = parseUsersCollection(legacyResult.data);
          if (legacyCollection) {
            return { data: applyClientPage(legacyCollection, params) };
          }
        }

        if ('error' in primaryResult && primaryResult.error) {
          return { error: primaryResult.error as FetchBaseQueryError };
        }

        if (legacyResult && 'error' in legacyResult && legacyResult.error) {
          return { error: legacyResult.error as FetchBaseQueryError };
        }

        return { error: buildParseError() };
      },
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
