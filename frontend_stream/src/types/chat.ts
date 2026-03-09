export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: Date;
  
  // Message type
  type: 'message' | 'question' | 'announcement' | 'system';
  isFromTeacher: boolean;
  isQuestion: boolean;
  
  // Moderation
  isPinned?: boolean;
  isHighlighted?: boolean;
  isFlagged?: boolean;
  isModerated?: boolean;
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationReason?: string;
  
  // Reactions
  reactions?: Record<string, ChatReaction[]>;
  userReaction?: string;
  
  // Threading
  parentId?: string; // For replies
  replies?: ChatMessage[];
  replyCount?: number;
  
  // Rich content
  attachments?: ChatAttachment[];
  mentions?: string[]; // User IDs mentioned
  links?: ChatLink[];
  
  // Metadata
  editedAt?: Date;
  deletedAt?: Date;
  isEdited: boolean;
  isDeleted: boolean;
}

export interface ChatReaction {
  id: string;
  type: 'like' | 'heart' | 'laugh' | 'angry' | 'sad' | 'surprised';
  userId: string;
  username: string;
  timestamp: Date;
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'link';
  name: string;
  url: string;
  size: number; // bytes
  mimeType: string;
  thumbnail?: string;
  
  // Media metadata
  width?: number;
  height?: number;
  duration?: number; // seconds for video/audio
}

export interface ChatLink {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain: string;
}

export interface ChatSettings {
  enableChat: boolean;
  allowStudentMessages: boolean;
  allowQuestions: boolean;
  requireModeration: boolean;
  allowEmojis: boolean;
  allowReactions: boolean;
  allowReplies: boolean;
  allowAttachments: boolean;
  allowLinks: boolean;
  
  // Rate limiting
  slowMode: number; // seconds between messages
  maxMessageLength: number;
  maxMessagesPerMinute: number;
  
  // Content filtering
  bannedWords: string[];
  autoDeleteSpam: boolean;
  autoModerateProfanity: boolean;
  
  // Notifications
  notifyOnMessage: boolean;
  notifyOnQuestion: boolean;
  notifyOnMention: boolean;
  notifyOnReaction: boolean;
  
  // Display
  showTimestamps: boolean;
  showAvatars: boolean;
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface ChatParticipant {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  role: 'teacher' | 'student' | 'moderator';
  
  // Status
  isOnline: boolean;
  lastSeen: Date;
  joinTime: Date;
  
  // Permissions
  canSendMessages: boolean;
  canReact: boolean;
  canReply: boolean;
  canMention: boolean;
  canShareAttachments: boolean;
  
  // Moderation
  isMuted: boolean;
  mutedUntil?: Date;
  isBanned: boolean;
  bannedUntil?: Date;
  warningCount: number;
  
  // Activity
  messageCount: number;
  lastMessageAt?: Date;
  
  // Typing indicator
  isTyping: boolean;
  typingStartTime?: Date;
}

export interface ChatModerationAction {
  id: string;
  type: 'warn' | 'mute' | 'ban' | 'delete_message' | 'flag_message' | 'timeout';
  targetUserId?: string;
  targetMessageId?: string;
  moderatorId: string;
  moderatorName: string;
  reason: string;
  timestamp: Date;
  
  // Action details
  duration?: number; // minutes for mute/ban/timeout
  isReversible: boolean;
  reversedAt?: Date;
  reversedBy?: string;
  
  // Notification
  notifyUser: boolean;
  publicAnnouncement: boolean;
}

export interface ChatFilter {
  type: 'all' | 'messages' | 'questions' | 'announcements' | 'flagged' | 'pinned';
  user?: string; // Filter by specific user
  timeRange?: {
    start: Date;
    end: Date;
  };
  hasAttachments?: boolean;
  hasReactions?: boolean;
  minReactions?: number;
}

export interface ChatAnalytics {
  sessionId: string;
  
  // Message stats
  totalMessages: number;
  messagesPerMinute: number;
  peakActivity: Date;
  
  // User engagement
  activeParticipants: number;
  messageDistribution: Record<string, number>; // userId -> message count
  averageMessageLength: number;
  
  // Content analysis
  questionsCount: number;
  reactionsCount: number;
  attachmentsCount: number;
  linksShared: number;
  
  // Moderation stats
  flaggedMessages: number;
  deletedMessages: number;
  mutedUsers: number;
  bannedUsers: number;
  
  // Popular content
  mostReactedMessages: ChatMessage[];
  mostActiveUsers: string[];
  commonWords: Record<string, number>;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface ChatExport {
  sessionId: string;
  sessionTitle: string;
  exportedAt: Date;
  exportedBy: string;
  
  // Export options
  includeDeleted: boolean;
  includeModerated: boolean;
  includeSystemMessages: boolean;
  includeReactions: boolean;
  includeAttachments: boolean;
  
  // Data
  messages: ChatMessage[];
  participants: ChatParticipant[];
  moderationActions: ChatModerationAction[];
  analytics: ChatAnalytics;
  
  // Metadata
  totalMessages: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  fileSize: number; // bytes
  format: 'json' | 'csv' | 'pdf' | 'html';
}