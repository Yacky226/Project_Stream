export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  priority: 'low' | 'normal' | 'high';
  
  // Optional data payload
  data?: Record<string, any>;
  
  // Action buttons
  actions?: NotificationAction[];
  
  // Expiry
  expiresAt?: Date;
  
  // Rich content
  imageUrl?: string;
  url?: string; // Navigate to this URL when clicked
  
  // Grouping
  category?: string;
  groupId?: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  style?: 'primary' | 'secondary' | 'destructive';
  url?: string;
}

export interface NotificationSettings {
  push: {
    enabled: boolean;
    courseUpdates: boolean;
    liveStreams: boolean;
    assignments: boolean;
    messages: boolean;
    marketing: boolean;
  };
  email: {
    enabled: boolean;
    dailyDigest: boolean;
    weeklyReport: boolean;
    courseReminders: boolean;
    liveStreamReminders: boolean;
    marketing: boolean;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    courseProgress: boolean;
    socialInteractions: boolean;
  };
  schedule: {
    quietHours: {
      enabled: boolean;
      start: string; // HH:mm format
      end: string; // HH:mm format
    };
    dnd: {
      enabled: boolean;
      until: number | null; // timestamp
    };
  };
}

export interface NotificationFilter {
  type: 'all' | 'unread' | 'read' | string;
  read: 'all' | 'read' | 'unread';
  dateRange: 'all' | 'today' | 'week' | 'month';
  category?: string;
}