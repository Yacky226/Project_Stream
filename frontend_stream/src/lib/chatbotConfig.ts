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

// Configuration par défaut
export const defaultConfig: ChatbotConfig = {
  provider: 'mock', // Mode démo par défaut
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 500,
  systemPrompt: `Tu es un assistant virtuel pour Stream Éducatif, une plateforme de streaming éducatif en direct.

Tu dois aider les utilisateurs avec :
- Navigation sur la plateforme
- Informations sur les cours disponibles
- Assistance technique pour le streaming
- Questions sur les fonctionnalités
- Support pour les enseignants et étudiants

Tu es bilingue (français/anglais), professionnel, amical et concis dans tes réponses.
Si tu ne connais pas la réponse, redirige l'utilisateur vers le support technique.`
};

// Configuration pour différents providers
export const providerConfigs: Record<ChatbotProvider, Partial<ChatbotConfig>> = {
  openai: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 500
  },
  anthropic: {
    model: 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 500
  },
  gemini: {
    model: 'gemini-pro',
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
  mock: '/api/mock-chat' // Endpoint local pour le mode démo
};

/**
 * Récupère la configuration complète pour un provider
 */
export function getProviderConfig(provider: ChatbotProvider): ChatbotConfig {
  return {
    ...defaultConfig,
    ...providerConfigs[provider],
    provider
  };
}

/**
 * Valide si une API key est configurée pour le provider actuel
 */
export function isApiKeyConfigured(provider: ChatbotProvider): boolean {
  if (provider === 'mock') return true;
  
  const envKeyMap: Record<ChatbotProvider, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    gemini: 'GEMINI_API_KEY',
    mock: ''
  };
  
  const envKey = envKeyMap[provider];
  return !!envKey && typeof window === 'undefined'; // Vérifie côté serveur
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
      // Claude utilise un format légèrement différent
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
