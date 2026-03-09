/**
 * API Service for Stream Éducatif
 * Handles communication with Spring Boot backend
 */

import { config, configUtils } from './config';
import { integrationService, buildEndpointUrl } from './integration';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LiveSession {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  startTime: Date;
  endTime?: Date;
  isLive: boolean;
  viewers: number;
  maxViewers: number;
  settings: SessionSettings;
  streamUrl?: string;
  recordingUrl?: string;
}

export interface SessionSettings {
  allowChat: boolean;
  allowQA: boolean;
  recordSession: boolean;
  isPrivate: boolean;
  quality: 'HD' | 'FHD' | '4K';
  maxViewers: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  username: string;
  userRole: 'student' | 'teacher' | 'moderator';
  message: string;
  timestamp: Date;
  isQuestion: boolean;
}

export interface QAQuestion {
  id: string;
  sessionId: string;
  userId: string;
  username: string;
  question: string;
  timestamp: Date;
  isAnswered: boolean;
  answer?: string;
  answerTimestamp?: Date;
  likes: number;
}

export interface Recording {
  id: string;
  sessionId: string;
  title: string;
  duration: number;
  size: number;
  url: string;
  thumbnailUrl: string;
  createdAt: Date;
  isProcessed: boolean;
}

class ApiService {
  private readonly baseUrl: string;
  private authToken: string | null = null;
  private initialized = false;

  constructor() {
    this.baseUrl = config.API_URL;
    this.authToken = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
  }

  /**
   * Initialize the API service with backend integration
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await integrationService.initialize();
      this.initialized = true;
      console.log('API Service initialized with backend integration');
    } catch (error) {
      console.warn('API Service initialized without backend integration:', error);
      this.initialized = true;
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.authToken = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Generic API request method with smart routing
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Ensure integration is initialized
      await this.initialize();
      
      // Try to get optimal endpoint from integration service
      const streamingConfig = await integrationService.getOptimalStreamingConfig();
      let url: string;
      
      if (streamingConfig.fallbackMode) {
        // Use our proxy server endpoints
        url = this.buildProxyUrl(endpoint);
      } else {
        // Use direct backend endpoints
        url = this.buildBackendUrl(endpoint);
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (data.success !== undefined) {
        return data; // Our proxy format
      } else {
        return { success: true, data }; // Spring Boot format
      }
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Build URL for proxy server endpoints
   */
  private buildProxyUrl(endpoint: string): string {
    // Utiliser directement l'URL de base configurée
    return `${this.baseUrl}${endpoint}`;
  }

  /**
   * Build URL for direct backend endpoints
   */
  private buildBackendUrl(endpoint: string): string {
    const endpoints = integrationService.getEndpoints();
    if (!endpoints) {
      return this.buildProxyUrl(endpoint);
    }
    
    // Map our endpoints to integration endpoints
    const endpointMapping: Record<string, keyof typeof endpoints> = {
      '/live/sessions': 'createSession',
      '/live/webrtc/offer': 'webrtcOffer',
      '/live/webrtc/ice-candidate': 'iceCandidate',
      '/live/chat/messages': 'sendMessage'
    };
    
    const mappedEndpoint = endpointMapping[endpoint];
    if (mappedEndpoint && endpoints[mappedEndpoint]) {
      return endpoints[mappedEndpoint];
    }
    
    // Fallback to proxy
    return this.buildProxyUrl(endpoint);
  }

  /**
   * Live Session API Methods
   */

  /**
   * Create a new live session
   */
  async createLiveSession(sessionData: {
    courseId: string;
    title: string;
    description: string;
    settings: SessionSettings;
  }): Promise<ApiResponse<LiveSession>> {
    return this.request<LiveSession>('/live/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  /**
   * Start a live session
   */
  async startLiveSession(sessionId: string, webrtcOffer?: RTCSessionDescriptionInit): Promise<ApiResponse<{ streamUrl: string; answer?: RTCSessionDescriptionInit }>> {
    return this.request<{ streamUrl: string; answer?: RTCSessionDescriptionInit }>(`/live/sessions/${sessionId}/start`, {
      method: 'POST',
      body: webrtcOffer ? JSON.stringify({ offer: webrtcOffer }) : undefined,
    });
  }

  /**
   * Stop a live session
   */
  async stopLiveSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/live/sessions/${sessionId}/stop`, {
      method: 'POST',
    });
  }

  /**
   * Get live session details
   */
  async getLiveSession(sessionId: string): Promise<ApiResponse<LiveSession>> {
    return this.request<LiveSession>(`/live/sessions/${sessionId}`);
  }

  /**
   * Get active live sessions
   */
  async getActiveLiveSessions(): Promise<ApiResponse<LiveSession[]>> {
    return this.request<LiveSession[]>('/live/sessions/active');
  }

  /**
   * Get live sessions for a course
   */
  async getCourseLiveSessions(courseId: string): Promise<ApiResponse<LiveSession[]>> {
    return this.request<LiveSession[]>(`/live/sessions/course/${courseId}`);
  }

  /**
   * Join a live session as viewer
   */
  async joinLiveSession(sessionId: string, webrtcOffer?: RTCSessionDescriptionInit): Promise<ApiResponse<{ streamUrl: string; answer?: RTCSessionDescriptionInit }>> {
    return this.request<{ streamUrl: string; answer?: RTCSessionDescriptionInit }>(`/live/sessions/${sessionId}/join`, {
      method: 'POST',
      body: webrtcOffer ? JSON.stringify({ offer: webrtcOffer }) : undefined,
    });
  }

  /**
   * Leave a live session
   */
  async leaveLiveSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/live/sessions/${sessionId}/leave`, {
      method: 'POST',
    });
  }

  /**
   * Update session settings
   */
  async updateSessionSettings(
    sessionId: string,
    settings: Partial<SessionSettings>
  ): Promise<ApiResponse<LiveSession>> {
    return this.request<LiveSession>(`/live/sessions/${sessionId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  /**
   * Chat API Methods
   */

  /**
   * Send chat message
   */
  async sendChatMessage(
    sessionId: string,
    message: string,
    isQuestion: boolean = false
  ): Promise<ApiResponse<ChatMessage>> {
    return this.request<ChatMessage>('/live/chat/messages', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        message,
        isQuestion,
      }),
    });
  }

  /**
   * Get chat messages for a session
   */
  async getChatMessages(sessionId: string, limit: number = 50): Promise<ApiResponse<ChatMessage[]>> {
    return this.request<ChatMessage[]>(`/live/chat/messages/${sessionId}?limit=${limit}`);
  }

  /**
   * Delete chat message (moderator only)
   */
  async deleteChatMessage(messageId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/live/chat/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Q&A API Methods
   */

  /**
   * Submit a question
   */
  async submitQuestion(sessionId: string, question: string): Promise<ApiResponse<QAQuestion>> {
    return this.request<QAQuestion>('/live/qa/questions', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        question,
      }),
    });
  }

  /**
   * Answer a question (teacher only)
   */
  async answerQuestion(questionId: string, answer: string): Promise<ApiResponse<QAQuestion>> {
    return this.request<QAQuestion>(`/live/qa/questions/${questionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }

  /**
   * Like/unlike a question
   */
  async toggleQuestionLike(questionId: string): Promise<ApiResponse<{ liked: boolean; likes: number }>> {
    return this.request<{ liked: boolean; likes: number }>(`/live/qa/questions/${questionId}/like`, {
      method: 'POST',
    });
  }

  /**
   * Get questions for a session
   */
  async getSessionQuestions(sessionId: string): Promise<ApiResponse<QAQuestion[]>> {
    return this.request<QAQuestion[]>(`/live/qa/questions/${sessionId}`);
  }

  /**
   * Recording API Methods
   */

  /**
   * Get recordings for a session
   */
  async getSessionRecordings(sessionId: string): Promise<ApiResponse<Recording[]>> {
    return this.request<Recording[]>(`/live/recordings/session/${sessionId}`);
  }

  /**
   * Get recording details
   */
  async getRecording(recordingId: string): Promise<ApiResponse<Recording>> {
    return this.request<Recording>(`/live/recordings/${recordingId}`);
  }

  /**
   * Delete a recording
   */
  async deleteRecording(recordingId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/live/recordings/${recordingId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get download URL for recording
   */
  async getRecordingDownloadUrl(recordingId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>(`/live/recordings/${recordingId}/download`);
  }

  /**
   * Analytics API Methods
   */

  /**
   * Get session analytics
   */
  async getSessionAnalytics(sessionId: string): Promise<ApiResponse<{
    totalViewers: number;
    peakViewers: number;
    averageViewTime: number;
    chatMessages: number;
    questions: number;
    viewerCountHistory: { timestamp: Date; count: number }[];
  }>> {
    return this.request(`/live/analytics/session/${sessionId}`);
  }

  /**
   * Get instructor analytics
   */
  async getInstructorAnalytics(instructorId: string, period: '7d' | '30d' | '90d' = '30d'): Promise<ApiResponse<{
    totalSessions: number;
    totalViewers: number;
    averageRating: number;
    totalHours: number;
    topCourses: { courseId: string; title: string; viewers: number }[];
  }>> {
    return this.request(`/live/analytics/instructor/${instructorId}?period=${period}`);
  }

  /**
   * WebRTC Signaling Methods
   */

  /**
   * Send WebRTC offer
   */
  async sendWebRTCOffer(sessionId: string, offer: RTCSessionDescriptionInit): Promise<ApiResponse<{
    answer: RTCSessionDescriptionInit;
  }>> {
    return this.request('/live/webrtc/offer', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        offer,
      }),
    });
  }

  /**
   * Send WebRTC answer
   */
  async sendWebRTCAnswer(sessionId: string, answer: RTCSessionDescriptionInit): Promise<ApiResponse<void>> {
    return this.request('/live/webrtc/answer', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        answer,
      }),
    });
  }

  /**
   * Send ICE candidate
   */
  async sendICECandidate(sessionId: string, candidate: RTCIceCandidateInit): Promise<ApiResponse<void>> {
    return this.request('/live/webrtc/ice-candidate', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        candidate,
      }),
    });
  }

  /**
   * WebSocket connection for real-time updates with smart routing
   */
  async connectWebSocket(sessionId: string): Promise<WebSocket> {
    // Ensure integration is initialized
    await this.initialize();
    
    // Construire l'URL WebSocket
    const wsUrl = `${this.baseUrl.replace('https:', 'wss:').replace('http:', 'ws:')}/live/ws/${sessionId}`;
    
    console.log('Connecting WebSocket to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected for session:', sessionId);
      // Send authentication
      if (this.authToken) {
        ws.send(JSON.stringify({
          type: 'auth',
          token: this.authToken,
        }));
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected for session:', sessionId);
    };

    return ws;
  }
}

// Singleton instance
export const apiService = new ApiService();

// React hook for API with integration support
export function useApi() {
  return {
    apiService,
    initialize: apiService.initialize.bind(apiService),
    createLiveSession: apiService.createLiveSession.bind(apiService),
    startLiveSession: apiService.startLiveSession.bind(apiService),
    stopLiveSession: apiService.stopLiveSession.bind(apiService),
    getLiveSession: apiService.getLiveSession.bind(apiService),
    getActiveLiveSessions: apiService.getActiveLiveSessions.bind(apiService),
    getCourseLiveSessions: apiService.getCourseLiveSessions.bind(apiService),
    joinLiveSession: apiService.joinLiveSession.bind(apiService),
    leaveLiveSession: apiService.leaveLiveSession.bind(apiService),
    sendChatMessage: apiService.sendChatMessage.bind(apiService),
    getChatMessages: apiService.getChatMessages.bind(apiService),
    submitQuestion: apiService.submitQuestion.bind(apiService),
    answerQuestion: apiService.answerQuestion.bind(apiService),
    getSessionRecordings: apiService.getSessionRecordings.bind(apiService),
    connectWebSocket: apiService.connectWebSocket.bind(apiService),
    sendWebRTCOffer: apiService.sendWebRTCOffer.bind(apiService),
    sendWebRTCAnswer: apiService.sendWebRTCAnswer.bind(apiService),
    sendICECandidate: apiService.sendICECandidate.bind(apiService),
  };
}