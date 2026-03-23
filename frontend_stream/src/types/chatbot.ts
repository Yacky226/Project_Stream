export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number; // Unix timestamp instead of Date
  isTyping?: boolean;
  source?: 'api' | 'fallback';
  provider?: 'openai' | 'anthropic' | 'gemini' | 'mock' | 'local';
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: number; // Unix timestamp instead of Date
  updatedAt: number; // Unix timestamp instead of Date
  context?: {
    userRole: 'student' | 'teacher' | 'admin';
    currentPage?: string;
    courseName?: string;
  };
}

export interface ChatbotState {
  isOpen: boolean;
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isTyping: boolean;
  quickActions: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon?: string;
  action: string;
  roles?: Array<'student' | 'teacher' | 'admin'>;
}

export interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  action?: {
    type: 'navigate' | 'openModal' | 'customAction';
    payload: any;
  };
  source?: 'api' | 'fallback';
  provider?: 'openai' | 'anthropic' | 'gemini' | 'mock' | 'local';
}
