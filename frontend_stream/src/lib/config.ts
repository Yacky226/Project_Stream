/**
 * Configuration centralisée pour Stream Éducatif
 */

// Types de configuration
export interface AppConfig {
  // API Configuration
  API_URL: string;
  API_TIMEOUT: number;
  
  // Streaming Configuration
  STREAMING_SERVER_URL: string;
  JANUS_GATEWAY_URL: string;
  
  // WebRTC Configuration
  WEBRTC_CONFIG: RTCConfiguration;
  
  // Application Settings
  APP_NAME: string;
  APP_VERSION: string;
  APP_DESCRIPTION: string;
  
  // Environment
  ENVIRONMENT: 'development' | 'production' | 'test';
  
  // Feature Flags
  FEATURES: {
    LIVE_STREAMING: boolean;
    CHAT: boolean;
    QA: boolean;
    RECORDING: boolean;
    ANALYTICS: boolean;
    NOTIFICATIONS: boolean;
  };
  
  // Development Settings
  DEVELOPMENT: {
    ENABLE_LOGS: boolean;
    MOCK_API: boolean;
    DEBUG_MODE: boolean;
    USE_MOCK_DATA: boolean;
  };
  
  // Backend Integration
  BACKEND: {
    ENABLED: boolean;
    SPRING_BOOT_URL: string;
    WEBSOCKET_URL: string;
    TIMEOUT: number;
    RETRY_ATTEMPTS: number;
  };
}

// Environment detection
const getEnvironment = (): 'development' | 'production' | 'test' => {
  if (typeof process !== 'undefined' && process.env) {
    return (process.env.NODE_ENV as any) || 'development';
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'development';
  }
  return 'production';
};

const environment = getEnvironment();

// Environment variables helper
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof window !== 'undefined') {
    // Client-side: Check for build-time environment variables
    return (window as any).__ENV__?.[key] || defaultValue;
  }
  return defaultValue;
};

// Default configuration values
const defaultConfig: AppConfig = {
  // API Configuration - utilise le serveur proxy Supabase par défaut
  API_URL: '/functions/v1/make-server-a01b5ee4',
  API_TIMEOUT: 30000, // 30 seconds
  
  // Streaming Configuration
  STREAMING_SERVER_URL: environment === 'production'
    ? 'wss://stream.streameducatif.com'
    : 'ws://localhost:8088',
  JANUS_GATEWAY_URL: environment === 'production'
    ? 'https://janus.streameducatif.com:8089/janus'
    : 'http://localhost:8088/janus',
  
  // WebRTC Configuration
  WEBRTC_CONFIG: {
    iceServers: [
      { 
        urls: 'stun:stun.l.google.com:19302'
      },
      {
        urls: 'turn:relay.metered.ca:80',
        username: 'e8b3f5b2b85b9e0c7d4a1f3e',
        credential: 'wX9mK2pL8vN5qR3t'
      },
      {
        urls: 'turn:relay.metered.ca:443',
        username: 'e8b3f5b2b85b9e0c7d4a1f3e',
        credential: 'wX9mK2pL8vN5qR3t'
      }
    ],
    iceCandidatePoolSize: 10
  },
  
  // Application Settings
  APP_NAME: 'Stream Éducatif',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Plateforme de streaming de cours en direct et en replay',
  ENVIRONMENT: environment,
  
  // Feature Flags
  FEATURES: {
    LIVE_STREAMING: true,
    CHAT: true,
    QA: true,
    RECORDING: true,
    ANALYTICS: true,
    NOTIFICATIONS: true
  },
  
  // Development Settings
  DEVELOPMENT: {
    ENABLE_LOGS: environment === 'development',
    MOCK_API: environment === 'development',
    DEBUG_MODE: environment === 'development',
    USE_MOCK_DATA: true // Par défaut, utiliser les mocks jusqu'à ce que le backend soit connecté
  },
  
  // Backend Integration
  BACKEND: {
    ENABLED: false, // Désactivé par défaut, sera activé quand le backend sera prêt
    SPRING_BOOT_URL: getEnvVar('REACT_APP_BACKEND_URL', 'http://localhost:8080'),
    WEBSOCKET_URL: getEnvVar('REACT_APP_WEBSOCKET_URL', 'ws://localhost:8080/ws'),
    TIMEOUT: 15000,
    RETRY_ATTEMPTS: 3
  }
};

// Environment-specific overrides
const environmentConfig: Partial<AppConfig> = {};

// Production overrides
if (environment === 'production') {
  environmentConfig.DEVELOPMENT = {
    ENABLE_LOGS: false,
    MOCK_API: false,
    DEBUG_MODE: false,
    USE_MOCK_DATA: false
  };
  environmentConfig.BACKEND = {
    ...defaultConfig.BACKEND,
    ENABLED: true, // Activer le backend en production
    SPRING_BOOT_URL: getEnvVar('REACT_APP_BACKEND_URL', 'https://api.streameducatif.com'),
    WEBSOCKET_URL: getEnvVar('REACT_APP_WEBSOCKET_URL', 'wss://api.streameducatif.com/ws')
  };
}

// Test environment overrides
if (environment === 'test') {
  environmentConfig.API_URL = 'http://localhost:3001';
  environmentConfig.DEVELOPMENT = {
    ENABLE_LOGS: true,
    MOCK_API: true,
    DEBUG_MODE: true,
    USE_MOCK_DATA: true
  };
}

// Merge configurations
export const config: AppConfig = {
  ...defaultConfig,
  ...environmentConfig
};

// Configuration utilities
export const configUtils = {
  isProduction: () => config.ENVIRONMENT === 'production',
  isDevelopment: () => config.ENVIRONMENT === 'development',
  isTest: () => config.ENVIRONMENT === 'test',
  
  // Feature flag helpers
  isFeatureEnabled: (feature: keyof AppConfig['FEATURES']) => config.FEATURES[feature],
  
  // Backend helpers
  isBackendEnabled: () => config.BACKEND.ENABLED,
  shouldUseMockData: () => config.DEVELOPMENT.USE_MOCK_DATA,
  
  // API helpers
  getApiUrl: (endpoint: string = '') => {
    const baseUrl = config.BACKEND.ENABLED ? config.BACKEND.SPRING_BOOT_URL : config.API_URL;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${cleanBase}${cleanEndpoint}`;
  },
  
  getStreamingUrl: (path: string = '') => `${config.STREAMING_SERVER_URL}${path}`,
  getJanusUrl: () => config.JANUS_GATEWAY_URL,
  getWebSocketUrl: () => config.BACKEND.WEBSOCKET_URL,
  
  // Environment detection
  getEnvironment: () => config.ENVIRONMENT,
  
  // Logging helpers
  log: (...args: any[]) => {
    if (config.DEVELOPMENT.ENABLE_LOGS) {
      console.log('[StreamEdu]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (config.DEVELOPMENT.ENABLE_LOGS) {
      console.warn('[StreamEdu]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    console.error('[StreamEdu]', ...args);
  },
  
  debug: (...args: any[]) => {
    if (config.DEVELOPMENT.DEBUG_MODE) {
      console.debug('[StreamEdu Debug]', ...args);
    }
  },
  
  // Configuration validation
  validateConfig: () => {
    const errors: string[] = [];
    
    if (!config.API_URL) {
      errors.push('API_URL is required');
    }
    
    if (config.BACKEND.ENABLED && !config.BACKEND.SPRING_BOOT_URL) {
      errors.push('SPRING_BOOT_URL is required when backend is enabled');
    }
    
    if (errors.length > 0) {
      console.error('Configuration validation errors:', errors);
      return false;
    }
    
    return true;
  },
  
  // Runtime configuration updates
  enableBackend: (backendUrl?: string, websocketUrl?: string) => {
    config.BACKEND.ENABLED = true;
    config.DEVELOPMENT.USE_MOCK_DATA = false;
    
    if (backendUrl) {
      config.BACKEND.SPRING_BOOT_URL = backendUrl;
    }
    
    if (websocketUrl) {
      config.BACKEND.WEBSOCKET_URL = websocketUrl;
    }
    
    configUtils.log('Backend integration enabled:', {
      backendUrl: config.BACKEND.SPRING_BOOT_URL,
      websocketUrl: config.BACKEND.WEBSOCKET_URL
    });
  },
  
  disableBackend: () => {
    config.BACKEND.ENABLED = false;
    config.DEVELOPMENT.USE_MOCK_DATA = true;
    
    configUtils.log('Backend integration disabled, using mock data');
  }
};

// Export individual config sections for convenience
export const apiConfig = {
  url: config.API_URL,
  timeout: config.API_TIMEOUT,
  backendUrl: config.BACKEND.SPRING_BOOT_URL,
  isBackendEnabled: config.BACKEND.ENABLED
};

export const streamingConfig = {
  serverUrl: config.STREAMING_SERVER_URL,
  janusUrl: config.JANUS_GATEWAY_URL,
  webrtcConfig: config.WEBRTC_CONFIG,
  websocketUrl: config.BACKEND.WEBSOCKET_URL
};

export const appInfo = {
  name: config.APP_NAME,
  version: config.APP_VERSION,
  description: config.APP_DESCRIPTION
};

export const features = config.FEATURES;
export const development = config.DEVELOPMENT;
export const backend = config.BACKEND;

// Initialize configuration validation
if (typeof window !== 'undefined') {
  // Only validate on client-side
  setTimeout(() => configUtils.validateConfig(), 1000);
  
  // Debug info en développement
  if (configUtils.isDevelopment()) {
    (window as any).STREAM_CONFIG = config;
    console.log('Stream Éducatif Configuration:', config);
  }
}

// Hook pour utiliser la configuration dans React
export function useConfig() {
  return config;
}