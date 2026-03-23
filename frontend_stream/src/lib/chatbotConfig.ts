/**
 * Configuration pour les services de chatbot
 * Supporte OpenAI, Anthropic Claude, et Google Gemini
 */

export type ChatbotProvider = 'openai' | 'anthropic' | 'gemini' | 'mock';

export interface ChatbotConfig {
  provider: ChatbotProvider;
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

type EnvRecord = Record<string, string | undefined>;

function readBuildEnv(key: string): string | undefined {
  const env = import.meta.env as EnvRecord;
  const value = env?.[key];
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = readBuildEnv(key);
  if (!value) {
    return defaultValue;
  }

  const normalized = value.toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function normalizeProvider(value?: string): ChatbotProvider | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();
  if (normalized === 'openai' || normalized === 'anthropic' || normalized === 'gemini' || normalized === 'mock') {
    return normalized;
  }

  return undefined;
}

function resolveDefaultProvider(): ChatbotProvider {
  const explicitProvider = normalizeProvider(readBuildEnv('VITE_CHATBOT_PROVIDER'));
  if (explicitProvider) {
    return explicitProvider;
  }

  if (readBuildEnv('VITE_GEMINI_API_KEY')) {
    return 'gemini';
  }
  if (readBuildEnv('VITE_OPENAI_API_KEY')) {
    return 'openai';
  }
  if (readBuildEnv('VITE_ANTHROPIC_API_KEY')) {
    return 'anthropic';
  }

  if (readBooleanEnv('VITE_CHATBOT_STRICT_API', true) && readBooleanEnv('VITE_CHATBOT_BACKEND_PROXY', true)) {
    return 'gemini';
  }

  return 'mock';
}

function resolveDefaultModel(provider: ChatbotProvider): string {
  switch (provider) {
    case 'openai':
      return readBuildEnv('VITE_CHATBOT_MODEL_OPENAI') || 'gpt-4o-mini';
    case 'anthropic':
      return readBuildEnv('VITE_CHATBOT_MODEL_ANTHROPIC') || 'claude-3-5-sonnet-latest';
    case 'gemini':
      return readBuildEnv('VITE_CHATBOT_MODEL_GEMINI') || 'gemini-2.5-flash';
    default:
      return 'mock-model';
  }
}

const providerApiKeyEnvMap: Record<ChatbotProvider, string> = {
  openai: 'VITE_OPENAI_API_KEY',
  anthropic: 'VITE_ANTHROPIC_API_KEY',
  gemini: 'VITE_GEMINI_API_KEY',
  mock: '',
};

export function getProviderApiKey(provider: ChatbotProvider): string | undefined {
  if (provider === 'mock') {
    return undefined;
  }

  return readBuildEnv(providerApiKeyEnvMap[provider]);
}

export function getEnvChatbotProvider(): ChatbotProvider {
  return resolveDefaultProvider();
}

export function isStrictApiModeEnabled(): boolean {
  return readBooleanEnv('VITE_CHATBOT_STRICT_API', true);
}

export function isBackendProxyEnabled(): boolean {
  return readBooleanEnv('VITE_CHATBOT_BACKEND_PROXY', true);
}

const initialProvider = resolveDefaultProvider();

// Configuration par defaut
export const defaultConfig: ChatbotConfig = {
  provider: initialProvider,
  model: resolveDefaultModel(initialProvider),
  temperature: 0.7,
  maxTokens: 500,
  systemPrompt: `Tu es un assistant virtuel pour Stream Educatif, une plateforme de streaming educatif en direct.

Tu dois aider les utilisateurs avec :
- Navigation sur la plateforme
- Informations sur les cours disponibles
- Assistance technique pour le streaming
- Questions sur les fonctionnalites
- Support pour les enseignants et etudiants

Tu es bilingue (francais/anglais), professionnel, amical et concis dans tes reponses.
Si tu ne connais pas la reponse, redirige l'utilisateur vers le support technique.`
};

// Configuration pour differents providers
export const providerConfigs: Record<ChatbotProvider, Partial<ChatbotConfig>> = {
  openai: {
    model: resolveDefaultModel('openai'),
    temperature: 0.7,
    maxTokens: 500
  },
  anthropic: {
    model: resolveDefaultModel('anthropic'),
    temperature: 0.7,
    maxTokens: 500
  },
  gemini: {
    model: resolveDefaultModel('gemini'),
    temperature: 0.7,
    maxTokens: 500
  },
  mock: {
    model: 'mock-model',
    temperature: 0.7,
    maxTokens: 500
  }
};

// Endpoints API
export const providerEndpoints: Record<ChatbotProvider, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
  mock: '/api/mock-chat' // Endpoint local pour le mode demo
};

/**
 * Recupere la configuration complete pour un provider
 */
export function getProviderConfig(provider: ChatbotProvider): ChatbotConfig {
  const config = {
    ...defaultConfig,
    ...providerConfigs[provider],
    provider
  };

  const apiKey = getProviderApiKey(provider);
  if (apiKey) {
    config.apiKey = apiKey;
  }

  return config;
}

/**
 * Valide si une API key est configuree pour le provider actuel
 */
export function isApiKeyConfigured(provider: ChatbotProvider): boolean {
  if (provider === 'mock') {
    return true;
  }

  return Boolean(getProviderApiKey(provider));
}

/**
 * Format des messages selon le provider
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Transforme les messages au format du provider
 */
export function formatMessagesForProvider(
  messages: ChatMessage[],
  provider: ChatbotProvider
): any {
  switch (provider) {
    case 'openai':
      return messages;
    
    case 'anthropic':
      // Claude utilise un format legerement different
      return {
        messages: messages.filter(m => m.role !== 'system'),
        system: messages.find(m => m.role === 'system')?.content
      };
    
    case 'gemini':
      // Gemini utilise 'user' et 'model' au lieu de 'assistant'
      return messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }]
      }));
    
    default:
      return messages;
  }
}
