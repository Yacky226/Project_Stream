import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatbotState, ChatMessage, ChatSession, QuickAction } from '../../types/chatbot';

const initialState: ChatbotState = {
  isOpen: false,
  currentSession: null,
  sessions: [],
  isTyping: false,
  quickActions: [
    { id: '1', label: 'Comment puis-je m\'inscrire à un cours ?', action: 'help_enroll', roles: ['student'] },
    { id: '2', label: 'Où voir mes cours en cours ?', action: 'navigate_courses', roles: ['student'] },
    { id: '3', label: 'Comment créer une session live ?', action: 'help_create_live', roles: ['teacher'] },
    { id: '4', label: 'Voir mes statistiques', action: 'navigate_stats', roles: ['teacher'] },
    { id: '5', label: 'Aide pour les paramètres', action: 'help_settings' },
    { id: '6', label: 'Contacter le support', action: 'contact_support' }
  ]
};

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    toggleChatbot: (state) => {
      state.isOpen = !state.isOpen;
    },
    openChatbot: (state) => {
      state.isOpen = true;
    },
    closeChatbot: (state) => {
      state.isOpen = false;
    },
    startNewSession: (state, action: PayloadAction<{ userId: string; userRole: 'student' | 'teacher' | 'admin'; currentPage?: string }>) => {
      const now = Date.now();
      const newSession: ChatSession = {
        id: `session_${now}`,
        userId: action.payload.userId,
        messages: [
          {
            id: `msg_${now}`,
            content: `Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?`,
            role: 'assistant',
            timestamp: now
          }
        ],
        createdAt: now,
        updatedAt: now,
        context: {
          userRole: action.payload.userRole,
          currentPage: action.payload.currentPage
        }
      };
      state.currentSession = newSession;
      state.sessions.push(newSession);
    },
    addUserMessage: (state, action: PayloadAction<string>) => {
      if (state.currentSession) {
        const now = Date.now();
        const newMessage: ChatMessage = {
          id: `msg_${now}`,
          content: action.payload,
          role: 'user',
          timestamp: now
        };
        state.currentSession.messages.push(newMessage);
        state.currentSession.updatedAt = now;
        state.isTyping = true;
      }
    },
    addAssistantMessage: (state, action: PayloadAction<string>) => {
      if (state.currentSession) {
        const now = Date.now();
        const newMessage: ChatMessage = {
          id: `msg_${now}_asst`,
          content: action.payload,
          role: 'assistant',
          timestamp: now
        };
        state.currentSession.messages.push(newMessage);
        state.currentSession.updatedAt = now;
        state.isTyping = false;
      }
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    loadSession: (state, action: PayloadAction<string>) => {
      const session = state.sessions.find(s => s.id === action.payload);
      if (session) {
        state.currentSession = session;
      }
    }
  }
});

export const {
  toggleChatbot,
  openChatbot,
  closeChatbot,
  startNewSession,
  addUserMessage,
  addAssistantMessage,
  setTyping,
  clearCurrentSession,
  loadSession
} = chatbotSlice.actions;

export default chatbotSlice.reducer;
