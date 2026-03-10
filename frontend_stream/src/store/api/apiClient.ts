/**
 * Centralized API client for RTK Query.
 * Transport-only responsibility: headers, retries, and auth error handling.
 */
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { API_BASE_URL } from '../../lib/api-base-url';

const CLEAR_AUTH_ACTION_TYPE = 'auth/clearAuth';
const AUTH_PUBLIC_ENDPOINTS = new Set([
  '/api/auth/login',
  '/api/auth/register-etudiant',
  '/api/auth/register-enseignant',
  '/api/auth/register-admin',
  '/api/auth/refresh-token',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
]);

function extractRequestPath(args: string | FetchArgs): string {
  if (typeof args === 'string') {
    return args;
  }

  return args.url;
}

function shouldClearAuthOnUnauthorized(args: string | FetchArgs): boolean {
  const requestPath = extractRequestPath(args).split('?')[0];
  return !AUTH_PUBLIC_ENDPOINTS.has(requestPath);
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state?.auth?.token;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Accept', 'application/json');

    return headers;
  },
});

export const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error) {
      if (result.error.status === 401 && shouldClearAuthOnUnauthorized(args)) {
        api.dispatch({ type: CLEAR_AUTH_ACTION_TYPE });
        return result;
      }

      if (
        typeof result.error.status === 'number' &&
        result.error.status >= 400 &&
        result.error.status < 500
      ) {
        return result;
      }

      if (attempt < maxRetries - 1) {
        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }
    }

    return result;
  }

  return await rawBaseQuery(args, api, extraOptions);
};

const rawMultipartBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state?.auth?.token;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    headers.set('Accept', 'application/json');

    return headers;
  },
});

export const multipartBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  return rawMultipartBaseQuery(args, api, extraOptions);
};

export { API_BASE_URL };
