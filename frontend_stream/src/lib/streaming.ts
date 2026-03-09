/**
 * Enhanced Streaming Service for Spring Boot + Janus Gateway Integration
 * Provides high-level streaming functionality with automatic fallbacks
 */

import { apiService } from './api';
import { integrationService, useIntegration } from './integration';
import { webRTCService } from './webrtc';

export interface StreamingSession {
  id: string;
  courseId: string;
  title: string;
  description: string;
  status: 'pending' | 'starting' | 'live' | 'stopping' | 'stopped' | 'error';
  startTime?: Date;
  endTime?: Date;
  viewerCount: number;
  settings: StreamingSettings;
  stats?: StreamingStats;
}

export interface StreamingSettings {
  quality: 'HD' | 'FHD' | '4K';
  allowChat: boolean;
  allowQA: boolean;
  recordSession: boolean;
  maxViewers: number;
  isPrivate: boolean;
}

export interface StreamingStats {
  duration: number;
  peakViewers: number;
  averageViewers: number;
  bitrate: number;
  fps: number;
  resolution: string;
  qualityScore: 'excellent' | 'good' | 'poor';
}

export interface StreamingEvents {
  onStatusChange: (status: StreamingSession['status']) => void;
  onViewerCountChange: (count: number) => void;
  onStatsUpdate: (stats: StreamingStats) => void;
  onChatMessage: (message: any) => void;
  onError: (error: Error) => void;
}

class StreamingService {
  private currentSession: StreamingSession | null = null;
  private isStreaming = false;
  private isViewing = false;
  private webSocket: WebSocket | null = null;
  private events: Partial<StreamingEvents> = {};
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  
  /**
   * Initialize streaming service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing streaming service...');
      
      await apiService.initialize();
      await integrationService.initialize();
      
      console.log('✅ Streaming service initialized successfully');
    } catch (error) {
      console.warn('⚠️ Streaming service initialized with warnings:', error);
      // Continue in fallback mode
    }
  }
  
  /**
   * Register event handlers
   */
  on<K extends keyof StreamingEvents>(event: K, handler: StreamingEvents[K]) {
    this.events[event] = handler;
  }
  
  /**
   * Create a new streaming session
   */
  async createSession(
    courseId: string,
    title: string,
    description: string,
    settings: StreamingSettings
  ): Promise<StreamingSession> {
    try {
      console.log('📝 Creating streaming session...');
      
      // En mode développement, créer une session simulée
      const sessionId = `session-${Date.now()}`;
      
      this.currentSession = {
        id: sessionId,
        courseId,
        title,
        description,
        status: 'pending',
        viewerCount: 0,
        settings
      };
      
      console.log('✅ Session created successfully:', this.currentSession);
      return this.currentSession;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      throw error;
    }
  }
  
  /**
   * Start streaming as instructor
   */
  async startStreaming(
    sessionId: string,
    mediaConstraints?: MediaStreamConstraints
  ): Promise<void> {
    try {
      if (this.isStreaming) {
        throw new Error('Already streaming');
      }
      
      console.log('🎥 Starting streaming session...');
      this.updateSessionStatus('starting');
      
      // Get user media
      const constraints = mediaConstraints || {
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: { echoCancellation: true, noiseSuppression: true }
      };
      
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('📹 Media stream acquired successfully');
      } catch (mediaError) {
        console.warn('⚠️ Could not access media devices:', mediaError);
        // Continue without media stream for demo purposes
      }
      
      // En mode développement, simuler le démarrage
      console.log('🔄 Simulating stream start (development mode)');
      
      this.isStreaming = true;
      this.updateSessionStatus('live');
      
      console.log('✅ Streaming started successfully (simulated)');
      
    } catch (error) {
      console.error('❌ Error starting stream:', error);
      this.updateSessionStatus('error');
      this.events.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Stop streaming
   */
  async stopStreaming(): Promise<void> {
    try {
      if (!this.isStreaming) {
        return;
      }
      
      this.updateSessionStatus('stopping');
      
      // Stop local media tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
      
      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      
      // Close WebSocket
      if (this.webSocket) {
        this.webSocket.close();
        this.webSocket = null;
      }
      
      // Stop session on backend
      if (this.currentSession) {
        await apiService.stopLiveSession(this.currentSession.id);
      }
      
      this.isStreaming = false;
      this.updateSessionStatus('stopped');
      
      console.log('Streaming stopped successfully');
      
    } catch (error) {
      console.error('Error stopping stream:', error);
      this.events.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Join session as viewer
   */
  async joinAsViewer(sessionId: string): Promise<MediaStream> {
    try {
      if (this.isViewing) {
        throw new Error('Already viewing');
      }
      
      console.log('👁️ Joining session as viewer...');
      
      // En mode développement, simuler une connexion de spectateur
      console.log('🔄 Simulating viewer connection (development mode)');
      
      // Créer un stream vide pour la démo
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Session Live Simulée', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText('Mode Développement', canvas.width / 2, canvas.height / 2 + 20);
      }
      
      const stream = canvas.captureStream(30);
      this.remoteStream = stream;
      this.isViewing = true;
      
      console.log('✅ Joined session successfully (simulated)');
      return stream;
      
    } catch (error) {
      console.error('❌ Error joining session:', error);
      this.events.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Leave session as viewer
   */
  async leaveSession(): Promise<void> {
    try {
      if (!this.isViewing) {
        return;
      }
      
      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      
      // Close WebSocket
      if (this.webSocket) {
        this.webSocket.close();
        this.webSocket = null;
      }
      
      // Leave session on backend
      if (this.currentSession) {
        await apiService.leaveLiveSession(this.currentSession.id);
      }
      
      this.isViewing = false;
      this.remoteStream = null;
      
    } catch (error) {
      console.error('Error leaving session:', error);
      this.events.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Toggle video track
   */
  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }
  
  /**
   * Toggle audio track
   */
  toggleAudio(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }
  
  /**
   * Share screen
   */
  async shareScreen(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      // Replace video track
      if (this.peerConnection && this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        const screenTrack = screenStream.getVideoTracks()[0];
        
        const sender = this.peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }
        
        // Update local stream
        this.localStream.removeTrack(videoTrack);
        this.localStream.addTrack(screenTrack);
        
        // Handle screen share end
        screenTrack.onended = async () => {
          if (this.peerConnection && sender) {
            const newVideoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const newVideoTrack = newVideoStream.getVideoTracks()[0];
            await sender.replaceTrack(newVideoTrack);
            
            if (this.localStream) {
              this.localStream.removeTrack(screenTrack);
              this.localStream.addTrack(newVideoTrack);
            }
          }
        };
      }
      
      return screenStream;
      
    } catch (error) {
      console.error('Error sharing screen:', error);
      this.events.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Send chat message
   */
  async sendChatMessage(message: string, isQuestion: boolean = false): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }
    
    await apiService.sendChatMessage(this.currentSession.id, message, isQuestion);
  }
  
  /**
   * Get current session
   */
  getCurrentSession(): StreamingSession | null {
    return this.currentSession;
  }
  
  /**
   * Get streaming status
   */
  getStreamingStatus(): {
    isStreaming: boolean;
    isViewing: boolean;
    sessionId: string | null;
    status: string;
  } {
    return {
      isStreaming: this.isStreaming,
      isViewing: this.isViewing,
      sessionId: this.currentSession?.id || null,
      status: this.currentSession?.status || 'idle'
    };
  }
  
  /**
   * Get service status and configuration
   */
  async getServiceStatus(): Promise<{
    integration: any;
    streaming: any;
  }> {
    const integrationStatus = await integrationService.getServiceStatus();
    const streamingStatus = this.getStreamingStatus();
    
    return {
      integration: integrationStatus,
      streaming: streamingStatus
    };
  }
  
  /**
   * Private helper methods
   */
  
  private setupPeerConnectionHandlers(): void {
    if (!this.peerConnection) return;
    
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
    };
    
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.currentSession) {
        apiService.sendICECandidate(this.currentSession.id, event.candidate);
      }
    };
    
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('Connection state changed:', state);
      
      if (state === 'failed' || state === 'disconnected') {
        this.events.onError?.(new Error(`Connection ${state}`));
      }
    };
  }
  
  private async connectWebSocket(sessionId: string): Promise<void> {
    try {
      this.webSocket = await apiService.connectWebSocket(sessionId);
      
      this.webSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      throw error;
    }
  }
  
  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'viewerCount':
        this.updateViewerCount(data.count);
        break;
      case 'chatMessage':
        this.events.onChatMessage?.(data.message);
        break;
      case 'stats':
        this.events.onStatsUpdate?.(data.stats);
        break;
      default:
        console.log('Unknown WebSocket message:', data);
    }
  }
  
  private async waitForRemoteStream(): Promise<MediaStream> {
    return new Promise((resolve, reject) => {
      if (this.remoteStream) {
        resolve(this.remoteStream);
        return;
      }
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for remote stream'));
      }, 10000);
      
      const checkStream = () => {
        if (this.remoteStream) {
          clearTimeout(timeout);
          resolve(this.remoteStream);
        } else {
          setTimeout(checkStream, 100);
        }
      };
      
      checkStream();
    });
  }
  
  private updateSessionStatus(status: StreamingSession['status']): void {
    if (this.currentSession) {
      this.currentSession.status = status;
      this.events.onStatusChange?.(status);
    }
  }
  
  private updateViewerCount(count: number): void {
    if (this.currentSession) {
      this.currentSession.viewerCount = count;
      this.events.onViewerCountChange?.(count);
    }
  }
  
  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopStreaming();
    this.leaveSession();
  }
}

// Singleton instance
export const streamingService = new StreamingService();

// React hook for streaming
export function useStreaming() {
  return {
    streamingService,
    initialize: streamingService.initialize.bind(streamingService),
    createSession: streamingService.createSession.bind(streamingService),
    startStreaming: streamingService.startStreaming.bind(streamingService),
    stopStreaming: streamingService.stopStreaming.bind(streamingService),
    joinAsViewer: streamingService.joinAsViewer.bind(streamingService),
    leaveSession: streamingService.leaveSession.bind(streamingService),
    toggleVideo: streamingService.toggleVideo.bind(streamingService),
    toggleAudio: streamingService.toggleAudio.bind(streamingService),
    shareScreen: streamingService.shareScreen.bind(streamingService),
    sendChatMessage: streamingService.sendChatMessage.bind(streamingService),
    getCurrentSession: streamingService.getCurrentSession.bind(streamingService),
    getStreamingStatus: streamingService.getStreamingStatus.bind(streamingService),
    getServiceStatus: streamingService.getServiceStatus.bind(streamingService),
  };
}