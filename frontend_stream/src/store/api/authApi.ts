import { createApi } from '@reduxjs/toolkit/query/react';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { baseQueryWithAuth, multipartBaseQuery } from './apiClient';
import type {
  AuthResponse,
  BackendAuthResponse,
  LoginCredentials,
  PasswordReset,
  RegisterData,
  RegisterTeacherData,
  User,
} from '../../types/auth';
import {
  buildDisplayName,
  normalizeAuthResponse,
} from '../../types/auth';
import type { BackendProfileResponse } from '../../types/user';
import { normalizeUserProfile } from '../../types/user';

const LOGIN_ENDPOINT = '/api/auth/login';
const REGISTER_STUDENT_ENDPOINT = '/api/auth/register-etudiant';
const REGISTER_TEACHER_ENDPOINT = '/api/auth/register-enseignant';
const PROFILE_ENDPOINT = '/api/utilisateurs/profil';

async function enrichUserProfile(
  auth: AuthResponse,
  executeQuery: (args: string | FetchArgs) => Promise<{ data?: unknown; error?: unknown }>,
): Promise<AuthResponse> {
  const profileResult = await executeQuery({
    url: PROFILE_ENDPOINT,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });

  if (!profileResult.data || (profileResult as { error?: unknown }).error) {
    return auth;
  }

  const backendProfile = profileResult.data as BackendProfileResponse;
  if (!backendProfile?.data) {
    return auth;
  }

  return {
    ...auth,
    user: normalizeUserProfile(backendProfile.data),
  };
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Auth', 'User'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      queryFn: async (credentials, api, extraOptions, baseQuery) => {
        const loginResult = await baseQuery({
          url: LOGIN_ENDPOINT,
          method: 'POST',
          body: {
            email: credentials.email,
            password: credentials.password,
          },
        });

        if (loginResult.error || !loginResult.data) {
          return { error: loginResult.error };
        }

        const normalized = normalizeAuthResponse(
          loginResult.data as BackendAuthResponse,
        );

        const withProfile = await enrichUserProfile(normalized, (args) =>
          baseQuery(args),
        );

        return { data: withProfile };
      },
      invalidatesTags: ['Auth', 'User'],
    }),

    register: builder.mutation<AuthResponse, RegisterData>({
      queryFn: async (userData, api, extraOptions, baseQuery) => {
        const firstName = userData.firstName.trim();
        const lastName = userData.lastName.trim();
        const dto = {
          prenom: firstName,
          nom: lastName,
          email: userData.email,
          password: userData.password,
          role: 'ETUDIANT',
          niveau: userData.niveau || 'DEBUTANT',
          dateNaissance: userData.dateNaissance || null,
        };

        const formData = new FormData();
        formData.append('dto', JSON.stringify(dto));

        const registerResult = await multipartBaseQuery(
          {
            url: REGISTER_STUDENT_ENDPOINT,
            method: 'POST',
            body: formData,
          },
          api,
          extraOptions,
        );

        if (registerResult.error) {
          return { error: registerResult.error };
        }

        const loginResult = await baseQuery({
          url: LOGIN_ENDPOINT,
          method: 'POST',
          body: {
            email: userData.email,
            password: userData.password,
          },
        });

        if (loginResult.error || !loginResult.data) {
          return { error: loginResult.error };
        }

        const normalized = normalizeAuthResponse(
          loginResult.data as BackendAuthResponse,
          {
            firstName,
            lastName,
            nom: buildDisplayName(firstName, lastName),
          },
        );

        const withProfile = await enrichUserProfile(normalized, (args) =>
          baseQuery(args),
        );

        return { data: withProfile };
      },
      invalidatesTags: ['Auth', 'User'],
    }),

    registerTeacher: builder.mutation<{ success: boolean }, RegisterTeacherData>({
      queryFn: async (userData, api, extraOptions) => {
        const normalizedNom = userData.nom.trim().replace(/\s+/g, ' ');
        const hasMultipleParts = normalizedNom.includes(' ');
        const [fallbackPrenom, ...fallbackNomParts] = normalizedNom.split(' ');
        const prenom = userData.prenom?.trim() || fallbackPrenom || 'Prof';
        const nom = hasMultipleParts
          ? fallbackNomParts.join(' ').trim() || fallbackPrenom
          : normalizedNom;

        const formData = new FormData();
        formData.append(
          'dto',
          JSON.stringify({
            prenom,
            nom,
            email: userData.email,
            password: userData.password,
            role: 'ENSEIGNANT',
            specialite: userData.specialite,
            dateNaissance: userData.dateNaissance || null,
          }),
        );

        const result = await multipartBaseQuery(
          {
            url: REGISTER_TEACHER_ENDPOINT,
            method: 'POST',
            body: formData,
          },
          api,
          extraOptions,
        );

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as { success: boolean } };
      },
      invalidatesTags: ['Auth'],
    }),

    refreshToken: builder.mutation<AuthResponse, { refreshToken: string }>({
      queryFn: async (payload, api, extraOptions, baseQuery) => {
        const refreshResult = await baseQuery({
          url: '/api/auth/refresh-token',
          method: 'POST',
          body: { refreshToken: payload.refreshToken },
        });

        if (refreshResult.error || !refreshResult.data) {
          return { error: refreshResult.error };
        }

        const normalized = normalizeAuthResponse(
          refreshResult.data as BackendAuthResponse,
        );

        return { data: normalized };
      },
    }),

    logout: builder.mutation<void, { refreshToken?: string | null }>({
      query: (data) => ({
        url: '/api/auth/logout',
        method: 'POST',
        body: data.refreshToken ? { refreshToken: data.refreshToken } : {},
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: '/api/auth/forgot-password',
        method: 'POST',
        body: { email: data.email },
      }),
    }),

    resetPassword: builder.mutation<{ message: string }, PasswordReset>({
      query: (data) => ({
        url: '/api/auth/reset-password',
        method: 'POST',
        body: {
          token: data.token,
          newPassword: data.newPassword || data.password,
        },
      }),
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => PROFILE_ENDPOINT,
      transformResponse: (response: BackendProfileResponse): User =>
        normalizeUserProfile(response.data),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRegisterTeacherMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
} = authApi;
