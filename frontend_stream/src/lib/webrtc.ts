/**
 * WebRTC Service for Stream Éducatif
 * Handles streaming connections with Spring Boot backend and Janus Gateway
 */

import { config } from './config';

export interface StreamConfig {
  courseId: string;
  sessionId: string;
  title: string;
  description: string;
  quality: 'HD' | 'FHD' | '4K';
  recordSession: boolean;
  maxViewers: number;
}

export interface MediaConstraints {
  video: {
    width: { ideal: number };
    height: { ideal: number };
    frameRate: { ideal: number };
  };
  audio: {
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
  };
}

export interface StreamStats {
  viewers: number;
  duration: number;
  bitrate: number;
  fps: number;
  resolution: string;
  quality: 'excellent' | 'good' | 'poor';
}

export interface WebRTCEvents {
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  onStatsUpdate: (stats: StreamStats) => void;
  onViewerCountUpdate: (count: number) => void;
  onError: (error: Error) => void;
}

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private isStreaming = false;
  private isConnected = false;
  private streamConfig: StreamConfig | null = null;
  private events: Partial<WebRTCEvents> = {};
  private statsInterval: number | null = null;
  
  // Spring Boot backend API base URL
  private readonly API_BASE = config.API_URL;
  
  constructor() {
    this.setupPeerConnection();
  }
  
  /**
   * Setup RTCPeerConnection with STUN/TURN servers
   */
  private setupPeerConnection() {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add your TURN servers here for production
        // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
      ]
    };
    
    this.peerConnection = new RTCPeerConnection(configuration);
    
    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('Connection state changed:', state);
      
      if (state) {
        this.events.onConnectionStateChange?.(state);
        
        if (state === 'connected') {
          this.isConnected = true;
          this.startStatsCollection();
        } else if (state === 'disconnected' || state === 'failed') {
          this.isConnected = false;
          this.stopStatsCollection();
        }
      }
    };
    
    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to Spring Boot backend
        this.sendIceCandidate(event.candidate);
      }
    };
    
    // Handle errors
    this.peerConnection.onicecandidateerror = (event) => {
      console.error('ICE candidate error:', event);
      this.events.onError?.(new Error(`ICE candidate error: ${event.errorText}`));
    };
  }
  
  /**
   * Register event handlers
   */
  public on<K extends keyof WebRTCEvents>(event: K, handler: WebRTCEvents[K]) {
    this.events[event] = handler;
  }
  
  /**
   * Start streaming session
   */
  public async startStreaming(config: StreamConfig, constraints?: Partial<MediaConstraints>): Promise<void> {
    try {
      this.streamConfig = config;
      
      // Get user media
      const mediaConstraints = this.buildMediaConstraints(config.quality, constraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      
      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
      
      // Create offer and set local description
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);
      
      // Send offer to Spring Boot backend
      const response = await this.sendOfferToBackend(offer, config);
      
      if (response.answer) {
        await this.peerConnection!.setRemoteDescription(response.answer);
      }
      
      this.isStreaming = true;
      console.log('Streaming started successfully');
      
    } catch (error) {
      console.error('Error starting stream:', error);
      this.events.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Stop streaming session
   */
  public async stopStreaming(): Promise<void> {
    try {
      // Stop local media tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
      
      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.setupPeerConnection(); // Create new connection for next session
      }
      
      // Notify backend
      if (this.streamConfig) {
        await this.stopStreamingOnBackend();
      }
      
      this.isStreaming = false;
      this.isConnected = false;
      this.stopStatsCollection();
      
      console.log('Streaming stopped successfully');
      
    } catch (error) {
      console.error('Error stopping stream:', error);
      this.events.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Join streaming session as viewer
   */
  public async joinAsViewer(courseId: string, sessionId: string): Promise<MediaStream> {
    try {
      // Create offer to receive stream
      const offer = await this.peerConnection!.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true });
      await this.peerConnection!.setLocalDescription(offer);
      
      // Send offer to backend
      const response = await fetch(`${this.API_BASE}/live/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          courseId,
          sessionId,
          offer: offer
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to join stream: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.answer) {
        await this.peerConnection!.setRemoteDescription(data.answer);
      }
      
      // Return the remote stream once available
      return new Promise((resolve, reject) => {
        this.peerConnection!.ontrack = (event) => {
          resolve(event.streams[0]);
        };
        
        setTimeout(() => {
          reject(new Error('Timeout waiting for remote stream'));
        }, 10000);
      });
      
    } catch (error) {
      console.error('Error joining stream:', error);
      this.events.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Toggle video track
   */
  public toggleVideo(): boolean {
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
  public toggleAudio(): boolean {
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
  public async shareScreen(): Promise<MediaStream> {
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
      }
      
      return screenStream;
      
    } catch (error) {
      console.error('Error sharing screen:', error);
      this.events.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * Get current stream statistics
   */
  public async getStats(): Promise<StreamStats | null> {
    if (!this.peerConnection || !this.isConnected) {
      return null;
    }
    
    try {
      const stats = await this.peerConnection.getStats();
      let bitrate = 0;
      let fps = 0;
      let resolution = '';
      
      stats.forEach((report) => {
        if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
          bitrate = report.bytesSent ? Math.round(report.bytesSent * 8 / 1000) : 0;
          fps = report.framesPerSecond || 0;
          resolution = `${report.frameWidth}x${report.frameHeight}`;
        }
      });
      
      const quality = bitrate > 2000 ? 'excellent' : bitrate > 1000 ? 'good' : 'poor';
      
      return {
        viewers: 0, // Will be updated from backend
        duration: this.isStreaming ? Math.floor((Date.now() - (this.streamConfig?.startTime || Date.now())) / 1000) : 0,
        bitrate,
        fps,
        resolution,
        quality
      };
      
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }
  
  /**
   * Send chat message
   */
  public async sendChatMessage(message: string): Promise<void> {
    if (!this.streamConfig) {
      throw new Error('No active stream session');
    }
    
    try {
      const response = await fetch(`${this.API_BASE}/live/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          sessionId: this.streamConfig.sessionId,
          message
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }
  
  /**
   * Private helper methods
   */
  
  private buildMediaConstraints(quality: string, overrides?: Partial<MediaConstraints>): MediaStreamConstraints {
    const qualitySettings = {
      'HD': { width: 1280, height: 720 },
      'FHD': { width: 1920, height: 1080 },
      '4K': { width: 3840, height: 2160 }
    };
    
    const settings = qualitySettings[quality as keyof typeof qualitySettings] || qualitySettings.HD;
    
    return {
      video: {
        width: { ideal: settings.width },
        height: { ideal: settings.height },
        frameRate: { ideal: 30 },
        ...overrides?.video
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        ...overrides?.audio
      }
    };
  }
  
  private async sendOfferToBackend(offer: RTCSessionDescriptionInit, config: StreamConfig) {
    const response = await fetch(`${this.API_BASE}/live/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({
        ...config,
        offer
      })
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  private async sendIceCandidate(candidate: RTCIceCandidate) {
    try {
      await fetch(`${this.API_BASE}/live/ice-candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          sessionId: this.streamConfig?.sessionId,
          candidate
        })
      });
    } catch (error) {
      console.error('Error sending ICE candidate:', error);
    }
  }
  
  private async stopStreamingOnBackend() {
    try {
      await fetch(`${this.API_BASE}/live/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          sessionId: this.streamConfig?.sessionId
        })
      });
    } catch (error) {
      console.error('Error stopping stream on backend:', error);
    }
  }
  
  private startStatsCollection() {
    this.stopStatsCollection(); // Clear any existing interval
    
    this.statsInterval = setInterval(async () => {
      const stats = await this.getStats();
      if (stats) {
        this.events.onStatsUpdate?.(stats);
      }
    }, 1000);
  }
  
  private stopStatsCollection() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }
  
  private getAuthToken(): string {
    // Get token from auth context or localStorage
    return (typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null) || '';
  }
  
  /**
   * Cleanup resources
   */
  public cleanup() {
    this.stopStreaming();
    this.stopStatsCollection();
  }
}

// Singleton instance
export const webRTCService = new WebRTCService();

// React hook for WebRTC
export function useWebRTC() {
  return {
    webRTCService,
    startStreaming: webRTCService.startStreaming.bind(webRTCService),
    stopStreaming: webRTCService.stopStreaming.bind(webRTCService),
    joinAsViewer: webRTCService.joinAsViewer.bind(webRTCService),
    toggleVideo: webRTCService.toggleVideo.bind(webRTCService),
    toggleAudio: webRTCService.toggleAudio.bind(webRTCService),
    shareScreen: webRTCService.shareScreen.bind(webRTCService),
    sendChatMessage: webRTCService.sendChatMessage.bind(webRTCService),
    getStats: webRTCService.getStats.bind(webRTCService)
  };
}