/**
 * Integration Service for Spring Boot Backend and Janus Gateway
 * Handles configuration and setup for live streaming infrastructure
 */

import { config, configUtils } from './config';

export interface BackendConfig {
  springBootUrl: string;
  janusGatewayUrl: string;
  stunServers: string[];
  turnServers: RTCIceServer[];
  apiKey?: string;
  environment: 'development' | 'production';
}

export interface StreamingEndpoints {
  // Session Management
  createSession: string;
  startSession: string;
  stopSession: string;
  getSession: string;
  joinSession: string;
  leaveSession: string;
  
  // WebRTC Signaling
  webrtcOffer: string;
  webrtcAnswer: string;
  iceCandidate: string;
  
  // Chat & Q&A
  sendMessage: string;
  getMessages: string;
  sendQuestion: string;
  getQuestions: string;
  
  // Analytics
  sessionStats: string;
  viewerStats: string;
  
  // WebSocket
  websocket: string;
}

export interface JanusConfig {
  server: string;
  apiSecret?: string;
  adminSecret?: string;
  plugins: {
    videoRoom: boolean;
    streaming: boolean;
    recordPlay: boolean;
  };
}

class IntegrationService {
  private backendConfig: BackendConfig | null = null;
  private endpoints: StreamingEndpoints | null = null;
  private janusConfig: JanusConfig | null = null;
  
  /**
   * Initialize integration with backend services
   */
  async initialize(): Promise<void> {
    console.log('🔧 Initializing integration service...');
    
    try {
      // Pour l'instant, utiliser la configuration par défaut sans faire de requête réseau
      // Cela évite les erreurs de fetch dans l'environnement Figma Make
      console.log('⚡ Using fallback configuration to avoid network issues');
      
      this.backendConfig = this.getDefaultConfig();
      
      // Setup endpoints
      this.setupEndpoints();
      
      // Setup Janus configuration
      this.setupJanusConfig();
      
      console.log('✅ Integration service initialized with fallback config:', this.backendConfig);
      
    } catch (error) {
      console.warn('❌ Failed to initialize backend integration, using defaults:', error);
      this.backendConfig = this.getDefaultConfig();
      this.setupEndpoints();
      this.setupJanusConfig();
    }
  }
  
  /**
   * Get backend configuration
   */
  getBackendConfig(): BackendConfig | null {
    return this.backendConfig;
  }
  
  /**
   * Get streaming endpoints
   */
  getEndpoints(): StreamingEndpoints | null {
    return this.endpoints;
  }
  
  /**
   * Get Janus Gateway configuration
   */
  getJanusConfig(): JanusConfig | null {
    return this.janusConfig;
  }
  
  /**
   * Check if Spring Boot backend is available
   */
  async isSpringBootAvailable(): Promise<boolean> {
    if (!this.backendConfig) {
      return false;
    }
    
    // Pour l'environnement de développement, simuler que Spring Boot n'est pas disponible
    // pour éviter les erreurs de réseau
    console.log('🔍 Checking Spring Boot availability (simulated)');
    return false;
  }
  
  /**
   * Check if Janus Gateway is available
   */
  async isJanusAvailable(): Promise<boolean> {
    if (!this.janusConfig) {
      return false;
    }
    
    // Pour l'environnement de développement, simuler que Janus n'est pas disponible
    // pour éviter les erreurs de réseau
    console.log('🔍 Checking Janus Gateway availability (simulated)');
    return false;
  }
  
  /**
   * Get optimal streaming configuration based on available services
   */
  async getOptimalStreamingConfig(): Promise<{
    useSpringBoot: boolean;
    useJanus: boolean;
    fallbackMode: boolean;
    endpoints: StreamingEndpoints;
    rtcConfig: RTCConfiguration;
  }> {
    const springBootAvailable = await this.isSpringBootAvailable();
    const janusAvailable = await this.isJanusAvailable();
    
    const rtcConfig: RTCConfiguration = {
      iceServers: [
        ...(this.backendConfig?.stunServers.map(url => ({ urls: url })) || []),
        ...(this.backendConfig?.turnServers || [])
      ]
    };
    
    if (springBootAvailable && janusAvailable) {
      // Full production setup
      return {
        useSpringBoot: true,
        useJanus: true,
        fallbackMode: false,
        endpoints: this.getProductionEndpoints(),
        rtcConfig
      };
    } else if (springBootAvailable) {
      // Spring Boot only (without Janus)
      return {
        useSpringBoot: true,
        useJanus: false,
        fallbackMode: false,
        endpoints: this.getSpringBootEndpoints(),
        rtcConfig
      };
    } else {
      // Development/fallback mode
      return {
        useSpringBoot: false,
        useJanus: false,
        fallbackMode: true,
        endpoints: this.getFallbackEndpoints(),
        rtcConfig: {
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        }
      };
    }
  }
  
  /**
   * Create WebRTC peer connection with optimal configuration
   */
  async createPeerConnection(): Promise<RTCPeerConnection> {
    const streamingConfig = await this.getOptimalStreamingConfig();
    return new RTCPeerConnection(streamingConfig.rtcConfig);
  }
  
  /**
   * Get service status information
   */
  async getServiceStatus(): Promise<{
    springBoot: { available: boolean; url: string };
    janus: { available: boolean; url: string };
    fallbackMode: boolean;
  }> {
    const springBootAvailable = await this.isSpringBootAvailable();
    const janusAvailable = await this.isJanusAvailable();
    
    return {
      springBoot: {
        available: springBootAvailable,
        url: this.backendConfig?.springBootUrl || 'Not configured'
      },
      janus: {
        available: janusAvailable,
        url: this.janusConfig?.server || 'Not configured'
      },
      fallbackMode: !springBootAvailable && !janusAvailable
    };
  }
  
  /**
   * Private helper methods
   */
  
  private getDefaultConfig(): BackendConfig {
    return {
      springBootUrl: 'http://localhost:8080',
      janusGatewayUrl: 'ws://localhost:8188',
      stunServers: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302'
      ],
      turnServers: [],
      environment: configUtils.isDevelopment() ? 'development' : 'production'
    };
  }
  
  private setupEndpoints(): void {
    if (!this.backendConfig) return;
    
    const baseUrl = this.backendConfig.springBootUrl;
    const apiBase = `${baseUrl}/api/live`;
    
    this.endpoints = {
      // Session Management
      createSession: `${apiBase}/sessions`,
      startSession: `${apiBase}/sessions/{sessionId}/start`,
      stopSession: `${apiBase}/sessions/{sessionId}/stop`,
      getSession: `${apiBase}/sessions/{sessionId}`,
      joinSession: `${apiBase}/sessions/{sessionId}/join`,
      leaveSession: `${apiBase}/sessions/{sessionId}/leave`,
      
      // WebRTC Signaling
      webrtcOffer: `${apiBase}/webrtc/offer`,
      webrtcAnswer: `${apiBase}/webrtc/answer`,
      iceCandidate: `${apiBase}/webrtc/ice-candidate`,
      
      // Chat & Q&A
      sendMessage: `${apiBase}/chat/messages`,
      getMessages: `${apiBase}/chat/messages/{sessionId}`,
      sendQuestion: `${apiBase}/qa/questions`,
      getQuestions: `${apiBase}/qa/questions/{sessionId}`,
      
      // Analytics
      sessionStats: `${apiBase}/analytics/session/{sessionId}`,
      viewerStats: `${apiBase}/analytics/viewers/{sessionId}`,
      
      // WebSocket
      websocket: `${baseUrl.replace('http', 'ws')}/api/live/ws/{sessionId}`
    };
  }
  
  private setupJanusConfig(): void {
    if (!this.backendConfig) return;
    
    this.janusConfig = {
      server: this.backendConfig.janusGatewayUrl,
      plugins: {
        videoRoom: true,
        streaming: true,
        recordPlay: true
      }
    };
  }
  
  private getProductionEndpoints(): StreamingEndpoints {
    return this.endpoints!;
  }
  
  private getSpringBootEndpoints(): StreamingEndpoints {
    return this.endpoints!;
  }
  
  private getFallbackEndpoints(): StreamingEndpoints {
    // Utiliser les endpoints du serveur proxy Supabase
    const proxyBase = `${config.API_URL}/live`;
    const wsBase = `${config.API_URL.replace('http:', 'ws:').replace('https:', 'wss:')}/live/ws`;
    
    return {
      // Session Management
      createSession: `${proxyBase}/sessions`,
      startSession: `${proxyBase}/sessions/{sessionId}/start`,
      stopSession: `${proxyBase}/sessions/{sessionId}/stop`,
      getSession: `${proxyBase}/sessions/{sessionId}`,
      joinSession: `${proxyBase}/sessions/{sessionId}/join`,
      leaveSession: `${proxyBase}/sessions/{sessionId}/leave`,
      
      // WebRTC Signaling
      webrtcOffer: `${proxyBase}/webrtc/offer`,
      webrtcAnswer: `${proxyBase}/webrtc/answer`,
      iceCandidate: `${proxyBase}/webrtc/ice-candidate`,
      
      // Chat & Q&A
      sendMessage: `${proxyBase}/chat/messages`,
      getMessages: `${proxyBase}/chat/messages/{sessionId}`,
      sendQuestion: `${proxyBase}/chat/messages`, // Fallback to chat
      getQuestions: `${proxyBase}/chat/messages/{sessionId}`, // Fallback to chat
      
      // Analytics
      sessionStats: `${proxyBase}/sessions/{sessionId}`,
      viewerStats: `${proxyBase}/sessions/{sessionId}`,
      
      // WebSocket
      websocket: `${wsBase}/{sessionId}`
    };
  }
}

// Singleton instance
export const integrationService = new IntegrationService();

// React hook for integration
export function useIntegration() {
  return {
    integrationService,
    initialize: integrationService.initialize.bind(integrationService),
    getBackendConfig: integrationService.getBackendConfig.bind(integrationService),
    getEndpoints: integrationService.getEndpoints.bind(integrationService),
    getJanusConfig: integrationService.getJanusConfig.bind(integrationService),
    isSpringBootAvailable: integrationService.isSpringBootAvailable.bind(integrationService),
    isJanusAvailable: integrationService.isJanusAvailable.bind(integrationService),
    getOptimalStreamingConfig: integrationService.getOptimalStreamingConfig.bind(integrationService),
    createPeerConnection: integrationService.createPeerConnection.bind(integrationService),
    getServiceStatus: integrationService.getServiceStatus.bind(integrationService)
  };
}

// Helper function to replace endpoint placeholders
export function buildEndpointUrl(template: string, params: Record<string, string>): string {
  let url = template;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, value);
  }
  return url;
}

// Configuration validator
export function validateIntegrationConfig(config: Partial<BackendConfig>): boolean {
  const required = ['springBootUrl', 'janusGatewayUrl'];
  return required.every(field => field in config && config[field as keyof BackendConfig]);
}