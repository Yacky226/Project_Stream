import { API_BASE_URL } from './api-base-url';

type AppEnvironment = 'development' | 'production' | 'test';

function resolveEnvironment(): AppEnvironment {
  const env = import.meta.env.MODE;
  if (env === 'production' || env === 'test') {
    return env;
  }
  return 'development';
}

export const config = {
  APP_NAME: 'Stream Educatif',
  ENVIRONMENT: resolveEnvironment(),
  API_BASE_URL,
} as const;

export const configUtils = {
  isDevelopment: () => config.ENVIRONMENT === 'development',
  isProduction: () => config.ENVIRONMENT === 'production',
  log: (...args: unknown[]) => {
    if (configUtils.isDevelopment()) {
      console.log('[StreamEdu]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (configUtils.isDevelopment()) {
      console.warn('[StreamEdu]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error('[StreamEdu]', ...args);
  },
  debug: (...args: unknown[]) => {
    if (configUtils.isDevelopment()) {
      console.debug('[StreamEdu Debug]', ...args);
    }
  },
};

