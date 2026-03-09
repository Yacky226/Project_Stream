export interface StreamingSession {
  id: string;
  courseId: string;
  title: string;
  description: string;
  status: 'pending' | 'starting' | 'live' | 'stopping' | 'stopped' | 'error';
  startTime?: Date;
  endTime?: Date;
  scheduledStartTime?: Date;
  viewerCount: number;
  maxViewers: number;
  settings: StreamingSettings;
  stats?: StreamingStats;
  recordingUrl?: string;
  thumbnailUrl?: string;
  
  // Host information
  hostId: string;
  hostName: string;
  
  // Access control
  isPrivate: boolean;
  accessCode?: string;
  allowedUsers?: string[];
}

export interface StreamingSettings {
  quality: 'HD' | 'FHD' | '4K';
  allowChat: boolean;
  allowQA: boolean;
  allowHandRaise: boolean;
  recordSession: boolean;
  maxViewers: number;
  isPrivate: boolean;
  
  // Chat settings
  chatModeration: boolean;
  slowMode: number; // seconds
  chatMemberOnly: boolean;
  
  // Interaction settings
  allowScreenShare: boolean;
  allowParticipantVideo: boolean;
  allowParticipantAudio: boolean;
  handRaiseTimeout: number; // minutes
  speakingTimeLimit: number; // seconds
}

export interface StreamingStats {
  duration: number; // seconds
  peakViewers: number;
  averageViewers: number;
  totalViews: number;
  uniqueViewers: number;
  
  // Technical stats
  bitrate: number; // kbps
  fps: number;
  resolution: string;
  latency: number; // ms
  packetsLost: number;
  qualityScore: 'excellent' | 'good' | 'poor';
  
  // Engagement stats
  chatMessages: number;
  handRaises: number;
  questionsAsked: number;
  avgWatchTime: number; // seconds
  dropOffRate: number; // percentage
}

export interface Participant {
  id: string;
  userId: string;
  username: string;
  role: 'host' | 'co-host' | 'participant';
  avatar?: string;
  
  // Media state
  isVideoOn: boolean;
  isAudioOn: boolean;
  isSharingScreen: boolean;
  
  // Permissions
  canSpeak: boolean;
  canShareScreen: boolean;
  canModerateChat: boolean;
  isMutedByHost: boolean;
  isBannedFromChat: boolean;
  
  // Status
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
  joinTime: Date;
  lastSeen: Date;
  
  // Hand raise
  hasHandRaised: boolean;
  handRaiseTime?: Date;
  handRaiseReason?: string;
  
  // Speaking time
  speakingTimeRemaining: number; // seconds
  totalSpeakingTime: number; // seconds
}

export interface HandRaise {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  timestamp: Date;
  reason?: string;
  category: 'question' | 'comment' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'denied' | 'expired';
  isUrgent?: boolean;
  
  // Response
  approvedBy?: string;
  approvedAt?: Date;
  speakingTimeGranted?: number; // seconds
  deniedReason?: string;
}

export interface StreamingDevice {
  id: string;
  type: 'camera' | 'microphone' | 'speaker';
  name: string;
  deviceId: string;
  isDefault: boolean;
  isActive: boolean;
  
  // Device capabilities
  capabilities?: {
    video?: {
      maxResolution: string;
      maxFrameRate: number;
      supportedCodecs: string[];
    };
    audio?: {
      maxSampleRate: number;
      channelCount: number;
      supportedCodecs: string[];
      echoCancellation: boolean;
      noiseSuppression: boolean;
    };
  };
}

export interface StreamingQuality {
  label: string;
  width: number;
  height: number;
  frameRate: number;
  bitrate: number; // kbps
  codec: string;
}

export interface ConnectionStats {
  ping: number; // ms
  jitter: number; // ms
  packetLoss: number; // percentage
  bitrate: {
    upstream: number; // kbps
    downstream: number; // kbps
  };
  quality: 'excellent' | 'good' | 'poor';
  
  // WebRTC stats
  bytesSent: number;
  bytesReceived: number;
  framesEncoded: number;
  framesDecoded: number;
  framesDropped: number;
}

export interface StreamingError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
  timestamp: Date;
  isRecoverable: boolean;
  suggestedAction?: string;
}

export interface RecordingInfo {
  id: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  fileSize: number; // bytes
  format: string;
  quality: string;
  status: 'recording' | 'processing' | 'ready' | 'failed';
  downloadUrl?: string;
  thumbnailUrl?: string;
  
  // Processing info
  processingProgress?: number; // percentage
  processingError?: string;
}

export interface StreamingNotification {
  id: string;
  type: 'participant_joined' | 'participant_left' | 'hand_raised' | 'chat_message' | 'technical_issue' | 'recording_started' | 'recording_stopped';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high';
  data?: any;
  acknowledged?: boolean;
}