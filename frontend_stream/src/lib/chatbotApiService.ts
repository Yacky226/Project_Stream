/**
 * Service API abstrait pour les chatbots
 * Facilite l'integration de differents providers (OpenAI, Anthropic, Gemini)
 */

import {
  ChatbotProvider,
  ChatbotConfig,
  ChatMessage,
  defaultConfig,
  getProviderConfig,
  getProviderApiKey,
  isBackendProxyEnabled,
  isStrictApiModeEnabled,
  providerEndpoints,
  formatMessagesForProvider
} from './chatbotConfig';
import { buildApiUrl } from './api-base-url';
import { authStorage } from './localStorage';

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  content: string;
  finishReason: 'stop' | 'length' | 'error';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Service principal pour les requetes chatbot
 */
export class ChatbotApiService {
  private config: ChatbotConfig;
  private provider: ChatbotProvider;

  constructor(provider: ChatbotProvider = defaultConfig.provider, apiKey?: string) {
    this.provider = provider;
    this.config = getProviderConfig(provider);
    this.config.apiKey = apiKey || this.config.apiKey || getProviderApiKey(provider);
  }

  /**
   * Envoie un message et recoit une reponse
   */
  async sendMessage(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // Ajoute le system prompt
    const allMessages: ChatMessage[] = [
      { role: 'system', content: this.config.systemPrompt },
      ...request.messages
    ];

    try {
      if (this.provider !== 'mock' && isBackendProxyEnabled()) {
        return await this.callBackendProxy(allMessages, request);
      }

      switch (this.provider) {
        case 'openai':
          return await this.callOpenAI(allMessages, request);
        case 'anthropic':
          return await this.callAnthropic(allMessages, request);
        case 'gemini':
          return await this.callGemini(allMessages, request);
        default:
          if (isStrictApiModeEnabled()) {
            throw new Error('Strict API mode enabled: local mock provider is disabled.');
          }
          return await this.callMockAPI(allMessages, request);
      }
    } catch (error) {
      console.error('Chatbot API error:', error);
      throw error;
    }
  }

  private async callBackendProxy(
    messages: ChatMessage[],
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const auth = authStorage.loadAuthData();
    if (!auth?.token) {
      throw new Error('No authenticated session found for chatbot backend call.');
    }

    const response = await fetch(buildApiUrl('/api/chatbot/completions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
      },
      body: JSON.stringify({
        provider: this.provider,
        model: this.config.model,
        temperature: request.temperature ?? this.config.temperature,
        maxTokens: request.maxTokens ?? this.config.maxTokens,
        stream: request.stream ?? false,
        messages,
      }),
    });

    if (!response.ok) {
      const details = await this.readErrorDetails(response);
      throw new Error(`Chatbot backend error ${response.status}: ${details || response.statusText}`);
    }

    const data = await response.json();
    const content = typeof data?.content === 'string' ? data.content.trim() : '';
    if (!content) {
      throw new Error('Chatbot backend returned an empty response.');
    }

    return {
      content,
      finishReason: data?.finishReason === 'stop' ? 'stop' : 'length',
      usage: data?.usage
        ? {
            promptTokens: Number(data.usage.promptTokens ?? 0),
            completionTokens: Number(data.usage.completionTokens ?? 0),
            totalTokens: Number(data.usage.totalTokens ?? 0),
          }
        : undefined,
    };
  }

  private async readErrorDetails(response: Response): Promise<string> {
    try {
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        return text.slice(0, 240);
      }

      const data = await response.json();
      const message =
        data?.error?.message ||
        data?.error?.details ||
        data?.message ||
        JSON.stringify(data);
      return String(message).slice(0, 240);
    } catch {
      return '';
    }
  }

  /**
   * Appel a l'API OpenAI
   */
  private async callOpenAI(
    messages: ChatMessage[],
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key missing. Configure VITE_OPENAI_API_KEY.');
    }

    const response = await fetch(providerEndpoints.openai, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages,
        temperature: request.temperature ?? this.config.temperature,
        max_tokens: request.maxTokens ?? this.config.maxTokens,
        stream: request.stream ?? false
      })
    });

    if (!response.ok) {
      const details = await this.readErrorDetails(response);
      throw new Error(`OpenAI API error ${response.status}: ${details || response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      finishReason: data.choices[0].finish_reason === 'stop' ? 'stop' : 'length',
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      }
    };
  }

  /**
   * Appel a l'API Anthropic Claude
   */
  private async callAnthropic(
    messages: ChatMessage[],
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key missing. Configure VITE_ANTHROPIC_API_KEY.');
    }

    const formatted = formatMessagesForProvider(messages, 'anthropic');
    
    const response = await fetch(providerEndpoints.anthropic, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: formatted.messages,
        system: formatted.system,
        temperature: request.temperature ?? this.config.temperature,
        max_tokens: request.maxTokens ?? this.config.maxTokens
      })
    });

    if (!response.ok) {
      const details = await this.readErrorDetails(response);
      throw new Error(`Anthropic API error ${response.status}: ${details || response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.content[0].text,
      finishReason: data.stop_reason === 'end_turn' ? 'stop' : 'length',
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      }
    };
  }

  /**
   * Appel a l'API Google Gemini
   */
  private async callGemini(
    messages: ChatMessage[],
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    if (!this.config.apiKey) {
      throw new Error('Gemini API key missing. Configure VITE_GEMINI_API_KEY.');
    }

    const formatted = formatMessagesForProvider(messages, 'gemini');
    const endpoint = `${providerEndpoints.gemini}/${this.config.model}:generateContent?key=${this.config.apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: formatted,
        generationConfig: {
          temperature: request.temperature ?? this.config.temperature,
          maxOutputTokens: request.maxTokens ?? this.config.maxTokens
        }
      })
    });

    if (!response.ok) {
      const details = await this.readErrorDetails(response);
      throw new Error(`Gemini API error ${response.status}: ${details || response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.candidates[0].content.parts[0].text,
      finishReason: data.candidates[0].finishReason === 'STOP' ? 'stop' : 'length',
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: data.usageMetadata?.totalTokenCount ?? 0
      }
    };
  }

  /**
   * Mock API pour le mode demo (utilise le service existant)
   */
  private async callMockAPI(
    messages: ChatMessage[],
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    // Utilise la logique existante du chatbotService
    const { generateChatbotResponse } = await import('./chatbotService');
    const userMessage = messages[messages.length - 1].content;
    const context = {
      userRole: 'student',
      currentPage: window.location.pathname,
      conversationHistory: messages.slice(0, -1)
    };

    const response = generateChatbotResponse(userMessage, context);
    
    return {
      content: response.message,
      finishReason: 'stop',
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      }
    };
  }

  /**
   * Change le provider a la volee
   */
  switchProvider(provider: ChatbotProvider, apiKey?: string) {
    this.provider = provider;
    this.config = getProviderConfig(provider);
    this.config.apiKey = apiKey || this.config.apiKey || getProviderApiKey(provider);
  }

  /**
   * Met a jour la configuration
   */
  updateConfig(updates: Partial<ChatbotConfig>) {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Recupere la configuration actuelle
   */
  getConfig(): ChatbotConfig {
    return { ...this.config };
  }
}

// Instance singleton par defaut
export const defaultChatbotService = new ChatbotApiService(defaultConfig.provider);

/**
 * Hook pour creer ou recuperer une instance du service
 */
export function createChatbotService(
  provider: ChatbotProvider = defaultConfig.provider,
  apiKey?: string
): ChatbotApiService {
  return new ChatbotApiService(provider, apiKey);
}
