/**
 * Service API abstrait pour les chatbots
 * Facilite l'intégration de différents providers (OpenAI, Anthropic, Gemini)
 */

import {
  ChatbotProvider,
  ChatbotConfig,
  ChatMessage,
  getProviderConfig,
  providerEndpoints,
  formatMessagesForProvider
} from './chatbotConfig';

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
 * Service principal pour les requêtes chatbot
 */
export class ChatbotApiService {
  private config: ChatbotConfig;
  private provider: ChatbotProvider;

  constructor(provider: ChatbotProvider = 'mock', apiKey?: string) {
    this.provider = provider;
    this.config = getProviderConfig(provider);
    if (apiKey) {
      this.config.apiKey = apiKey;
    }
  }

  /**
   * Envoie un message et reçoit une réponse
   */
  async sendMessage(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // Ajoute le system prompt
    const allMessages: ChatMessage[] = [
      { role: 'system', content: this.config.systemPrompt },
      ...request.messages
    ];

    try {
      switch (this.provider) {
        case 'openai':
          return await this.callOpenAI(allMessages, request);
        case 'anthropic':
          return await this.callAnthropic(allMessages, request);
        case 'gemini':
          return await this.callGemini(allMessages, request);
        default:
          return await this.callMockAPI(allMessages, request);
      }
    } catch (error) {
      console.error('Chatbot API error:', error);
      throw error;
    }
  }

  /**
   * Appel à l'API OpenAI
   */
  private async callOpenAI(
    messages: ChatMessage[],
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
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
      throw new Error(`OpenAI API error: ${response.statusText}`);
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
   * Appel à l'API Anthropic Claude
   */
  private async callAnthropic(
    messages: ChatMessage[],
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const formatted = formatMessagesForProvider(messages, 'anthropic');
    
    const response = await fetch(providerEndpoints.anthropic, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey!,
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
      throw new Error(`Anthropic API error: ${response.statusText}`);
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
   * Appel à l'API Google Gemini
   */
  private async callGemini(
    messages: ChatMessage[],
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
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
      throw new Error(`Gemini API error: ${response.statusText}`);
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
   * Mock API pour le mode démo (utilise le service existant)
   */
  private async callMockAPI(
    messages: ChatMessage[],
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    // Utilise la logique existante du chatbotService
    const { generateResponse } = await import('./chatbotService');
    const userMessage = messages[messages.length - 1].content;
    const context = {
      userRole: 'student',
      currentPage: window.location.pathname,
      conversationHistory: messages.slice(0, -1)
    };

    const response = await generateResponse(userMessage, context);
    
    return {
      content: response.response,
      finishReason: 'stop',
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      }
    };
  }

  /**
   * Change le provider à la volée
   */
  switchProvider(provider: ChatbotProvider, apiKey?: string) {
    this.provider = provider;
    this.config = getProviderConfig(provider);
    if (apiKey) {
      this.config.apiKey = apiKey;
    }
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(updates: Partial<ChatbotConfig>) {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Récupère la configuration actuelle
   */
  getConfig(): ChatbotConfig {
    return { ...this.config };
  }
}

// Instance singleton par défaut (mode mock)
export const defaultChatbotService = new ChatbotApiService('mock');

/**
 * Hook pour créer ou récupérer une instance du service
 */
export function createChatbotService(
  provider: ChatbotProvider = 'mock',
  apiKey?: string
): ChatbotApiService {
  return new ChatbotApiService(provider, apiKey);
}
