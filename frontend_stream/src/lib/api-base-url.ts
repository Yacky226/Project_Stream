const DEFAULT_API_BASE_URL = 'http://localhost:8080';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function readRuntimeEnv(key: string): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const runtimeEnv = (window as { __ENV__?: Record<string, string> }).__ENV__;
  return runtimeEnv?.[key];
}

function readBuildEnv(key: string): string | undefined {
  const env = import.meta.env as Record<string, string | undefined>;
  return env?.[key];
}

function readEnv(key: string): string | undefined {
  return readBuildEnv(key) || readRuntimeEnv(key);
}

export function resolveApiBaseUrl(): string {
  const rawValue =
    readEnv('VITE_API_BASE_URL') ||
    readEnv('VITE_API_URL') ||
    readEnv('REACT_APP_BACKEND_URL') ||
    DEFAULT_API_BASE_URL;

  return trimTrailingSlash(rawValue);
}

export function buildApiUrl(path: string): string {
  const baseUrl = resolveApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export const API_BASE_URL = resolveApiBaseUrl();
